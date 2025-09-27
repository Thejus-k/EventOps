    from __future__ import annotations

    import os
    import re
    import io
    import zipfile
    import logging
    from dataclasses import dataclass
    from typing import Dict, List, Optional, Tuple

    import fitz  # PyMuPDF
    import pandas as pd

    # Detect tags even if there is whitespace inside: {{ name }}, {{Name}}, {{name}}
    TAG_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")

    # Starting font sizes. We auto-shrink if needed.
    DEFAULT_START_SIZES = {"name": 48.0, "event": 32.0, "role": 26.0}
    # Minimal target widths (points) if we cannot infer from neighbors.
    DEFAULT_MIN_WIDTHS = {"name": 420.0, "event": 360.0, "role": 300.0}

    LEFT_MARGIN = 2.0
    RIGHT_MARGIN = 2.0


    @dataclass
    class FillOptions:
        output_dir: str = "output"
        filename_pattern: str = "{event}_{name}.pdf"
        tag_map: Dict[str, str] = None          # e.g., {"Name": "name", "Role": "role", "Event": "event"}
        align: int = 1                           # 0=left, 1=center, 2=right, 3=justify (used for standalone fields)
        bg_rgb: Tuple[float, float, float] = (1.0, 1.0, 1.0)
        sheet_name: Optional[str] = None
        save_to_disk: bool = True
        create_event_subdir: bool = True
        debug: bool = False


    # ------------- Utility / Logging -------------

    logger = logging.getLogger("pdf-tag-filler")
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(levelname)s] %(message)s"))
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)  # Default; set to DEBUG when --debug


    def _ensure_dir(path: str) -> None:
        os.makedirs(path, exist_ok=True)


    def _hex_to_rgb_tuple(hex_color: str) -> Tuple[float, float, float]:
        s = hex_color.strip().lstrip("#")
        if not re.fullmatch(r"[0-9A-Fa-f]{6}", s):
            raise ValueError(f"Bad hex color: {hex_color}")
        r = int(s[0:2], 16) / 255.0
        g = int(s[2:4], 16) / 255.0
        b = int(s[4:6], 16) / 255.0
        return (r, g, b)


    def _coerce_sheet_arg(sheet: Optional[str]) -> object:
        """None -> 0 (first sheet). '0' -> 0. Names remain names."""
        if sheet is None:
            return 0
        try:
            return int(sheet)
        except (TypeError, ValueError):
            return sheet


    def _get_words(page: fitz.Page):
        """Return words as tuples: (x0, y0, x1, y1, text, block_no, line_no, word_no)."""
        return page.get_text("words")


    def _get_lines(page: fitz.Page) -> List[dict]:
        """Return line dicts with 'bbox' and 'spans' using page.get_text('dict')."""
        d = page.get_text("dict")
        out = []
        for b in d.get("blocks", []):
            for ln in b.get("lines", []):
                out.append(ln)
        return out


    def _find_line_for_rect(page: fitz.Page, rect: fitz.Rect) -> Optional[dict]:
        """Find the line dict whose bbox intersects the rect the most."""
        lines = _get_lines(page)
        best = None
        best_iou = 0.0
        for ln in lines:
            lb = fitz.Rect(*ln["bbox"])
            if not lb.intersects(rect):
                continue
            inter = rect & lb
            iou = (inter.width * inter.height) / max(1e-6, rect.width * rect.height)
            if iou > best_iou:
                best_iou = iou
                best = ln
        return best


    def _measure_fits(page: fitz.Page, text: str, rect: fitz.Rect, fontname: str, fontsize: float) -> bool:
        if not text:
            return True
        if hasattr(page, "get_text_length"):
            width = page.get_text_length(text, fontname=fontname, fontsize=fontsize)
        else:
            width = fitz.get_text_length(text, fontname=fontname, fontsize=fontsize)
        return width <= (rect.width - 1.0)


    def _limit_by_height(rect: fitz.Rect, fontsize: float) -> float:
        # Fit to ~90% of the rect height to avoid clipping
        max_by_height = max(6.0, (rect.height * 0.90))
        return min(fontsize, max_by_height)


    def _shrink_to_fit(page: fitz.Page, text: str, rect: fitz.Rect, fontname: str,
                    start_size: float, min_size: float = 8.0) -> float:
        if not text:
            return max(start_size, min_size)
        size = _limit_by_height(rect, max(start_size, min_size))
        while size > min_size and not _measure_fits(page, text, rect, fontname, size):
            size -= 0.5
        if logger.isEnabledFor(logging.DEBUG) and size < start_size:
            logger.debug(f"  - Shrunk '{text}' from {start_size:.1f} -> {size:.1f} to fit {rect}")
        return max(size, min_size)


    def _perceived_luminance(rgb: Tuple[float, float, float]) -> float:
        r, g, b = rgb
        return 0.2126*r + 0.7152*g + 0.0722*b  # 0=black, 1=white


    def _guess_font_from_spans(spans: List[dict]) -> Tuple[Optional[str], Optional[float], Optional[Tuple[float, float, float]]]:
        if not spans:
            return None, None, None
        best = max(spans, key=lambda s: (s.get("size", 0), s.get("bbox", [0,0,0,0])[3] - s.get("bbox", [0,0,0,0])[1]))
        fontname = best.get("font")
        fontsize = float(best.get("size", 12))
        color_int = best.get("color", 0)
        r = (color_int >> 16) & 255
        g = (color_int >> 8) & 255
        b = color_int & 255
        rgb = (r/255.0, g/255.0, b/255.0)
        # Avoid near-white text guesses; default to black for reliability
        if _perceived_luminance(rgb) > 0.85:
            rgb = (0, 0, 0)
        return fontname, fontsize, rgb


    def _best_font_for_family(requested_font_name: Optional[str]) -> str:
        if requested_font_name:
            low = requested_font_name.lower()
            if "courier" in low or "mono" in low or "code" in low:
                return "courier"
            if "times" in low or "serif" in low:
                if "bold" in low and ("italic" in low or "oblique" in low):
                    return "times-bolditalic"
                if "bold" in low:
                    return "times-bold"
                if "italic" in low or "oblique" in low:
                    return "times-italic"
                return "times"
            if "bold" in low and ("italic" in low or "oblique" in low):
                return "helv-boldoblique"
            if "bold" in low:
                return "helv-bold"
            if "italic" in low or "oblique" in low:
                return "helv-oblique"
        return "helv"


    def _find_spans_overlapping(page: fitz.Page, target_rect: fitz.Rect, pad: float = 0.5) -> List[dict]:
        search_rect = fitz.Rect(target_rect.x0 - pad, target_rect.y0 - pad,
                                target_rect.x1 + pad, target_rect.y1 + pad)
        text_dict = page.get_text("dict")
        hits = []
        for block in text_dict.get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    bbox = fitz.Rect(*span["bbox"])
                    if bbox.intersects(search_rect):
                        span["bbox_rect"] = bbox
                        hits.append(span)
        return hits


    def _dedup_rects(rects: List[fitz.Rect], tol: float = 0.5) -> List[fitz.Rect]:
        seen = set()
        uniq = []
        for r in rects:
            key = (round(r.x0 / tol), round(r.y0 / tol), round(r.x1 / tol), round(r.y1 / tol))
            if key not in seen:
                seen.add(key)
                uniq.append(r)
        return uniq


    def _merge_overlapping_rects(rects: List[fitz.Rect], overlap: float = 0.5) -> List[fitz.Rect]:
        """Merge rects that substantially overlap (to prevent double-writes)."""
        if not rects:
            return []
        rects = sorted(rects, key=lambda r: (r.y0, r.x0))
        merged: List[fitz.Rect] = []
        for r in rects:
            placed = False
            for i, m in enumerate(merged):
                inter = r & m
                if inter.width <= 0 or inter.height <= 0:
                    continue
                inter_area = inter.width * inter.height
                min_area = min((r.width * r.height), (m.width * m.height))
                if inter_area / max(1e-6, min_area) >= overlap:
                    merged[i] = fitz.Rect(min(m.x0, r.x0), min(m.y0, r.y0), max(m.x1, r.x1), max(m.y1, r.y1))
                    placed = True
                    break
            if not placed:
                merged.append(r)
        return merged


    def _compute_fill_rect(page: fitz.Page, key: str, tag_rect: fitz.Rect) -> Tuple[fitz.Rect, bool]:
        """Expand the tag rect to a sensible writing region. Return (rect, is_inline)."""
        key_low = key.lower()
        min_width = DEFAULT_MIN_WIDTHS.get(key_low, 300.0)

        line = _find_line_for_rect(page, tag_rect)
        if not line:
            cx = (tag_rect.x0 + tag_rect.x1) / 2.0
            return fitz.Rect(cx - min_width/2, tag_rect.y0, cx + min_width/2, tag_rect.y1), False

        line_bbox = fitz.Rect(*line["bbox"])
        words = _get_words(page)

        def _v_overlap(wbbox: fitz.Rect) -> bool:
            return not (wbbox.y1 <= line_bbox.y0 or wbbox.y0 >= line_bbox.y1)

        line_words = []
        for (x0, y0, x1, y1, wtxt, *_rest) in words:
            wb = fitz.Rect(x0, y0, x1, y1)
            if _v_overlap(wb):
                line_words.append((wb, wtxt))

        left_word = None
        right_word = None
        for wb, _wtxt in line_words:
            if wb.x1 <= tag_rect.x0:
                if (left_word is None) or (wb.x1 > left_word[0].x1):
                    left_word = (wb, _wtxt)
            if wb.x0 >= tag_rect.x1:
                if (right_word is None) or (wb.x0 < right_word[0].x0):
                    right_word = (wb, _wtxt)

        if left_word or right_word:
            x0 = max(line_bbox.x0, (left_word[0].x1 + LEFT_MARGIN) if left_word else (tag_rect.x0 - LEFT_MARGIN))
            x1 = min(line_bbox.x1, (right_word[0].x0 - RIGHT_MARGIN) if right_word else (tag_rect.x1 + min_width))

            # Ensure a generous width, expanding both ways when possible
            need = max(0.0, min_width - (x1 - x0))
            if need > 0:
                expand_left = min(need/2, x0 - line_bbox.x0)
                expand_right = need - expand_left
                x0 -= expand_left
                x1 = min(line_bbox.x1, x1 + expand_right)

            y0 = line_bbox.y0
            y1 = line_bbox.y1
            return fitz.Rect(x0, y0, x1, y1), True

        # Standalone field (use the whole line)
        x0 = line_bbox.x0 + LEFT_MARGIN
        x1 = line_bbox.x1 - RIGHT_MARGIN
        if x1 - x0 < min_width:
            cx = (tag_rect.x0 + tag_rect.x1) / 2.0
            x0 = max(line_bbox.x0, cx - min_width/2)
            x1 = min(line_bbox.x1, cx + min_width/2)
        y0 = line_bbox.y0
        y1 = line_bbox.y1
        return fitz.Rect(x0, y0, x1, y1), False


    def _anchor_fallback(page: fitz.Page, key: str) -> Optional[fitz.Rect]:
        """
        If the template lacks {{Role}}/{{Event}}, compute boxes next to anchors:
        role: after 'contribution as'
        event: after 'during'
        """
        key_low = key.lower()
        if key_low not in ("role", "event"):
            return None

        if key_low == "role":
            hits = page.search_for("contribution as")
            if not hits:
                return None
            anchor = hits[0]
            line = _find_line_for_rect(page, anchor)
            if not line:
                return None
            lb = fitz.Rect(*line["bbox"])
            x0 = anchor.x1 + LEFT_MARGIN
            x1 = lb.x1 - RIGHT_MARGIN
            if x1 - x0 < DEFAULT_MIN_WIDTHS["role"]:
                x1 = min(lb.x1, x0 + DEFAULT_MIN_WIDTHS["role"])
            return fitz.Rect(x0, lb.y0, x1, lb.y1)

        if key_low == "event":
            hits = page.search_for("during")
            if not hits:
                return None
            anchor = hits[0]
            line = _find_line_for_rect(page, anchor)
            if not line:
                return None
            lb = fitz.Rect(*line["bbox"])
            x0 = anchor.x1 + LEFT_MARGIN
            x1 = lb.x1 - RIGHT_MARGIN
            if x1 - x0 < DEFAULT_MIN_WIDTHS["event"]:
                x1 = min(lb.x1, x0 + DEFAULT_MIN_WIDTHS["event"])
            return fitz.Rect(x0, lb.y0, x1, lb.y1)

        return None


    def _erase_regions_with_redaction(page: fitz.Page, rects: List[fitz.Rect], bg_rgb: Tuple[float, float, float]) -> bool:
        """Try to erase via redaction; return True if redaction path used, else False."""
        try:
            for r in rects:
                page.add_redact_annot(r, fill=bg_rgb)
            if hasattr(page, "apply_redactions"):
                page.apply_redactions()
                return True
            return False
        except Exception:
            return False


    def _erase_rect_fill(page: fitz.Page, rect: fitz.Rect, fill_rgb: Tuple[float, float, float]) -> None:
        shape = page.new_shape()
        shape.draw_rect(rect)
        shape.finish(fill=fill_rgb, color=fill_rgb)
        shape.commit()


    def _insert_text(page: fitz.Page, rect: fitz.Rect, text: str, fontname: str, fontsize: float,
                    color: Tuple[float, float, float], align: int) -> None:
        page.insert_textbox(rect, text, fontname=fontname, fontsize=fontsize, color=color, align=align)


    # --------- Robust Placeholder Detection (span-aware) ----------

    def _detect_placeholders_by_spans(page: fitz.Page) -> Dict[str, List[fitz.Rect]]:
        """
        Find placeholders {{ key }} robustly by scanning spans line-by-line.
        Returns: dict { key_lower: [Rect, ...] }.
        This works even if the braces/key are split across multiple spans.
        """
        text_dict = page.get_text("dict")
        results: Dict[str, List[fitz.Rect]] = {}

        for block in text_dict.get("blocks", []):
            for line in block.get("lines", []):
                spans = line.get("spans", [])
                if not spans:
                    continue

                # Concatenate the visible text across spans for this line
                line_text_parts = []
                span_lengths = []
                span_rects = []
                for sp in spans:
                    t = sp.get("text", "")
                    if not t:
                        continue
                    line_text_parts.append(t)
                    span_lengths.append(len(t))
                    span_rects.append(fitz.Rect(*sp["bbox"]))
                if not line_text_parts:
                    continue

                line_text = "".join(line_text_parts)

                # Find all placeholders in this line's text
                for m in TAG_PATTERN.finditer(line_text):
                    key = m.group(1).strip().lower()
                    start, end = m.span()  # char offsets within line_text

                    # Map char range back to the spans it crosses; union their boxes
                    acc = 0
                    bbox_union = None
                    for idx, slen in enumerate(span_lengths):
                        if acc + slen <= start:
                            acc += slen
                            continue
                        if acc >= end:
                            break
                        # This span overlaps the match
                        r = span_rects[idx]
                        bbox_union = r if bbox_union is None else fitz.Rect(
                            min(bbox_union.x0, r.x0), min(bbox_union.y0, r.y0),
                            max(bbox_union.x1, r.x1), max(bbox_union.y1, r.y1)
                        )
                        acc += slen

                    if bbox_union:
                        results.setdefault(key, []).append(bbox_union)

        # Deduplicate & merge overlaps per key
        for k, rects in list(results.items()):
            rects = _dedup_rects(rects, tol=0.5)
            rects = _merge_overlapping_rects(rects, overlap=0.5)
            results[k] = rects
        return results


    # ------------- High-level fill --------------

    def _expand_filename(pattern: str, row: pd.Series) -> str:
        return pattern.format(**{k: str(v) for k, v in row.items()})


    def fill_pdfs(template_path: str, excel_path: str, options: FillOptions) -> List[str]:
        """
        For each row in Excel, generate a personalized PDF from template.
        Returns absolute paths of created files.
        """
        if options.debug:
            logger.setLevel(logging.DEBUG)
            logger.debug("Debug mode ON")

        _ensure_dir(options.output_dir)
        tag_to_col = options.tag_map or {}

        # Load data (columns: name, role, event, email — email ignored)
        sheet_arg = _coerce_sheet_arg(options.sheet_name)
        df = pd.read_excel(excel_path, sheet_name=sheet_arg)
        if isinstance(df, dict):  # if multiple sheets returned and no explicit index/name
            df = next(iter(df.values()))
        if df.empty:
            raise ValueError("Excel has no rows.")
        col_ci = {str(c).lower(): c for c in df.columns}
        for r in ["name", "role", "event"]:
            if r not in col_ci:
                raise ValueError(f"Excel missing required column: {r}")

        saved_paths: List[str] = []

        for row_idx, row in df.iterrows():
            logger.debug(f"\n=== Row {row_idx} =====================================")
            logger.debug(f"Row values: name={row.get(col_ci['name'])!r}, role={row.get(col_ci['role'])!r}, event={row.get(col_ci['event'])!r}")

            # Foldering by event
            event_col_req = tag_to_col.get("event", "event")
            event_col = col_ci.get(str(event_col_req).lower())
            event_value = str(row.get(event_col, "")).strip() if event_col else ""

            target_dir = options.output_dir
            if options.create_event_subdir and event_value:
                target_dir = os.path.join(options.output_dir, event_value)
            _ensure_dir(target_dir)

            out_name = _expand_filename(options.filename_pattern, row)
            out_path = os.path.join(target_dir, out_name)

            with fitz.open(template_path) as doc:
                logger.debug(f"Opened template: {template_path} with {len(doc)} page(s)")

                # Collect draw ops per page; deduplicate/merge rects per key per page
                draw_ops_per_page: Dict[int, List[Tuple[fitz.Rect, str, str, float, Tuple[float,float,float], int]]] = {}

                for page_index, page in enumerate(doc):
                    logger.debug(f"-- Page {page_index+1} / {len(doc)}")

                    # Robust detection: find placeholders by scanning spans
                    detected = _detect_placeholders_by_spans(page)  # keys are lower-case
                    logger.debug(f"   Detected placeholders (by key): " +
                                ", ".join(f"{k}:{len(v)}" for k, v in detected.items()) if detected else "   Detected none")

                    # Prepare target keys set; if role/event not detected, we'll try anchor fallback
                    keys_present = set(detected.keys())
                    all_candidate_keys = {"name", "role", "event"} | keys_present

                    for key_low in sorted(all_candidate_keys, key=lambda s: ("name","role","event").index(s) if s in ("name","role","event") else 99):
                        # Map PDF key -> Excel column using tag_map (case-insensitive)
                        requested = (
                            tag_to_col.get(key_low) or
                            tag_to_col.get(key_low.capitalize()) or
                            tag_to_col.get(key_low.upper()) or
                            key_low
                        )
                        excel_col = col_ci.get(str(requested).lower())
                        if not excel_col:
                            logger.debug(f"   [SKIP] No Excel column for key '{key_low}' (requested='{requested}')")
                            continue

                        value = "" if pd.isna(row[excel_col]) else str(row[excel_col])

                        # Hits from detection; if none and key is role/event, try anchor fallback
                        hits = list(detected.get(key_low, []))
                        if not hits and key_low in ("role", "event"):
                            fb = _anchor_fallback(page, key_low)
                            if fb:
                                hits = [fb]
                                logger.debug(f"   [ANCHOR] Using anchor fallback for '{key_low}' -> {fb}")

                        if not hits:
                            logger.debug(f"   [MISS] No rects for key '{key_low}' on this page")
                            continue

                        # For each occurrence, compute fill rect, infer font, queue draw op
                        for tag_rect in hits:
                            fill_rect, is_inline = _compute_fill_rect(page, key_low, tag_rect)
                            spans = _find_spans_overlapping(page, fill_rect, pad=0.5)
                            font_guess, size_guess, color_guess = _guess_font_from_spans(spans)
                            fontname = _best_font_for_family(font_guess)

                            start_size = max(
                                DEFAULT_START_SIZES.get(key_low, 18.0),
                                float(size_guess if size_guess is not None else 12.0)
                            )
                            color = color_guess if color_guess is not None else (0, 0, 0)
                            align = 0 if is_inline else options.align  # inline = left-align

                            logger.debug(f"   [PLACE] key={key_low} value={value!r}")
                            logger.debug(f"           tag_rect={tag_rect} -> fill_rect={fill_rect} inline={is_inline}")
                            logger.debug(f"           font='{fontname}' start_size={start_size:.1f} color={color} align={align}")

                            draw_ops_per_page.setdefault(page_index, []).append(
                                (fill_rect, value, fontname, start_size, color, align)
                            )

                    # Erase all regions on this page before inserting new text
                    if page_index in draw_ops_per_page:
                        rects_to_erase = [op[0] for op in draw_ops_per_page[page_index]]
                        logger.debug(f"   [ERASE] {len(rects_to_erase)} rect(s)")
                        used_redact = _erase_regions_with_redaction(page, rects_to_erase, options.bg_rgb)
                        if not used_redact:
                            for r in rects_to_erase:
                                _erase_rect_fill(page, r, options.bg_rgb)

                # Insert text after erasures
                for page_index, ops in draw_ops_per_page.items():
                    page = doc[page_index]
                    for fill_rect, value, fontname, start_size, color, align in ops:
                        final_size = _shrink_to_fit(page, value, fill_rect, fontname, start_size, min_size=10.0)
                        _insert_text(page, fill_rect, value, fontname, final_size, color, align)
                        logger.debug(f"   [WRITE] page={page_index+1} rect={fill_rect} size={final_size:.1f} text={value!r}")

                doc.save(out_path, garbage=3, deflate=True, incremental=False)
                logger.debug(f"[OK] Saved -> {out_path}")
                saved_paths.append(os.path.abspath(out_path))

        return saved_paths


    def zip_files_to_memory(paths: List[str], base_dir: Optional[str] = None) -> io.BytesIO:
        """Create an in-memory ZIP of given file paths."""
        mem_zip = io.BytesIO()
        with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
            for p in paths:
                arcname = os.path.relpath(p, base_dir) if base_dir else os.path.basename(p)
                zf.write(p, arcname=arcname)
        mem_zip.seek(0)
        return mem_zip


    # -----------------------------
    # CLI
    # -----------------------------
    import argparse
    import sys
    from pathlib import Path


    def _parse_tag_map(raw: Optional[str]) -> Dict[str, str]:
        if not raw:
            return {}
        mapping: Dict[str, str] = {}
        for piece in [p.strip() for p in raw.split(",") if p.strip()]:
            if "=" not in piece:
                raise ValueError(f"Bad --tag-map entry '{piece}'. Use key=value, comma-separated.")
            k, v = piece.split("=", 1)
            mapping[k.strip()] = v.strip()
        return mapping


    def main() -> int:
        parser = argparse.ArgumentParser(
            prog="pdf-tag-filler",
            description="Fill a tagged PDF template ({{name}}, {{role}}, {{event}}, ...) using rows from an Excel file."
        )
        parser.add_argument("--template", required=True, help="Path to PDF template (contains {{name}}, {{role}}, {{event}})")
        parser.add_argument("--excel", required=True, help="Path to Excel (.xlsx) with columns: name | role | event | email")
        parser.add_argument("--sheet", default=None, help="Worksheet name (or index). Default: first sheet.")
        parser.add_argument("--output-dir", default="output", help="Directory to save generated PDFs (default: ./output).")
        parser.add_argument("--filename-pattern", default="{event}_{name}.pdf",
                            help="Output filename pattern using Excel column names. Example: '{event}_{name}.pdf'")
        parser.add_argument("--tag-map", default=None,
                            help="Optional placeholder→column map, e.g. 'Name=name,Role=role,Event=event'")
        parser.add_argument("--align", choices=["left","center","right","justify"], default="center",
                            help="Alignment for standalone fields (Name). Inline fields use left.")
        parser.add_argument("--bg", default="#FFFFFF",
                            help="Hex background color to erase under text (match template). Default: #FFFFFF")
        parser.add_argument("--no-event-subdir", action="store_true",
                            help="Do NOT create per-event subfolders under output/.")
        parser.add_argument("--no-save", action="store_true",
                            help="Do not keep generated PDFs on disk after (with --zip-output).")
        parser.add_argument("--zip-output", default=None,
                            help="If set, write a ZIP containing all generated PDFs to this path.")
        parser.add_argument("--debug", action="store_true",
                            help="Verbose debug logging (detect rects, erasures, font choices).")
        args = parser.parse_args()

        if args.debug:
            logger.setLevel(logging.DEBUG)
            logger.debug("Debug mode enabled")

        # Validate inputs
        template_path = Path(args.template)
        excel_path = Path(args.excel)
        if not template_path.is_file():
            logger.error(f"Template not found: {template_path}")
            return 2
        if not excel_path.is_file():
            logger.error(f"Excel not found: {excel_path}")
            return 2

        # Options
        try:
            mapping = _parse_tag_map(args.tag_map)
            align_map = {"left":0, "center":1, "right":2, "justify":3}
            bg_rgb = _hex_to_rgb_tuple(args.bg)
            options = FillOptions(
                output_dir=str(args.output_dir),
                filename_pattern=args.filename_pattern,
                tag_map=mapping,
                align=align_map[args.align],
                bg_rgb=bg_rgb,
                sheet_name=args.sheet,
                save_to_disk=not args.no_save,
                create_event_subdir=not args.no_event_subdir,
                debug=args.debug,
            )
        except Exception as e:
            logger.error(f"Bad options: {e}")
            return 2

        # Run
        try:
            paths = fill_pdfs(str(template_path), str(excel_path), options)
        except Exception as e:
            logger.error(f"Fill failed: {e}")
            return 1

        if not paths:
            logger.info("No files generated. Check that placeholders in the PDF match Excel headers (or map via --tag-map).")
            return 0

        # Optional ZIP
        if args.zip_output:
            try:
                mem_zip = zip_files_to_memory(paths, base_dir=str(args.output_dir))
                zip_path = Path(args.zip_output)
                zip_path.parent.mkdir(parents=True, exist_ok=True)
                with open(zip_path, "wb") as f:
                    f.write(mem_zip.getvalue())
                logger.info(f"ZIP written: {zip_path.resolve()}")
            except Exception as e:
                logger.error(f"Could not write ZIP: {e}")
                return 1

        if args.no_save:
            for p in paths:
                try:
                    Path(p).unlink(missing_ok=True)
                except Exception as e:
                    logger.warning(f"Could not remove temporary file {p}: {e}")

        # Summary
        if not args.no_save:
            logger.info("Generated files:")
            for p in paths:
                logger.info(f"  - {p}")
        else:
            logger.info("Generation complete (files not kept on disk).")

        return 0


    if __name__ == "__main__":
        raise SystemExit(main())

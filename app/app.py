from __future__ import annotations

import os
from typing import Optional, Dict

from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .pdf_filler import FillOptions, fill_pdfs, zip_files_to_memory, _hex_to_rgb_tuple

APP_TITLE = "PDF Tag Filler API"
DEFAULT_OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")

app = FastAPI(title=APP_TITLE, version="1.0.0")

# CORS (tune for your origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/fill")
async def fill_endpoint(
    template: UploadFile = File(..., description="PDF template containing tags like {{name}}"),
    excel: UploadFile = File(..., description="Excel (.xlsx) with rows to merge"),
    # Optional parameters via multipart form fields
    sheet: Optional[str] = Form(None, description="Worksheet name"),
    filename_pattern: str = Form("{event}_{name}.pdf"),
    tag_map: Optional[str] = Form(None, description="CSV mapping like 'name=Full Name,role=Designation,event=Event Title'"),
    align: str = Form("center", description="left|center|right|justify"),
    bg: str = Form("#FFFFFF", description="Placeholder background color (hex)"),
    save_to_disk: bool = Form(True, description="Also store under output/<event>/..."),
    event_subdir: bool = Form(True, description="Create per-event subfolders"),
):
    # Validate files
    if template.content_type not in ("application/pdf", "application/x-pdf", "application/octet-stream"):
        raise HTTPException(status_code=400, detail="Template must be a PDF")
    if not excel.filename.lower().endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Excel must be .xlsx/.xlsm")

    # Persist uploads to temporary files
    tmp_template_path = os.path.join(DEFAULT_OUTPUT_DIR, "_tmp_template.pdf")
    tmp_excel_path = os.path.join(DEFAULT_OUTPUT_DIR, "_tmp_data.xlsx")
    os.makedirs(DEFAULT_OUTPUT_DIR, exist_ok=True)

    try:
        with open(tmp_template_path, "wb") as f:
            f.write(await template.read())
        with open(tmp_excel_path, "wb") as f:
            f.write(await excel.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store uploads: {e}")

    # Parse tag_map string to dict
    mapping: Dict[str, str] = {}
    if tag_map:
        entries = [p.strip() for p in tag_map.split(",") if p.strip()]
        for e in entries:
            if "=" not in e:
                raise HTTPException(status_code=400, detail=f"Bad tag_map entry '{e}'. Use key=value.")
            k, v = e.split("=", 1)
            mapping[k.strip()] = v.strip()

    # Alignment
    align_map = {"left": 0, "center": 1, "right": 2, "justify": 3}
    if align not in align_map:
        raise HTTPException(status_code=400, detail="align must be one of: left, center, right, justify")
    align_val = align_map[align]

    # Background color
    try:
        bg_rgb = _hex_to_rgb_tuple(bg)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Run filling
    try:
        paths = fill_pdfs(
            template_path=tmp_template_path,
            excel_path=tmp_excel_path,
            options=FillOptions(
                output_dir=DEFAULT_OUTPUT_DIR,
                filename_pattern=filename_pattern,
                tag_map=mapping,
                align=align_val,
                bg_rgb=bg_rgb,
                sheet_name=sheet,
                save_to_disk=save_to_disk,
                create_event_subdir=event_subdir,
            ),
        )
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fill error: {e}")

    # If nothing produced (e.g., placeholders missing), return JSON
    if not paths:
        return JSONResponse({"message": "No files generated; check placeholders and Excel columns."})

    # Stream a ZIP back, preserving folder structure under DEFAULT_OUTPUT_DIR
    mem_zip = zip_files_to_memory(paths, base_dir=DEFAULT_OUTPUT_DIR)
    headers = {"Content-Disposition": 'attachment; filename="filled_pdfs.zip"'}
    return StreamingResponse(mem_zip, media_type="application/zip", headers=headers)

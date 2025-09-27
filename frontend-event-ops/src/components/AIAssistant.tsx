import React, { useState } from 'react';
import { Bot, Send,History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';

// ❗ DEMO-ONLY — exposes your key to anyone with DevTools. Do NOT ship.
const GROQ_API_KEY = 'gsk_...YOUR_REAL_KEY...';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const { state, dispatch } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const query = input.trim();
    setInput('');
    setSending(true);

    const id = crypto.randomUUID?.() ?? String(Date.now());

    // 1) Add log immediately (optimistic)
    dispatch({
      type: 'ADD_AI_LOG',
      payload: { id, timestamp: new Date().toISOString(), query, answer: 'Thinking…' }
    });

    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content:
                'You are an experienced Event Manager. Answer every query in a professional tone using only 2-4 concise bullet points.',
            },
            { role: 'user', content: query },
          ],
          temperature: 0.3,
        }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error?.message || `HTTP ${r.status}`);

      const content = data?.choices?.[0]?.message?.content ?? '';
      // 2) Update log with answer
      dispatch({ type: 'UPDATE_AI_LOG', payload: { id, answer: content || '(no content)' } });
    } catch (err: any) {
      dispatch({
        type: 'UPDATE_AI_LOG',
        payload: { id, answer: `Error: ${err?.message || 'Unknown error'}` },
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-large animate-pulse-glow z-50"
        variant="gradient"
        size="icon"
      >
        <Bot className="w-6 h-6" />
      </Button>

      {/* AI Assistant Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-gradient-secondary">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              AI Event Assistant
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Ask Assistant</TabsTrigger>
              <TabsTrigger value="history">History ({state.aiLogs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                <p className="text-sm text-muted-foreground mb-2">How can I help you manage your event today?</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Ask about task priorities and deadlines</p>
                  <p>• Get vendor recommendations</p>
                  <p>• Plan agenda optimization</p>
                  <p>• Troubleshoot event logistics</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your event management question..."
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" size="icon" variant="gradient" disabled={sending}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                {state.aiLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No queries yet</p>
                    <p className="text-xs">Your AI assistant conversations will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {state.aiLogs.map((log: { id: string; query: string; answer?: string; timestamp: string }) => (
                      <div key={log.id} className="bg-card rounded-lg p-3 shadow-soft">
                        <div className="flex items-start gap-3">
                          <Bot className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium mb-1">Q: {log.query}</p>
                            {log.answer && (
                              <p className="text-sm whitespace-pre-wrap">A: {log.answer}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

// src/components/chat/MayaChat.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

const BOT_USERNAME = "Maya";

type Msg = {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  error?: boolean;
  loading?: boolean;
};

export default function MayaChat(): JSX.Element {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "maya-0",
      username: BOT_USERNAME,
      message: "Hello — I'm Maya. I'm here to listen.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom whenever messages change
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const pushMessage = (m: Msg) => setMessages((s) => [...s, m]);

  // Helper to replace / remove a temporary message by id
  const removeMessageById = (id: string) =>
    setMessages((prev) => prev.filter((m) => m.id !== id));

  // Main send handler — posts to your backend /api/maya
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text) return;

    // Push user's message immediately
    const userMsg: Msg = {
      id: `user-${Date.now()}`,
      username: "You",
      message: text,
      timestamp: new Date().toISOString(),
    };
    pushMessage(userMsg);
    setInput("");
    inputRef.current?.focus();

    // Push loading message from Maya (so UI shows it's working)
    const loadingId = `maya-loading-${Date.now()}`;
    pushMessage({
      id: loadingId,
      username: BOT_USERNAME,
      message: "Maya is thinking...",
      timestamp: new Date().toISOString(),
      loading: true,
    });

    try {
      const resp = await fetch("/api/maya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text, max_new_tokens: 256, temperature: 0.8 }),
      });

      // Remove loading entry
      removeMessageById(loadingId);

      if (!resp.ok) {
        const txt = await resp.text();
        pushMessage({
          id: `maya-err-${Date.now()}`,
          username: BOT_USERNAME,
          message: `Error from bot: ${resp.status} ${resp.statusText || ""} ${txt ? `- ${txt}` : ""}`,
          timestamp: new Date().toISOString(),
          error: true,
        });
        return;
      }

      const data = await resp.json();
      const reply = (data && data.reply) ? data.reply : "Sorry, I couldn't generate a response.";

      pushMessage({
        id: `maya-${Date.now()}`,
        username: BOT_USERNAME,
        message: reply,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      removeMessageById(loadingId);
      pushMessage({
        id: `maya-neterr-${Date.now()}`,
        username: BOT_USERNAME,
        message: `Network error: ${(err as Error).message}`,
        timestamp: new Date().toISOString(),
        error: true,
      });
    }
  };

  // Quick-fill suggestions
  const quick = (txt: string) => {
    setInput(txt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full max-w-3xl">
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Chat with Maya</h2>
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="px-2 py-3 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.username === "You" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="w-8 h-8">
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                      {m.username[0]}
                    </div>
                  </Avatar>

                  <div className={`flex flex-col ${m.username === "You" ? "items-end" : ""}`}>
                    <span className="text-sm text-muted-foreground">{m.username}</span>
                    <div
                      className={`
                        rounded-lg p-3 max-w-[80%] whitespace-pre-wrap
                        ${m.username === "You" ? "bg-primary text-primary-foreground" : "bg-muted"}
                        ${m.error ? "ring-1 ring-red-300" : ""}
                      `}
                    >
                      {m.message}
                      {m.loading ? " ▾" : null}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSend} className="mt-4 flex gap-2">
            {/* some UI Input components don't forward ref typings; cast to any to be safe */}
            <Input
              // @ts-ignore - cast because some custom Input components may not forward refs with correct typing
              ref={inputRef}
              value={input}
              onChange={(e) => setInput((e.target as HTMLInputElement).value)}
              placeholder="Type your message..."
              className="flex-grow"
              aria-label="Maya chat input"
            />
            <Button type="submit">Send</Button>
          </form>

          <div className="mt-3 text-sm text-gray-600">
            Quick:
            <button type="button" onClick={() => quick("I feel anxious")} className="ml-2 text-blue-600 hover:underline">
              I feel anxious
            </button>
            <button type="button" onClick={() => quick("I'm feeling sad")} className="ml-3 text-blue-600 hover:underline">
              I'm feeling sad
            </button>
            <button type="button" onClick={() => quick("How do I get help?")} className="ml-3 text-blue-600 hover:underline">
              How do I get help?
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

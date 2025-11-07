// frontend/src/components/chat/BotChat.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

const BOT_USERNAME = "Wellness Bot";

type Msg = {
  id: string;
  username: string;
  message: string;
  timestamp: string;
};

const RULES: { patterns: RegExp[]; reply: string }[] = [
  { patterns: [/hi|hello|hey/i], reply: "Hi — how are you feeling today?" },
  { patterns: [/anxious|anxiety/i], reply: "I'm sorry you're feeling anxious. Would you like breathing exercises or resources?" },
  { patterns: [/sad|depress|hopeless/i], reply: "That sounds heavy. If you're safe, would you like coping tips or contacts for immediate help?" },
  { patterns: [/stress|stressed/i], reply: "Stress can be overwhelming. Want a quick grounding exercise?" },
  { patterns: [/help|support|contact/i], reply: "You can email support@yourdomain.com or call local helplines. Would you like numbers?" },
];

function getBotReply(text: string) {
  const lower = text.toLowerCase();

  // crisis words escalate to urgent guidance
  if (/(suicid|kill myself|i want to die|self-harm)/i.test(lower)) {
    return (
      "I'm really sorry you're feeling that way. If you are in immediate danger, please call your local emergency number right now. " +
      "If you'd like, I can show crisis helpline numbers for your country or connect you to resources."
    );
  }

  for (const r of RULES) {
    if (r.patterns.some((p) => p.test(text))) return r.reply;
  }

  if (/bye|thanks|thank/i.test(text)) return "You're welcome — take care!";
  return "Sorry, I don't quite understand. Try rephrasing or ask for resources.";
}

export default function BotChat() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "bot-0", username: BOT_USERNAME, message: "Hello — I'm here to listen. Type anything to get started.", timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const pushMessage = (m: Msg) => setMessages((s) => [...s, m]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Msg = { id: `user-${Date.now()}`, username: "You", message: input.trim(), timestamp: new Date().toISOString() };
    pushMessage(userMsg);
    setInput("");
    inputRef.current?.focus();

    // simulate bot reply
    setTimeout(() => {
      const replyText = getBotReply(userMsg.message);
      const botMsg: Msg = { id: `bot-${Date.now()}`, username: BOT_USERNAME, message: replyText, timestamp: new Date().toISOString() };
      pushMessage(botMsg);
    }, 500 + Math.floor(Math.random() * 500));
  };

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
            <h2 className="text-lg font-semibold">Chat with Wellness Bot</h2>
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="px-2 py-3 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.username === "You" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className="w-8 h-8">
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                      {m.username[0]}
                    </div>
                  </Avatar>
                  <div className={`flex flex-col ${m.username === "You" ? "items-end" : ""}`}>
                    <span className="text-sm text-muted-foreground">{m.username}</span>
                    <div className={`rounded-lg p-3 max-w-[80%] ${m.username === "You" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {m.message}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>

          <form onSubmit={(e) => handleSend(e)} className="mt-4 flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
              aria-label="Bot chat input"
            />
            <Button type="submit">Send</Button>
          </form>

          <div className="mt-3 text-sm text-gray-600">
            Quick:
            <button type="button" onClick={() => quick("I feel anxious")} className="ml-2 text-blue-600 hover:underline">I feel anxious</button>
            <button type="button" onClick={() => quick("I'm feeling sad")} className="ml-3 text-blue-600 hover:underline">I'm feeling sad</button>
            <button type="button" onClick={() => quick("How do I get help?")} className="ml-3 text-blue-600 hover:underline">How do I get help?</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

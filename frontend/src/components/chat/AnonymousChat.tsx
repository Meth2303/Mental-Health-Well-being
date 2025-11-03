import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle, Users } from "lucide-react";

// Mock data for development
const generateRandomUsername = () => `User${Math.floor(Math.random() * 10000)}`;

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

export const AnonymousChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username] = useState(generateRandomUsername());
  const [onlineUsers] = useState(new Set([username]));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username,
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <div className="flex flex-col flex-grow">
        <Card className="flex-grow p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Anonymous Chat</h2>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.username === username ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground">
                      {msg.username[0]}
                    </div>
                  </Avatar>
                  <div
                    className={`flex flex-col ${
                      msg.username === username ? "items-end" : ""
                    }`}
                  >
                    <span className="text-sm text-muted-foreground">
                      {msg.username}
                    </span>
                    <div
                      className={`rounded-lg p-3 max-w-[80%] ${
                        msg.username === username
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
      
      <Card className="w-64 p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          <h3 className="font-semibold">Online Users</h3>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="space-y-2">
            {Array.from(onlineUsers).map((user) => (
              <div key={user} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm">{user}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
};
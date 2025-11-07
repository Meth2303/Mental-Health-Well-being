// frontend/src/pages/BotChatPage.tsx
import React from "react";
import BotChat from "@/components/chat/BotChat";
import { Header } from "@/components/Header";

export const BotChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <BotChat />
      </main>
    </div>
  );
};

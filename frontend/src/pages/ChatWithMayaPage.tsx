// src/pages/ChatWithMayaPage.tsx
import React from "react";
import MayaChat from "@/components/chat/Mayachat";
import { Header } from "@/components/Header";

export const ChatWithMayaPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <MayaChat />
      </main>
    </div>
  );
};

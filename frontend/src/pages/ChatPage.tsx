import { AnonymousChat } from "@/components/chat/AnonymousChat";
import { Header } from "@/components/Header";

export const ChatPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <AnonymousChat />
      </main>
    </div>
  );
};
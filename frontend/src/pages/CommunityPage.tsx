import { Community } from "@/components/community/Community";
import { Header } from "@/components/Header";

export const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Community />
      </main>
    </div>
  );
};
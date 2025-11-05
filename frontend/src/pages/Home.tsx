import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { UserCircle2, MessageCircle, Users, Brain } from "lucide-react";

export const Home = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to CogniCare</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your comprehensive AI-powered cognitive assessment platform
          </p>
          
          {/* Question Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Ask Maya anything about cognitive health..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1"
              />
              <Button onClick={() => navigate('/chat', { state: { question } })}>
                Ask Maya
              </Button>
            </div>
          </div>
        </section>

        {/* Main Navigation Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/dashboard')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Assessment</h2>
            </div>
            <p className="text-muted-foreground">
              Take comprehensive cognitive assessments and track your progress
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/chat')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Chat with Maya</h2>
            </div>
            <p className="text-muted-foreground">
              Get instant answers to your cognitive health questions
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate('/community')}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Community</h2>
            </div>
            <p className="text-muted-foreground">
              Connect with others and share experiences in our supportive community
            </p>
          </Card>
        </section>

        {/* User Profile Section */}
        <section className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => navigate('/profile')}
          >
            <UserCircle2 className="w-5 h-5" />
            View Profile
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Home;
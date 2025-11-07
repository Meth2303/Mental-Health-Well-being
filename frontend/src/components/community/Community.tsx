// src/components/community/Community.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Plus,
  MessageCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  votes: number;
  comments: Comment[];
  timestamp: Date;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  votes: number;
  timestamp: Date;
}

// Mock initial data
const initialPosts: Post[] = [
  {
    id: "1",
    title: "Tips for Managing Early Stage Dementia",
    content: "I've found that keeping a strict routine and using reminder apps has helped my father tremendously...",
    author: "CareGiver123",
    votes: 15,
    comments: [
      {
        id: "c1",
        content: "Thank you for sharing this. The reminder apps suggestion is really helpful.",
        author: "User456",
        votes: 5,
        timestamp: new Date(),
      },
    ],
    timestamp: new Date(),
  },
];

export const Community = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      author: `User${Math.floor(Math.random() * 10000)}`,
      votes: 0,
      comments: [],
      timestamp: new Date(),
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostTitle("");
    setNewPostContent("");
    setShowNewPost(false);
  };

  const handleVote = (postId: string, value: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, votes: post.votes + value } : post
      )
    );
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Community Discussion</h1>

        {/* Actions: New Post + Chat with Maya */}
        <div className="flex items-center gap-3">
          <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a New Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Post Title"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Share your thoughts, experiences, or questions..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[200px]"
                />
                <Button onClick={handleCreatePost} className="w-full">
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Chat with Maya button — navigates to separate Maya page */}
          <Button
            variant="outline"
            onClick={() => navigate("/chat/maya")}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Maya
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="p-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVote(post.id, 1)}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium">{post.votes}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleVote(post.id, -1)}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-grow">
                <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
                <p className="text-muted-foreground mb-4">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Posted by {post.author}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments.length} comments</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

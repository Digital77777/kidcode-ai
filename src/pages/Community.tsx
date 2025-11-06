import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Eye, MessageSquare, Sparkles } from "lucide-react";

const communityProjects = [
  {
    id: 1,
    title: "Magic Art Generator",
    author: "Alex 🎨",
    authorAvatar: "🎨",
    description: "An AI that creates magical fantasy artwork",
    likes: 42,
    views: 156,
    comments: 8,
    image: "from-purple-400 to-pink-500",
    tags: ["AI Art", "Creative"],
  },
  {
    id: 2,
    title: "Story Adventure Bot",
    author: "Sam 📚",
    authorAvatar: "📚",
    description: "Interactive storytelling AI with choices",
    likes: 35,
    views: 98,
    comments: 12,
    image: "from-blue-400 to-cyan-500",
    tags: ["Chatbot", "Stories"],
  },
  {
    id: 3,
    title: "Pet Classifier",
    author: "Jordan 🐕",
    authorAvatar: "🐕",
    description: "Identifies different types of pets",
    likes: 28,
    views: 87,
    comments: 5,
    image: "from-green-400 to-emerald-500",
    tags: ["Image AI", "Animals"],
  },
];

export default function Community() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <Link to="/home">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
          </Button>
        </Link>

        <div className="playful-card mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">Community</h1>
              <p className="text-muted-foreground">
                Discover amazing projects created by other learners
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Trending</Button>
              <Button variant="outline">Recent</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityProjects.map((project) => (
            <div
              key={project.id}
              className="playful-card hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              {/* Project Preview */}
              <div
                className={`w-full h-48 bg-gradient-to-br ${project.image} rounded-xl mb-4 flex items-center justify-center`}
              >
                <div className="text-6xl">{project.authorAvatar}</div>
              </div>

              {/* Project Info */}
              <div className="mb-4">
                <h3 className="font-bold text-xl mb-2">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex gap-2 mb-3">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author */}
                <p className="text-sm font-medium text-muted-foreground">
                  by {project.author}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{project.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{project.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{project.comments}</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Challenge */}
        <div className="playful-card mt-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-1">Weekly Challenge: Space Adventure</h3>
              <p className="text-sm text-muted-foreground">
                Create an AI project with a space theme. Best projects win badges!
              </p>
            </div>
            <Button variant="playful">
              Join Challenge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

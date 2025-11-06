import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Image, MessageSquare, Music, Gamepad2, Sparkles, Lock } from "lucide-react";

const templates = [
  {
    id: 1,
    title: "AI Art Generator",
    description: "Create amazing artwork with AI",
    icon: Image,
    color: "from-pink-500 to-purple-500",
    difficulty: "Beginner",
    locked: false,
  },
  {
    id: 2,
    title: "Story Bot",
    description: "Build an AI that writes stories",
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
    difficulty: "Beginner",
    locked: false,
  },
  {
    id: 3,
    title: "Music Maker",
    description: "Compose music with AI",
    icon: Music,
    color: "from-green-500 to-emerald-500",
    difficulty: "Intermediate",
    locked: true,
  },
  {
    id: 4,
    title: "Game AI",
    description: "Create smart game opponents",
    icon: Gamepad2,
    color: "from-orange-500 to-red-500",
    difficulty: "Advanced",
    locked: true,
  },
];

export default function Lab() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <Link to="/home">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
          </Button>
        </Link>

        <div className="playful-card mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">AI Lab</h1>
              <p className="text-muted-foreground">Choose a template to start building</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="playful-card relative group">
              {template.locked && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="font-semibold text-muted-foreground text-sm">
                      Unlock at Level {template.id + 2}
                    </p>
                  </div>
                </div>
              )}

              <div className={`w-full h-32 bg-gradient-to-br ${template.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                <template.icon className="w-16 h-16 text-white" />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-xl">{template.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    template.difficulty === "Beginner"
                      ? "bg-green-100 text-green-700"
                      : template.difficulty === "Intermediate"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
              </div>

              <Link to={`/lab/${template.id}`}>
                <Button
                  variant={template.locked ? "outline" : "playful"}
                  className="w-full"
                  disabled={template.locked}
                >
                  {template.locked ? "Locked" : "Start Building"}
                  {!template.locked && <Sparkles className="ml-2 w-4 h-4" />}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div className="playful-card mt-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30">
          <h3 className="font-bold text-xl mb-2">💡 What is the AI Lab?</h3>
          <p className="text-muted-foreground mb-4">
            The AI Lab is where you bring your ideas to life! Choose a template, customize it with our easy drag-and-drop editor, train your AI, and share your creation with the community.
          </p>
          <p className="text-sm text-muted-foreground">
            Unlock more templates by leveling up and completing learning paths!
          </p>
        </div>
      </div>
    </div>
  );
}

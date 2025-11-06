import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XPBar } from "@/components/XPBar";
import {
  Sparkles,
  Rocket,
  Trophy,
  Users,
  Brain,
  Image,
  MessageSquare,
  Play,
  Lock,
} from "lucide-react";

// Mock user data
const mockUser = {
  name: "Explorer",
  avatar: "🚀",
  level: 3,
  xp: 650,
  maxXP: 1000,
  coins: 120,
  badges: 5,
  projects: 3,
};

const learningPaths = [
  {
    id: 1,
    title: "AI Basics",
    description: "Learn what AI is and how it works",
    progress: 60,
    lessons: 8,
    completed: 5,
    icon: Brain,
    color: "from-primary to-primary/80",
    locked: false,
  },
  {
    id: 2,
    title: "Image AI",
    description: "Create and train image recognition",
    progress: 25,
    lessons: 10,
    completed: 2,
    icon: Image,
    color: "from-secondary to-secondary/80",
    locked: false,
  },
  {
    id: 3,
    title: "Chatbots",
    description: "Build your own AI chatbot",
    progress: 0,
    lessons: 12,
    completed: 0,
    icon: MessageSquare,
    color: "from-accent to-accent/80",
    locked: true,
  },
];

const quickActions = [
  {
    title: "AI Lab",
    description: "Create new projects",
    icon: Rocket,
    color: "bg-gradient-to-br from-primary to-primary/80",
    link: "/lab",
  },
  {
    title: "Community",
    description: "See what others built",
    icon: Users,
    color: "bg-gradient-to-br from-secondary to-secondary/80",
    link: "/community",
  },
  {
    title: "My Projects",
    description: `${mockUser.projects} projects`,
    icon: Trophy,
    color: "bg-gradient-to-br from-accent to-accent/80",
    link: "/profile",
  },
];

export default function Home() {
  const [userName, setUserName] = useState("Explorer");

  useEffect(() => {
    const avatar = localStorage.getItem("futureminds_avatar") || "robot";
    const avatarEmoji = {
      robot: "🤖",
      star: "⭐",
      rocket: "🚀",
      brain: "🧠",
      lightning: "⚡",
      wizard: "🧙",
    }[avatar] || "🚀";
    setUserName(avatarEmoji);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{userName}</div>
            <div>
              <h2 className="font-bold text-lg">Welcome back!</h2>
              <p className="text-sm text-muted-foreground">Level {mockUser.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="font-bold text-white">{mockUser.coins}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* XP Progress */}
        <div className="playful-card">
          <XPBar
            currentXP={mockUser.xp}
            maxXP={mockUser.maxXP}
            level={mockUser.level}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Quick Start
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} to={action.link}>
                <div className="playful-card hover:scale-105 transition-transform duration-300 cursor-pointer">
                  <div
                    className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center mb-4`}
                  >
                    <action.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Learning Paths */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Your Learning Paths
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <div key={path.id} className="playful-card relative">
                {path.locked && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="font-semibold text-muted-foreground">
                        Complete previous paths to unlock
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <path.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{path.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {path.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{path.completed} / {path.lessons} lessons</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${path.color} transition-all duration-500`}
                      style={{ width: `${path.progress}%` }}
                    />
                  </div>
                </div>

                <Link to={`/lesson/${path.id}`}>
                  <Button
                    variant={path.locked ? "outline" : "playful"}
                    className="w-full"
                    disabled={path.locked}
                  >
                    {path.progress > 0 ? "Continue Learning" : "Start Path"}
                    <Play className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Challenge (Coming Soon) */}
        <div className="playful-card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-1">Daily Challenge</h3>
              <p className="text-sm text-muted-foreground">
                Complete today's challenge and earn bonus XP!
              </p>
            </div>
            <Button variant="playful">
              Start <Sparkles className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

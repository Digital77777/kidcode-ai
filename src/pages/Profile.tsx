import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XPBar } from "@/components/XPBar";
import { BadgeComponent } from "@/components/Badge";
import { ArrowLeft, Trophy, Sparkles, Zap, Palette, Brain, Rocket } from "lucide-react";

const mockUser = {
  name: "Explorer",
  avatar: "🚀",
  level: 3,
  xp: 650,
  maxXP: 1000,
  coins: 120,
  joinedDate: "November 2024",
  projectsCompleted: 3,
  lessonsCompleted: 12,
  badges: [
    {
      title: "First Steps",
      description: "Completed your first lesson",
      icon: <Sparkles className="w-8 h-8 text-white" />,
      earned: true,
      rarity: "common" as const,
    },
    {
      title: "Creative Mind",
      description: "Created 3 AI art projects",
      icon: <Palette className="w-8 h-8 text-white" />,
      earned: true,
      rarity: "rare" as const,
    },
    {
      title: "Quick Learner",
      description: "Completed 10 lessons",
      icon: <Brain className="w-8 h-8 text-white" />,
      earned: true,
      rarity: "epic" as const,
    },
    {
      title: "Rising Star",
      description: "Reached Level 3",
      icon: <Rocket className="w-8 h-8 text-white" />,
      earned: true,
      rarity: "rare" as const,
    },
    {
      title: "Collaboration Pro",
      description: "Helped 5 community members",
      icon: <Trophy className="w-8 h-8 text-white" />,
      earned: false,
      rarity: "legendary" as const,
    },
    {
      title: "Speed Demon",
      description: "Completed 5 lessons in one day",
      icon: <Zap className="w-8 h-8 text-white" />,
      earned: false,
      rarity: "epic" as const,
    },
  ],
};

const recentProjects = [
  {
    id: 1,
    title: "My First Art Bot",
    type: "AI Art",
    date: "2 days ago",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: 2,
    title: "Story Helper",
    type: "Chatbot",
    date: "1 week ago",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: 3,
    title: "Animal Identifier",
    type: "Image AI",
    date: "2 weeks ago",
    color: "from-green-400 to-emerald-500",
  },
];

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="max-w-7xl mx-auto py-8">
        <Link to="/home">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 w-4 h-4" /> Back to Home
          </Button>
        </Link>

        {/* Profile Header */}
        <div className="playful-card mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-6xl">
              {mockUser.avatar}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                {mockUser.name}
              </h1>
              <p className="text-muted-foreground mb-4">
                Member since {mockUser.joinedDate}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">{mockUser.coins} Stars</span>
                </div>
                <div className="px-4 py-2 bg-muted rounded-full">
                  <span className="font-bold">{mockUser.projectsCompleted} Projects</span>
                </div>
                <div className="px-4 py-2 bg-muted rounded-full">
                  <span className="font-bold">{mockUser.lessonsCompleted} Lessons</span>
                </div>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <XPBar
            currentXP={mockUser.xp}
            maxXP={mockUser.maxXP}
            level={mockUser.level}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="playful-card text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{mockUser.badges.filter(b => b.earned).length}</h3>
            <p className="text-sm text-muted-foreground">Badges Earned</p>
          </div>
          <div className="playful-card text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{mockUser.lessonsCompleted}</h3>
            <p className="text-sm text-muted-foreground">Lessons Completed</p>
          </div>
          <div className="playful-card text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{mockUser.projectsCompleted}</h3>
            <p className="text-sm text-muted-foreground">Projects Built</p>
          </div>
        </div>

        {/* Badges Collection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Badge Collection
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockUser.badges.map((badge, index) => (
              <BadgeComponent key={index} {...badge} />
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Recent Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <div key={project.id} className="playful-card hover:scale-105 transition-transform duration-300 cursor-pointer">
                <div
                  className={`w-full h-32 bg-gradient-to-br ${project.color} rounded-xl mb-4`}
                />
                <h3 className="font-bold text-lg mb-1">{project.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{project.type}</p>
                <p className="text-xs text-muted-foreground">{project.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

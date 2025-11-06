import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Brain } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="text-center max-w-3xl">
        <div className="mb-8 animate-bounce-in">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-primary via-secondary to-accent rounded-full flex items-center justify-center animate-glow">
            <Brain className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            FutureMinds
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-4">
            Your AI Learning Playground 🚀
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Learn AI through fun projects, games, and challenges. Build real AI projects, earn rewards, and share with friends!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            variant="playful"
            size="xl"
            onClick={() => navigate("/auth")}
            className="group"
          >
            Get Started <Rocket className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl" onClick={() => navigate("/auth")}>
            Sign In <Sparkles className="ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="playful-card text-center">
            <div className="text-5xl mb-3">📚</div>
            <h3 className="font-bold mb-2">Interactive Lessons</h3>
            <p className="text-sm text-muted-foreground">
              Learn AI concepts through fun micro-lessons
            </p>
          </div>
          <div className="playful-card text-center">
            <div className="text-5xl mb-3">🔨</div>
            <h3 className="font-bold mb-2">Build Projects</h3>
            <p className="text-sm text-muted-foreground">
              Create real AI apps with no-code tools
            </p>
          </div>
          <div className="playful-card text-center">
            <div className="text-5xl mb-3">⭐</div>
            <h3 className="font-bold mb-2">Earn Rewards</h3>
            <p className="text-sm text-muted-foreground">
              Collect XP, badges, and unlock new tools
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

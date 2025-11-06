import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Brain, Zap } from "lucide-react";

const avatars = [
  { id: "robot", emoji: "🤖", name: "Robo" },
  { id: "star", emoji: "⭐", name: "Stardust" },
  { id: "rocket", emoji: "🚀", name: "Cosmo" },
  { id: "brain", emoji: "🧠", name: "Smarty" },
  { id: "lightning", emoji: "⚡", name: "Bolt" },
  { id: "wizard", emoji: "🧙", name: "Merlin" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleComplete = () => {
    // Save onboarding data to localStorage
    localStorage.setItem("futureminds_onboarded", "true");
    localStorage.setItem("futureminds_age_group", selectedAge || "10-13");
    localStorage.setItem("futureminds_avatar", selectedAvatar || "robot");
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="playful-card text-center animate-bounce-in">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-glow">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              Welcome to FutureMinds!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Your AI Learning Playground 🚀
            </p>
            <p className="text-base text-foreground/80 mb-8 max-w-md mx-auto">
              Get ready to create amazing AI projects, learn cool new skills, and
              have tons of fun along the way!
            </p>
            <Button
              variant="playful"
              size="xl"
              onClick={() => setStep(2)}
              className="group"
            >
              Let's Start! <Rocket className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        )}

        {/* Step 2: Age Selection */}
        {step === 2 && (
          <div className="playful-card animate-bounce-in">
            <h2 className="text-3xl font-bold mb-2 text-center">
              How old are you?
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              This helps us customize your learning experience
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[
                { range: "6-9", emoji: "🌟", desc: "Explorer" },
                { range: "10-13", emoji: "🚀", desc: "Builder" },
                { range: "14-18", emoji: "💡", desc: "Innovator" },
              ].map((age) => (
                <button
                  key={age.range}
                  onClick={() => setSelectedAge(age.range)}
                  className={`playful-card p-6 text-center transition-all duration-300 hover:scale-105 ${
                    selectedAge === age.range
                      ? "ring-4 ring-primary shadow-[var(--shadow-glow)]"
                      : ""
                  }`}
                >
                  <div className="text-5xl mb-3">{age.emoji}</div>
                  <div className="text-2xl font-bold mb-1">{age.range}</div>
                  <div className="text-sm text-muted-foreground">{age.desc}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                variant="playful"
                size="lg"
                onClick={() => setStep(3)}
                disabled={!selectedAge}
                className="flex-1"
              >
                Continue <Zap className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Avatar Selection */}
        {step === 3 && (
          <div className="playful-card animate-bounce-in">
            <h2 className="text-3xl font-bold mb-2 text-center">
              Choose Your Avatar
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Pick a character that represents you!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`playful-card p-6 text-center transition-all duration-300 hover:scale-105 ${
                    selectedAvatar === avatar.id
                      ? "ring-4 ring-primary shadow-[var(--shadow-glow)]"
                      : ""
                  }`}
                >
                  <div className="text-6xl mb-2">{avatar.emoji}</div>
                  <div className="font-bold">{avatar.name}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="lg" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="playful"
                size="lg"
                onClick={() => setStep(4)}
                disabled={!selectedAvatar}
                className="flex-1"
              >
                Continue <Brain className="ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Quick Tutorial */}
        {step === 4 && (
          <div className="playful-card animate-bounce-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent to-accent/90 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">You're All Set! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                Here's how FutureMinds works:
              </p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-xl">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Learn</h3>
                  <p className="text-sm text-muted-foreground">
                    Watch fun micro-lessons about AI
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-xl">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔨</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Build</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your own AI projects in the Lab
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start p-4 bg-muted/30 rounded-xl">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⭐</span>
                </div>
                <div>
                  <h3 className="font-bold mb-1">Earn Rewards</h3>
                  <p className="text-sm text-muted-foreground">
                    Collect XP, badges, and unlock new tools
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="playful"
              size="xl"
              onClick={handleComplete}
              className="w-full"
            >
              Start Learning! <Rocket className="ml-2" />
            </Button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-8 bg-primary"
                  : i < step
                  ? "w-2 bg-accent"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserType = "student" | "parent" | "educator";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [userType, setUserType] = useState<UserType>("student");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check user role and redirect appropriately
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user?.id);

        const role = roles?.[0]?.role;
        
        if (role === "parent") {
          navigate("/parent-dashboard");
        } else if (role === "educator") {
          navigate("/educator-dashboard");
        } else {
          navigate("/home");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
              avatar: "🚀",
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        // Add role based on user type
        if (data.user) {
          await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: userType,
          });

          toast({
            title: "Account created!",
            description: "Welcome to FutureMinds!",
          });

          if (userType === "parent") {
            navigate("/parent-dashboard");
          } else if (userType === "educator") {
            navigate("/educator-dashboard");
          } else {
            navigate("/onboarding");
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="playful-card">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-glow">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">FutureMinds</h1>
            <p className="text-muted-foreground">
              {isLogin ? "Welcome back!" : "Join the AI Learning Playground"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["student", "parent", "educator"] as UserType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setUserType(type)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          userType === type
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {type === "student" ? "🎓" : type === "parent" ? "👨‍👩‍👧" : "👩‍🏫"}
                        </div>
                        <div className="text-xs font-medium capitalize">{type}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              variant="playful"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
              <Sparkles className="ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { XPBar } from "@/components/XPBar";
import {
  Users,
  Plus,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
  AlertCircle,
  LogOut,
  Brain,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Progress = Database["public"]["Tables"]["user_progress"]["Row"];
type ApprovalRequest = Database["public"]["Tables"]["approval_requests"]["Row"];
type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];

interface ChildData {
  profile: Profile;
  progress: Progress;
  approvalRequests: ApprovalRequest[];
  recentActivity: ActivityLog[];
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<ChildData[]>([]);
  const [childEmail, setChildEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [linkingChild, setLinkingChild] = useState(false);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    loadChildren();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is parent or educator
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isParentOrEducator = roles?.some(r => 
      r.role === "parent" || r.role === "educator"
    );

    if (!isParentOrEducator) {
      navigate("/home");
    }
  };

  const loadChildren = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get linked children
      const { data: links } = await supabase
        .from("parent_child_links")
        .select("child_id")
        .eq("parent_id", user.id);

      if (!links || links.length === 0) {
        setLoading(false);
        return;
      }

      const childIds = links.map(l => l.child_id);

      // Load data for each child
      const childrenData = await Promise.all(
        childIds.map(async (childId) => {
          const [profile, progress, approvalRequests, recentActivity] = await Promise.all([
            supabase.from("profiles").select("*").eq("user_id", childId).single(),
            supabase.from("user_progress").select("*").eq("user_id", childId).single(),
            supabase.from("approval_requests").select("*").eq("child_id", childId).eq("status", "pending"),
            supabase.from("activity_logs").select("*").eq("user_id", childId).order("created_at", { ascending: false }).limit(10),
          ]);

          return {
            profile: profile.data!,
            progress: progress.data!,
            approvalRequests: approvalRequests.data || [],
            recentActivity: recentActivity.data || [],
          };
        })
      );

      setChildren(childrenData);
    } catch (error: any) {
      toast({
        title: "Error loading children",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const linkChild = async () => {
    if (!childEmail) return;
    setLinkingChild(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find child by email (via auth API is not possible, so we'll use a workaround)
      // In production, you'd want a proper invitation flow
      toast({
        title: "Feature coming soon",
        description: "Child linking via invitation will be available soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLinkingChild(false);
    }
  };

  const handleApproval = async (requestId: string, approved: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("approval_requests")
        .update({
          status: approved ? "approved" : "rejected",
          parent_id: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      toast({
        title: approved ? "Request approved" : "Request rejected",
        description: `The request has been ${approved ? "approved" : "rejected"}.`,
      });

      loadChildren();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedChildData = children.find(c => c.profile.user_id === selectedChild);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Parent Dashboard</h1>
              <p className="text-sm text-muted-foreground">Monitor and support your children's learning</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Child Section */}
        {children.length === 0 && (
          <div className="playful-card mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Children Linked</h2>
            <p className="text-muted-foreground mb-6">
              Link your child's account to start monitoring their progress
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <Input
                placeholder="Child's email address"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                disabled={linkingChild}
              />
              <Button
                variant="playful"
                onClick={linkChild}
                disabled={linkingChild || !childEmail}
              >
                <Plus className="w-4 h-4 mr-2" /> Link Child
              </Button>
            </div>
          </div>
        )}

        {children.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Children List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="playful-card">
                <h3 className="font-bold text-lg mb-4">Your Children</h3>
                <div className="space-y-2">
                  {children.map((child) => (
                    <button
                      key={child.profile.user_id}
                      onClick={() => setSelectedChild(child.profile.user_id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedChild === child.profile.user_id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-3xl">{child.profile.avatar}</div>
                        <div>
                          <div className="font-bold">{child.profile.display_name}</div>
                          <div className="text-xs text-muted-foreground">
                            Level {child.progress.level} • {child.progress.xp} XP
                          </div>
                        </div>
                      </div>
                      {child.approvalRequests.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <AlertCircle className="w-3 h-3" />
                          {child.approvalRequests.length} pending request(s)
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Child Details */}
            {selectedChildData && (
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Overview */}
                <div className="playful-card">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Learning Progress
                  </h3>
                  <XPBar
                    currentXP={selectedChildData.progress.xp}
                    maxXP={selectedChildData.progress.level * 1000}
                    level={selectedChildData.progress.level}
                  />
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                      <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedChildData.progress.lessons_completed}</div>
                      <div className="text-xs text-muted-foreground">Lessons</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                      <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedChildData.progress.projects_completed}</div>
                      <div className="text-xs text-muted-foreground">Projects</div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-xl">
                      <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold">{selectedChildData.progress.coins}</div>
                      <div className="text-xs text-muted-foreground">Stars</div>
                    </div>
                  </div>
                </div>

                {/* Approval Requests */}
                {selectedChildData.approvalRequests.length > 0 && (
                  <div className="playful-card">
                    <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                      Pending Approvals
                    </h3>
                    <div className="space-y-3">
                      {selectedChildData.approvalRequests.map((request) => (
                        <div key={request.id} className="p-4 bg-muted/50 rounded-xl">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold capitalize">
                                {request.request_type.replace(/_/g, " ")}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(request.created_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApproval(request.id, false)}
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApproval(request.id, true)}
                                className="text-accent hover:text-accent"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm">
                            {JSON.stringify(request.request_data)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="playful-card">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Recent Activity
                  </h3>
                  <div className="space-y-2">
                    {selectedChildData.recentActivity.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No activity yet
                      </p>
                    ) : (
                      selectedChildData.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <div className="text-2xl">
                            {activity.activity_type === "lesson_completed" ? "📚" :
                             activity.activity_type === "project_created" ? "🔨" :
                             activity.activity_type === "xp_earned" ? "⭐" :
                             activity.activity_type === "badge_earned" ? "🏆" : "✨"}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium capitalize">
                              {activity.activity_type.replace(/_/g, " ")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(activity.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

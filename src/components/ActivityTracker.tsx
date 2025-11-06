import { supabase } from "@/integrations/supabase/client";

export type ActivityType = 
  | "lesson_started"
  | "lesson_completed"
  | "project_created"
  | "project_published"
  | "xp_earned"
  | "badge_earned";

export const logActivity = async (
  activityType: ActivityType,
  activityData: Record<string, any> = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("activity_logs").insert({
      user_id: user.id,
      activity_type: activityType,
      activity_data: activityData,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

export const updateProgress = async (updates: {
  xp?: number;
  level?: number;
  coins?: number;
  lessons_completed?: number;
  projects_completed?: number;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get current progress
    const { data: currentProgress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!currentProgress) return;

    // Calculate new values
    const newProgress = {
      xp: updates.xp !== undefined ? currentProgress.xp + updates.xp : currentProgress.xp,
      level: updates.level || currentProgress.level,
      coins: updates.coins !== undefined ? currentProgress.coins + updates.coins : currentProgress.coins,
      lessons_completed: updates.lessons_completed !== undefined 
        ? currentProgress.lessons_completed + updates.lessons_completed 
        : currentProgress.lessons_completed,
      projects_completed: updates.projects_completed !== undefined
        ? currentProgress.projects_completed + updates.projects_completed
        : currentProgress.projects_completed,
    };

    // Update progress
    await supabase
      .from("user_progress")
      .update(newProgress)
      .eq("user_id", user.id);

    // Log XP gain if applicable
    if (updates.xp) {
      await logActivity("xp_earned", { xp_gained: updates.xp });
    }
  } catch (error) {
    console.error("Error updating progress:", error);
  }
};

export const createApprovalRequest = async (
  requestType: "publish_project" | "share_content" | "join_challenge",
  requestData: Record<string, any> = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("approval_requests")
      .insert({
        child_id: user.id,
        request_type: requestType,
        request_data: requestData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating approval request:", error);
    return null;
  }
};

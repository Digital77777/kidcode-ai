import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, User, Award, MessageSquare, Download, File } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

interface Assignment {
  id: string;
  title: string;
  xp_reward: number;
}

interface Submission {
  id: string;
  student_id: string;
  status: string;
  submitted_at: string | null;
  graded_at: string | null;
  feedback: string | null;
  file_urls: string[] | null;
  profiles: {
    display_name: string;
  };
}

interface GradingInterfaceProps {
  assignment: Assignment;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const feedbackSchema = z.object({
  feedback: z.string()
    .trim()
    .max(2000, { message: "Feedback must be less than 2000 characters" }),
  xpAwarded: z.number()
    .min(0, { message: "XP cannot be negative" })
    .max(10000, { message: "XP cannot exceed 10000" }),
});

export function GradingInterface({ assignment, isOpen, onClose, onUpdate }: GradingInterfaceProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [xpAwarded, setXpAwarded] = useState(assignment.xp_reward);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ feedback?: string; xpAwarded?: string }>({});

  useEffect(() => {
    if (isOpen) {
      loadSubmissions();
    }
  }, [isOpen, assignment.id]);

  useEffect(() => {
    if (selectedSubmission) {
      setFeedback(selectedSubmission.feedback || "");
      setXpAwarded(assignment.xp_reward);
    }
  }, [selectedSubmission, assignment.xp_reward]);

  const loadSubmissions = async () => {
    const { data: submissionsData, error } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("assignment_id", assignment.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      toast.error("Failed to load submissions");
      return;
    }

    if (!submissionsData || submissionsData.length === 0) {
      setSubmissions([]);
      return;
    }

    // Get student profiles
    const studentIds = submissionsData.map(s => s.student_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", studentIds);

    // Combine data
    const submissionsWithProfiles = submissionsData.map(submission => ({
      ...submission,
      file_urls: Array.isArray(submission.file_urls) ? submission.file_urls as string[] : null,
      profiles: {
        display_name: profiles?.find(p => p.user_id === submission.student_id)?.display_name || "Unknown Student"
      }
    }));

    setSubmissions(submissionsWithProfiles);
  };

  const validateInput = () => {
    try {
      feedbackSchema.parse({ feedback, xpAwarded });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: { feedback?: string; xpAwarded?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "feedback") {
            errors.feedback = err.message;
          } else if (err.path[0] === "xpAwarded") {
            errors.xpAwarded = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    
    if (!validateInput()) {
      toast.error("Please fix validation errors");
      return;
    }

    setLoading(true);

    try {
      // Update submission with feedback and graded status
      const { error: submissionError } = await supabase
        .from("assignment_submissions")
        .update({
          status: "graded",
          feedback: feedback.trim(),
          graded_at: new Date().toISOString(),
        })
        .eq("id", selectedSubmission.id);

      if (submissionError) throw submissionError;

      // Award XP to student
      const { data: currentProgress, error: progressError } = await supabase
        .from("user_progress")
        .select("xp")
        .eq("user_id", selectedSubmission.student_id)
        .single();

      if (progressError) throw progressError;

      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          xp: currentProgress.xp + xpAwarded,
        })
        .eq("user_id", selectedSubmission.student_id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from("activity_logs").insert({
        user_id: selectedSubmission.student_id,
        activity_type: "xp_earned",
        activity_data: {
          xp_gained: xpAwarded,
          source: "assignment_graded",
          assignment_id: assignment.id,
        },
      });

      toast.success("Submission graded successfully!");
      setSelectedSubmission(null);
      loadSubmissions();
      onUpdate?.();
    } catch (error: any) {
      toast.error("Failed to grade submission");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Submitted
          </Badge>
        );
      case "graded":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Graded
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-3 w-3" />
            Not Started
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Submissions: {assignment.title}</DialogTitle>
          <DialogDescription>
            Review student submissions and provide feedback
          </DialogDescription>
        </DialogHeader>

        {!selectedSubmission ? (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground text-center">
                    No submissions yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {submissions.map((submission) => (
                  <Card
                    key={submission.id}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{submission.profiles.display_name}</p>
                            {submission.submitted_at && (
                              <p className="text-sm text-muted-foreground">
                                Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <CardTitle>{selectedSubmission.profiles.display_name}</CardTitle>
                  </div>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
                {selectedSubmission.submitted_at && (
                  <CardDescription>
                    Submitted on {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>

            <div className="space-y-4">
              {/* Submitted Files */}
              {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                <div className="space-y-2">
                  <Label>Submitted Files</Label>
                  <div className="space-y-2">
                    {selectedSubmission.file_urls.map((fileUrl: string, index: number) => (
                      <FileDownloadButton key={index} fileUrl={fileUrl} />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="xp">XP to Award</Label>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <Input
                    id="xp"
                    type="number"
                    value={xpAwarded}
                    onChange={(e) => {
                      setXpAwarded(parseInt(e.target.value) || 0);
                      setValidationErrors({ ...validationErrors, xpAwarded: undefined });
                    }}
                    min="0"
                    max="10000"
                    disabled={loading}
                    className={validationErrors.xpAwarded ? "border-destructive" : ""}
                  />
                  <span className="text-sm text-muted-foreground">
                    / {assignment.xp_reward} XP
                  </span>
                </div>
                {validationErrors.xpAwarded && (
                  <p className="text-sm text-destructive">{validationErrors.xpAwarded}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    setValidationErrors({ ...validationErrors, feedback: undefined });
                  }}
                  placeholder="Provide feedback to the student..."
                  rows={6}
                  disabled={loading}
                  maxLength={2000}
                  className={validationErrors.feedback ? "border-destructive" : ""}
                />
                <div className="flex justify-between items-center">
                  {validationErrors.feedback ? (
                    <p className="text-sm text-destructive">{validationErrors.feedback}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {feedback.length} / 2000 characters
                    </p>
                  )}
                </div>
              </div>

              {selectedSubmission.feedback && selectedSubmission.status === "graded" && (
                <Card className="bg-muted">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Previous Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedSubmission.feedback}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedSubmission(null)}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleGrade}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Grading..." : selectedSubmission.status === "graded" ? "Update Grade" : "Grade Submission"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FileDownloadButton({ fileUrl }: { fileUrl: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from("assignment-submissions")
        .download(fileUrl);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileUrl.split('/').pop() || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloading}
      className="w-full justify-start"
    >
      <File className="w-4 h-4 mr-2" />
      <span className="truncate flex-1 text-left">
        {fileUrl.split('/').pop()}
      </span>
      <Download className="w-4 h-4 ml-2" />
    </Button>
  );
}

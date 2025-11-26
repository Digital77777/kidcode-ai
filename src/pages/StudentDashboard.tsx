import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { XPBar } from "@/components/XPBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, TrendingUp, LogOut, Upload, File, X } from "lucide-react";
import { toast } from "sonner";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Load profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProfile(profileData);

      // Load progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();
      setProgress(progressData);

      // Load enrolled classes
      const { data: enrollments } = await supabase
        .from("class_enrollments")
        .select(`
          *,
          classes (
            id,
            name,
            description,
            subject,
            grade_level
          )
        `)
        .eq("student_id", user.id);

      if (enrollments) {
        setClasses(enrollments.map(e => e.classes));
      }

      // Load assignments
      const classIds = enrollments?.map(e => e.class_id) || [];
      if (classIds.length > 0) {
        const { data: assignmentsData } = await supabase
          .from("assignments")
          .select(`
            *,
            classes (name)
          `)
          .in("class_id", classIds)
          .order("due_date", { ascending: true });
        
        setAssignments(assignmentsData || []);
      }

    } catch (error) {
      console.error("Error loading student data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎓</div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const maxXP = (progress?.level || 1) * 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{profile?.avatar || "🎓"}</div>
            <div>
              <h2 className="font-bold text-lg">{profile?.display_name || "Student"}</h2>
              <p className="text-sm text-muted-foreground">Level {progress?.level || 1}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* XP Progress */}
        <Card>
          <CardContent className="pt-6">
            <XPBar
              currentXP={progress?.xp || 0}
              maxXP={maxXP}
              level={progress?.level || 1}
            />
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Enrolled classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress?.lessons_completed || 0}</div>
              <p className="text-xs text-muted-foreground">Completed lessons</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">XP</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress?.xp || 0}</div>
              <p className="text-xs text-muted-foreground">Total experience</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="classes">My Classes</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4">
            {classes.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">You're not enrolled in any classes yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((cls: any) => (
                  <Card key={cls.id}>
                    <CardHeader>
                      <CardTitle>{cls.name}</CardTitle>
                      <CardDescription>
                        {cls.subject && <span className="mr-2">{cls.subject}</span>}
                        {cls.grade_level && <span>Grade {cls.grade_level}</span>}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{cls.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            {assignments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No assignments yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} onUpdate={loadStudentData} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AssignmentCard({ assignment, onUpdate }: { assignment: any; onUpdate: () => void }) {
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSubmission();
  }, []);

  const loadSubmission = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("assignment_id", assignment.id)
        .eq("student_id", user.id)
        .maybeSingle();

      setSubmission(data);
      if (data?.file_urls && Array.isArray(data.file_urls)) {
        setUploadedFiles(data.file_urls as string[]);
      }
    } catch (error) {
      console.error("Error loading submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create submission if it doesn't exist
      let submissionId = submission?.id;
      if (!submission) {
        const { data: newSubmission, error } = await supabase
          .from("assignment_submissions")
          .insert({
            assignment_id: assignment.id,
            student_id: user.id,
            status: "in_progress",
          })
          .select()
          .single();

        if (error) throw error;
        submissionId = newSubmission.id;
        setSubmission(newSubmission);
      }

      const newFileUrls: string[] = [];

      for (const file of Array.from(files)) {
        const fileName = `${user.id}/${submissionId}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("assignment-submissions")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        newFileUrls.push(fileName);
      }

      const allFileUrls = [...uploadedFiles, ...newFileUrls];
      setUploadedFiles(allFileUrls);

      // Update submission with file URLs
      const { error: updateError } = await supabase
        .from("assignment_submissions")
        .update({ file_urls: allFileUrls })
        .eq("id", submissionId);

      if (updateError) throw updateError;

      toast.success(`${files.length} file(s) uploaded successfully`);
      loadSubmission();
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      await processFiles(files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handleRemoveFile = async (fileUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from("assignment-submissions")
        .remove([fileUrl]);

      if (deleteError) throw deleteError;

      // Update submission
      const newFileUrls = uploadedFiles.filter(url => url !== fileUrl);
      setUploadedFiles(newFileUrls);

      const { error: updateError } = await supabase
        .from("assignment_submissions")
        .update({ file_urls: newFileUrls })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      toast.success("File removed");
      loadSubmission();
    } catch (error) {
      console.error("Error removing file:", error);
      toast.error("Failed to remove file");
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (submission) {
        // Update existing submission
        const { error } = await supabase
          .from("assignment_submissions")
          .update({
            status: "submitted",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", submission.id);

        if (error) throw error;
        toast.success("Assignment submitted!");
      } else {
        // Create new submission
        const { error } = await supabase
          .from("assignment_submissions")
          .insert({
            assignment_id: assignment.id,
            student_id: user.id,
            status: "submitted",
            submitted_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success("Assignment submitted!");
      }

      loadSubmission();
      onUpdate();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast.error("Failed to submit assignment");
    }
  };

  if (loading) return null;

  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isPastDue = dueDate && dueDate < new Date();
  const statusColors = {
    not_started: "bg-gray-500",
    in_progress: "bg-blue-500",
    submitted: "bg-yellow-500",
    graded: "bg-green-500",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription>
              {assignment.classes?.name}
              {dueDate && (
                <span className={`ml-2 ${isPastDue ? "text-destructive" : ""}`}>
                  • Due {dueDate.toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs text-white ${statusColors[submission?.status || "not_started"]}`}>
            {submission?.status?.replace("_", " ") || "Not Started"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {assignment.description && (
          <p className="text-sm text-muted-foreground">{assignment.description}</p>
        )}

        {/* File Upload Section */}
        {submission?.status !== "graded" && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Attachments</p>
            
            {/* Drag & Drop Zone */}
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-all duration-200 ease-in-out
                ${isDragging 
                  ? "border-primary bg-primary/10 scale-[1.02]" 
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                }
                ${uploading ? "pointer-events-none opacity-60" : ""}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="*/*"
              />
              
              <div className="flex flex-col items-center gap-2">
                <div className={`p-3 rounded-full transition-colors ${isDragging ? "bg-primary/20" : "bg-muted"}`}>
                  <Upload className={`w-6 h-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                {uploading ? (
                  <p className="text-sm text-muted-foreground">Uploading files...</p>
                ) : isDragging ? (
                  <p className="text-sm font-medium text-primary">Drop files here</p>
                ) : (
                  <>
                    <p className="text-sm font-medium">Drag & drop files here</p>
                    <p className="text-xs text-muted-foreground">or click to browse</p>
                  </>
                )}
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">{uploadedFiles.length} file(s) attached</p>
                {uploadedFiles.map((fileUrl, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[200px]">
                        {fileUrl.split('/').pop()}
                      </span>
                    </div>
                    {submission?.status !== "graded" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(fileUrl);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {submission?.feedback && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Feedback</p>
            <p className="text-sm text-muted-foreground">{submission.feedback}</p>
            {assignment.xp_reward && (
              <p className="text-sm text-primary font-bold mt-2">
                +{assignment.xp_reward} XP
              </p>
            )}
          </div>
        )}

        {submission?.status === "graded" ? (
          <Button disabled className="w-full">
            Graded
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="w-full" disabled={uploadedFiles.length === 0 && !submission}>
            {submission?.status === "submitted" ? "Resubmit" : "Submit Assignment"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

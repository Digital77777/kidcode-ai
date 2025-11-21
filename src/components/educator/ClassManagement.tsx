import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Class {
  id: string;
  name: string;
  description: string | null;
  subject: string | null;
  grade_level: string | null;
  studentCount?: number;
}

interface ClassManagementProps {
  onUpdate?: () => void;
}

export function ClassManagement({ onUpdate }: ClassManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    subject: "",
    grade_level: "",
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("educator_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load classes");
      return;
    }

    // Get student counts for each class
    const classesWithCounts = await Promise.all(
      (data || []).map(async (cls) => {
        const { count } = await supabase
          .from("class_enrollments")
          .select("*", { count: "exact", head: true })
          .eq("class_id", cls.id);
        
        return { ...cls, studentCount: count || 0 };
      })
    );

    setClasses(classesWithCounts);
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("classes").insert({
      educator_id: user.id,
      ...newClass,
    });

    if (error) {
      toast.error("Failed to create class");
      return;
    }

    toast.success("Class created successfully");
    setIsCreateDialogOpen(false);
    setNewClass({ name: "", description: "", subject: "", grade_level: "" });
    loadClasses();
    onUpdate?.();
  };

  const handleDeleteClass = async (classId: string) => {
    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", classId);

    if (error) {
      toast.error("Failed to delete class");
      return;
    }

    toast.success("Class deleted successfully");
    loadClasses();
    onUpdate?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">My Classes</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Add a new class to organize your students
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  value={newClass.name}
                  onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                  placeholder="e.g., Introduction to Coding"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newClass.subject}
                  onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Input
                  id="grade_level"
                  value={newClass.grade_level}
                  onChange={(e) => setNewClass({ ...newClass, grade_level: e.target.value })}
                  placeholder="e.g., 6-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newClass.description}
                  onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                  placeholder="Describe the class objectives..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full">Create Class</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card key={cls.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{cls.name}</CardTitle>
                  {cls.subject && (
                    <CardDescription className="mt-1">{cls.subject}</CardDescription>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClass(cls.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cls.description && (
                <p className="text-sm text-muted-foreground mb-3">{cls.description}</p>
              )}
              {cls.grade_level && (
                <p className="text-sm text-muted-foreground mb-3">Grade: {cls.grade_level}</p>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                {cls.studentCount} students
              </div>
            </CardContent>
          </Card>
        ))}

        {classes.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No classes yet. Create your first class to get started!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

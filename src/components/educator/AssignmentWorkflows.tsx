import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Award, Trash2, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { GradingInterface } from "./GradingInterface";

interface Class {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  xp_reward: number;
  class_id: string;
  classes: { name: string };
  submissionCount?: number;
}

interface AssignmentWorkflowsProps {
  onUpdate?: () => void;
}

export function AssignmentWorkflows({ onUpdate }: AssignmentWorkflowsProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    class_id: "",
    due_date: "",
    xp_reward: 100,
  });

  useEffect(() => {
    loadClasses();
    loadAssignments();
  }, []);

  const loadClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("classes")
      .select("id, name")
      .eq("educator_id", user.id)
      .order("name");

    setClasses(data || []);
  };

  const loadAssignments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("assignments")
      .select(`
        *,
        classes (name)
      `)
      .eq("educator_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load assignments");
      return;
    }

    // Get submission counts
    const assignmentsWithCounts = await Promise.all(
      (data || []).map(async (assignment) => {
        const { count } = await supabase
          .from("assignment_submissions")
          .select("*", { count: "exact", head: true })
          .eq("assignment_id", assignment.id);
        
        return { ...assignment, submissionCount: count || 0 };
      })
    );

    setAssignments(assignmentsWithCounts);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("assignments").insert({
      educator_id: user.id,
      ...newAssignment,
      due_date: newAssignment.due_date || null,
    });

    if (error) {
      toast.error("Failed to create assignment");
      return;
    }

    toast.success("Assignment created successfully");
    setIsCreateDialogOpen(false);
    setNewAssignment({
      title: "",
      description: "",
      class_id: "",
      due_date: "",
      xp_reward: 100,
    });
    loadAssignments();
    onUpdate?.();
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from("assignments")
      .delete()
      .eq("id", assignmentId);

    if (error) {
      toast.error("Failed to delete assignment");
      return;
    }

    toast.success("Assignment deleted successfully");
    loadAssignments();
    onUpdate?.();
  };

  const handleGradeClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsGradingOpen(true);
  };

  return (
    <div className="space-y-4">
      {selectedAssignment && (
        <GradingInterface
          assignment={selectedAssignment}
          isOpen={isGradingOpen}
          onClose={() => {
            setIsGradingOpen(false);
            setSelectedAssignment(null);
          }}
          onUpdate={() => {
            loadAssignments();
            onUpdate?.();
          }}
        />
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Assignment Workflows</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={classes.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
              <DialogDescription>
                Create an assignment for your students to complete
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  placeholder="e.g., Build a Calculator"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class *</Label>
                <Select
                  value={newAssignment.class_id}
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, class_id: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={newAssignment.due_date}
                  onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="xp_reward">XP Reward</Label>
                <Input
                  id="xp_reward"
                  type="number"
                  value={newAssignment.xp_reward}
                  onChange={(e) => setNewAssignment({ ...newAssignment, xp_reward: parseInt(e.target.value) })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  placeholder="Describe the assignment requirements..."
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full">Create Assignment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              Create a class first before adding assignments
            </p>
          </CardContent>
        </Card>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No assignments yet. Create your first assignment to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Assignments</CardTitle>
            <CardDescription>Manage and track assignment submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>XP Reward</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.title}</TableCell>
                    <TableCell>{assignment.classes.name}</TableCell>
                    <TableCell>
                      {assignment.due_date ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {format(new Date(assignment.due_date), "MMM d, yyyy")}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No due date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Award className="mr-1 h-3 w-3" />
                        {assignment.xp_reward} XP
                      </Badge>
                    </TableCell>
                    <TableCell>{assignment.submissionCount} submissions</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGradeClick(assignment)}
                          disabled={assignment.submissionCount === 0}
                        >
                          <GraduationCap className="mr-2 h-4 w-4" />
                          Grade
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

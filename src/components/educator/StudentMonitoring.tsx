import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";

interface Class {
  id: string;
  name: string;
}

interface StudentProgress {
  student_id: string;
  display_name: string;
  xp: number;
  level: number;
  lessons_completed: number;
  projects_completed: number;
  coins: number;
}

export function StudentMonitoring() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    }
  }, [selectedClass]);

  const loadClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("classes")
      .select("id, name")
      .eq("educator_id", user.id)
      .order("name");

    if (error) {
      toast.error("Failed to load classes");
      return;
    }

    setClasses(data || []);
    if (data && data.length > 0) {
      setSelectedClass(data[0].id);
    }
  };

  const loadStudents = async () => {
    if (!selectedClass) return;
    setLoading(true);

    // Get enrolled students
    const { data: enrollments, error: enrollError } = await supabase
      .from("class_enrollments")
      .select("student_id")
      .eq("class_id", selectedClass);

    if (enrollError) {
      toast.error("Failed to load students");
      setLoading(false);
      return;
    }

    if (!enrollments || enrollments.length === 0) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const studentIds = enrollments.map(e => e.student_id);

    // Get student profiles and progress
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", studentIds);

    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .in("user_id", studentIds);

    // Combine data
    const studentsData = profiles?.map(profile => {
      const studentProgress = progress?.find(p => p.user_id === profile.user_id);
      return {
        student_id: profile.user_id,
        display_name: profile.display_name,
        xp: studentProgress?.xp || 0,
        level: studentProgress?.level || 1,
        lessons_completed: studentProgress?.lessons_completed || 0,
        projects_completed: studentProgress?.projects_completed || 0,
        coins: studentProgress?.coins || 0,
      };
    }) || [];

    setStudents(studentsData);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Student Monitoring</h2>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-64">
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

      {loading ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Loading students...</p>
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No students enrolled in this class yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Class Progress Overview</CardTitle>
            <CardDescription>
              Monitor student progress and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Coins</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.student_id}>
                    <TableCell className="font-medium">{student.display_name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Award className="mr-1 h-3 w-3" />
                        Level {student.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                        {student.xp} XP
                      </div>
                    </TableCell>
                    <TableCell>{student.lessons_completed}</TableCell>
                    <TableCell>{student.projects_completed}</TableCell>
                    <TableCell>{student.coins}</TableCell>
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

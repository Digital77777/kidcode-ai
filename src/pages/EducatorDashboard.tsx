import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, ClipboardList, Plus } from "lucide-react";
import { ClassManagement } from "@/components/educator/ClassManagement";
import { StudentMonitoring } from "@/components/educator/StudentMonitoring";
import { AssignmentWorkflows } from "@/components/educator/AssignmentWorkflows";

export default function EducatorDashboard() {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    totalAssignments: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get total classes
    const { count: classCount } = await supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .eq("educator_id", user.id);

    // Get total unique students across all classes
    const { data: enrollments } = await supabase
      .from("class_enrollments")
      .select("student_id, classes!inner(educator_id)")
      .eq("classes.educator_id", user.id);

    const uniqueStudents = new Set(enrollments?.map(e => e.student_id) || []).size;

    // Get total assignments
    const { count: assignmentCount } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true })
      .eq("educator_id", user.id);

    setStats({
      totalClasses: classCount || 0,
      totalStudents: uniqueStudents,
      totalAssignments: assignmentCount || 0,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Educator Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage your classes, monitor students, and create assignments
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active learning groups
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all classes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAssignments}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active and completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="classes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="students">Student Monitoring</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4">
            <ClassManagement onUpdate={loadStats} />
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <StudentMonitoring />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <AssignmentWorkflows onUpdate={loadStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

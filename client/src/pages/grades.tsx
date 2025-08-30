import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import GradeEntry from "@/components/grades/grade-entry";
import Gradebook from "@/components/grades/gradebook";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Course, User } from "@shared/schema";

type CourseWithTeacher = Course & { teacher: User | null };

export default function Grades() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [showGradeEntry, setShowGradeEntry] = useState(false);
  
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery<CourseWithTeacher[]>({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const canManageGrades = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {user?.role === 'STUDENT' ? 'My Grades' : 'Grade Management'}
          </h2>
          <p className="text-muted-foreground">
            {user?.role === 'STUDENT' 
              ? 'View your grades and academic progress across all courses'
              : 'Enter and manage student grades across all courses'
            }
          </p>
        </div>
        {canManageGrades && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" data-testid="button-import-grades">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Dialog open={showGradeEntry} onOpenChange={setShowGradeEntry}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-grade">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Grade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Quick Grade Entry</DialogTitle>
                </DialogHeader>
                <GradeEntry onClose={() => setShowGradeEntry(false)} />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger data-testid="select-course">
                <SelectValue placeholder="Choose a course to view grades" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedCourse && (
              <Button variant="outline" data-testid="button-export-gradebook">
                <Download className="w-4 h-4 mr-2" />
                Export Gradebook
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gradebook */}
      {selectedCourse && (
        <Gradebook courseId={selectedCourse} />
      )}

      {!selectedCourse && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Select a course above to view and manage grades.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

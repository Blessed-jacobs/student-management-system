import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, CalendarCheck, Clock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import type { Course, User, Attendance, Student } from "@shared/schema";

type CourseWithTeacher = Course & { teacher: User | null };
type AttendanceWithStudent = Attendance & { student: Student & { user: User } };

export default function AttendancePage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: courses = [], isLoading: coursesLoading } = useQuery<CourseWithTeacher[]>({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/enrollments", selectedCourse],
    enabled: !!selectedCourse,
    retry: false,
  });

  const { data: existingAttendance = [], isLoading: attendanceLoading } = useQuery<AttendanceWithStudent[]>({
    queryKey: ["/api/attendance", selectedCourse, selectedDate],
    enabled: !!selectedCourse && !!selectedDate,
    retry: false,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecord: { studentId: string; courseId: string; date: string; status: string }) => {
      await apiRequest("POST", "/api/attendance", attendanceRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance", selectedCourse, selectedDate] });
      toast({
        title: "Success",
        description: "Attendance saved successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save attendance",
        variant: "destructive",
      });
    },
  });

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    if (!selectedCourse || !selectedDate) {
      toast({
        title: "Error",
        description: "Please select a course and date",
        variant: "destructive",
      });
      return;
    }

    const promises = Object.entries(attendanceData).map(([studentId, status]) =>
      markAttendanceMutation.mutateAsync({
        studentId,
        courseId: selectedCourse,
        date: selectedDate,
        status: status as any,
      })
    );

    Promise.all(promises);
  };

  // Initialize attendance data when existing attendance loads
  useState(() => {
    const initialData: Record<string, string> = {};
    existingAttendance.forEach(record => {
      initialData[record.studentId] = record.status;
    });
    setAttendanceData(initialData);
  }, [existingAttendance]);

  const canMarkAttendance = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  if (!canMarkAttendance) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View your attendance records across all courses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = coursesLoading || enrollmentsLoading || attendanceLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Attendance Management</h2>
        <p className="text-muted-foreground">Mark and track student attendance for your courses</p>
      </div>

      {/* Course and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Attendance Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger data-testid="select-course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                data-testid="input-date"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={handleSaveAttendance}
                disabled={!selectedCourse || !selectedDate || Object.keys(attendanceData).length === 0}
                className="w-full"
                data-testid="button-save-attendance"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Marking */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <CalendarCheck className="w-5 h-5 mr-2" />
                Student Attendance - {format(new Date(selectedDate), "MMMM d, yyyy")}
              </CardTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Session: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                      <div className="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                    <div className="w-32 h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students enrolled in this course.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment: any) => {
                  const student = enrollment.student;
                  const currentStatus = attendanceData[student.id] || existingAttendance.find(a => a.studentId === student.id)?.status || 'PRESENT';
                  
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`attendance-row-${student.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.user.profileImageUrl || ""} />
                          <AvatarFallback>
                            {student.user.firstName?.[0]}{student.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.studentId} • {student.gradeLevel.replace('GRADE_', 'Grade ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Select
                          value={currentStatus}
                          onValueChange={(value) => handleAttendanceChange(student.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                                Present
                              </div>
                            </SelectItem>
                            <SelectItem value="ABSENT">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                Absent
                              </div>
                            </SelectItem>
                            <SelectItem value="LATE">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                                Late
                              </div>
                            </SelectItem>
                            <SelectItem value="EXCUSED">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                Excused
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Badge
                          variant={
                            currentStatus === 'PRESENT' ? 'default' :
                            currentStatus === 'LATE' ? 'secondary' :
                            currentStatus === 'EXCUSED' ? 'outline' : 'destructive'
                          }
                        >
                          {currentStatus}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {selectedCourse && enrollments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {Object.values(attendanceData).filter(status => status === 'PRESENT').length}
                </p>
                <p className="text-sm text-muted-foreground">Present</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(attendanceData).filter(status => status === 'ABSENT').length}
                </p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {Object.values(attendanceData).filter(status => status === 'LATE').length}
                </p>
                <p className="text-sm text-muted-foreground">Late</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {Object.values(attendanceData).filter(status => status === 'EXCUSED').length}
                </p>
                <p className="text-sm text-muted-foreground">Excused</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

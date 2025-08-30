import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertAttendanceSchema, type InsertAttendance } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import { z } from "zod";

const attendanceFormSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  date: z.string().min(1, "Date is required"),
});

type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

interface AttendanceFormProps {
  onClose?: () => void;
}

export default function AttendanceForm({ onClose }: AttendanceFormProps) {
  const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      courseId: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const selectedCourseId = form.watch("courseId");
  const selectedDate = form.watch("date");

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/enrollments", selectedCourseId],
    enabled: !!selectedCourseId,
    retry: false,
  });

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ["/api/attendance", selectedCourseId, selectedDate],
    enabled: !!selectedCourseId && !!selectedDate,
    retry: false,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (attendanceRecord: InsertAttendance) => {
      await apiRequest("POST", "/api/attendance", attendanceRecord);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance"] });
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

  // Initialize attendance data when existing attendance loads
  useState(() => {
    const initialData: Record<string, string> = {};
    existingAttendance.forEach((record: any) => {
      initialData[record.studentId] = record.status;
    });
    // Set default status for new students
    enrollments.forEach((enrollment: any) => {
      if (!initialData[enrollment.student.id]) {
        initialData[enrollment.student.id] = 'PRESENT';
      }
    });
    setAttendanceData(initialData);
  }, [existingAttendance, enrollments]);

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = () => {
    const formData = form.getValues();
    if (!formData.courseId || !formData.date) {
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
        courseId: formData.courseId,
        date: formData.date,
        status: status as any,
      })
    );

    Promise.all(promises).then(() => {
      if (onClose) onClose();
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'default';
      case 'LATE': return 'secondary';
      case 'EXCUSED': return 'outline';
      case 'ABSENT': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusCounts = () => {
    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
    Object.values(attendanceData).forEach(status => {
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      <Form {...form}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Attendance Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-course">
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course: any) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <input
                        type="date"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        data-testid="input-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </Form>

      {selectedCourseId && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{statusCounts.PRESENT}</div>
                <div className="text-sm text-muted-foreground">Present</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{statusCounts.ABSENT}</div>
                <div className="text-sm text-muted-foreground">Absent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{statusCounts.LATE}</div>
                <div className="text-sm text-muted-foreground">Late</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.EXCUSED}</div>
                <div className="text-sm text-muted-foreground">Excused</div>
              </CardContent>
            </Card>
          </div>

          {/* Student List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Student Attendance - {format(new Date(selectedDate), "MMMM d, yyyy")}
                </CardTitle>
                <Button
                  onClick={handleSaveAttendance}
                  disabled={!selectedCourseId || !selectedDate || Object.keys(attendanceData).length === 0}
                  data-testid="button-save-attendance"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Attendance
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No students enrolled in this course.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment: any) => {
                    const student = enrollment.student;
                    const currentStatus = attendanceData[student.id] || 'PRESENT';
                    
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
                          
                          <Badge variant={getStatusBadgeVariant(currentStatus)}>
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
        </>
      )}
    </div>
  );
}

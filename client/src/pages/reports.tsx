import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, Users, Calendar, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { Course, User } from "@shared/schema";

type CourseWithTeacher = Course & { teacher: User | null };

export default function Reports() {
  const [reportType, setReportType] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [dateRange, setDateRange] = useState("");
  
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery<CourseWithTeacher[]>({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const reportTypes = [
    {
      id: "student-grades",
      name: "Student Grade Report",
      description: "Comprehensive grade report for individual students",
      icon: Award,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
    },
    {
      id: "attendance-summary",
      name: "Attendance Summary",
      description: "Attendance statistics and trends by course or student",
      icon: Calendar,
      color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
    },
    {
      id: "course-performance",
      name: "Course Performance",
      description: "Overall performance metrics and analytics for courses",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
    },
    {
      id: "class-roster",
      name: "Class Roster",
      description: "Student enrollment and contact information by course",
      icon: Users,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
    },
    {
      id: "transcript",
      name: "Student Transcript",
      description: "Official academic transcript with all completed courses",
      icon: FileText,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
    }
  ];

  const handleGenerateReport = () => {
    // Implementation would depend on backend report generation
    console.log("Generating report:", { reportType, selectedCourse, dateRange });
  };

  const canGenerateReports = user?.role === 'ADMIN' || user?.role === 'TEACHER';

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
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {user?.role === 'STUDENT' ? 'My Reports' : 'Reports & Analytics'}
        </h2>
        <p className="text-muted-foreground">
          {user?.role === 'STUDENT' 
            ? 'Download your academic reports and transcripts'
            : 'Generate comprehensive reports and analyze academic data'
          }
        </p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = reportType === report.id;
          
          return (
            <Card 
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => setReportType(report.id)}
              data-testid={`card-report-${report.id}`}
            >
              <CardHeader>
                <div className="flex items-start space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${report.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              {isSelected && (
                <CardContent className="pt-0">
                  <Badge variant="default">Selected</Badge>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Report Configuration */}
      {reportType && (
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Course (Optional)
                </label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger data-testid="select-course">
                    <SelectValue placeholder="All courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date Range
                </label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger data-testid="select-date-range">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-term">Current Term</SelectItem>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-semester">Last Semester</SelectItem>
                    <SelectItem value="current-year">Current Academic Year</SelectItem>
                    <SelectItem value="all-time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={handleGenerateReport}
                  className="w-full"
                  data-testid="button-generate-report"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>

            {user?.role === 'STUDENT' && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> As a student, you can only generate reports for your own academic data.
                  Contact your teacher or administrator for class-wide reports.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Grade Report - Mathematics 101</p>
                  <p className="text-sm text-muted-foreground">Generated 2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-download-recent">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Attendance Summary - All Courses</p>
                  <p className="text-sm text-muted-foreground">Generated yesterday</p>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-download-recent">
                <Download className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Official Transcript</p>
                  <p className="text-sm text-muted-foreground">Generated last week</p>
                </div>
              </div>
              <Button variant="outline" size="sm" data-testid="button-download-recent">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {reportType === "" && (
            <div className="text-center py-4 border-t mt-4">
              <p className="text-muted-foreground">
                Select a report type above to generate a new report.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

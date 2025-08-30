import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, CalendarCheck, TrendingUp, Plus, Download, Edit, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

interface DashboardStats {
  totalStudents: number;
  activeCourses: number;
  attendanceRate: number;
  averageGrade: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isStudent ? "My Courses" : "Total Students"}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-total-students">
                  {isStudent ? stats?.activeCourses || 0 : stats?.totalStudents || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600">↗ 5.2%</span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isStudent ? "Enrolled Courses" : "Active Courses"}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-active-courses">
                  {stats?.activeCourses || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[hsl(var(--chart-2))]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600">↗ 2</span>
              <span className="text-muted-foreground ml-2">new this semester</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isStudent ? "My Attendance" : "Attendance Rate"}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-attendance-rate">
                  {stats?.attendanceRate || 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-[hsl(var(--chart-1))]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600">↗ 1.8%</span>
              <span className="text-muted-foreground ml-2">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isStudent ? "My Average" : "Average Grade"}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid="stat-average-grade">
                  {stats?.averageGrade || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[hsl(var(--chart-4))]" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-600">↗ 0.3</span>
              <span className="text-muted-foreground ml-2">grade points</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" data-testid="button-view-all">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {isStudent 
                        ? "Enrolled in Mathematics 101"
                        : "New student enrolled in Mathematics 101"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-chart-2 rounded-full flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {isStudent
                        ? "Attendance marked for Chemistry Lab"
                        : "Attendance recorded for Chemistry Lab - 95% present"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 bg-chart-1 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {isStudent
                        ? "Received grade for Physics Midterm - B+"
                        : "Grade reports generated for Physics Midterm"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!isStudent ? (
                <>
                  <Link href="/attendance">
                    <Button className="w-full justify-start" data-testid="button-mark-attendance">
                      <Plus className="w-4 h-4 mr-2" />
                      Mark Attendance
                    </Button>
                  </Link>
                  
                  <Link href="/grades">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-enter-grades">
                      <Edit className="w-4 h-4 mr-2" />
                      Enter Grades
                    </Button>
                  </Link>
                  
                  <Link href="/students">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-add-student">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Student
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/grades">
                    <Button className="w-full justify-start" data-testid="button-view-grades">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View My Grades
                    </Button>
                  </Link>
                  
                  <Link href="/attendance">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-view-attendance">
                      <CalendarCheck className="w-4 h-4 mr-2" />
                      View Attendance
                    </Button>
                  </Link>
                  
                  <Link href="/courses">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-view-courses">
                      <BookOpen className="w-4 h-4 mr-2" />
                      My Courses
                    </Button>
                  </Link>
                </>
              )}
              
              <Link href="/reports">
                <Button variant="outline" className="w-full justify-start" data-testid="button-generate-report">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>{isStudent ? "My Schedule" : "Today's Schedule"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Mathematics 101</h4>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  9:00 AM
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Room A-204 • 45 students</p>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="text-xs text-muted-foreground">
                  {isStudent ? "Present" : "Attendance: 42/45"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Physics Lab</h4>
                <span className="text-xs bg-chart-2 text-white px-2 py-1 rounded">
                  11:30 AM
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Lab B-101 • 24 students</p>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                <span className="text-xs text-muted-foreground">
                  {isStudent ? "Upcoming" : "Pending attendance"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">Chemistry 201</h4>
                <span className="text-xs bg-chart-1 text-white px-2 py-1 rounded">
                  2:00 PM
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Room C-305 • 38 students</p>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-xs text-muted-foreground">Upcoming</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

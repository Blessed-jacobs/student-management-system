import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Calendar, Eye } from "lucide-react";
import type { Course, User } from "@shared/schema";

type CourseWithTeacher = Course & { teacher: User | null };

interface CourseListProps {
  searchTerm?: string;
  gradeFilter?: string;
  statusFilter?: string;
}

export default function CourseList({ searchTerm = "", gradeFilter = "", statusFilter = "" }: CourseListProps) {
  const { data: courses = [], isLoading } = useQuery<CourseWithTeacher[]>({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !gradeFilter || course.gradeLevel === gradeFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'ACTIVE' && course.isActive) || 
      (statusFilter === 'INACTIVE' && !course.isActive);
    
    return matchesSearch && matchesGrade && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCourses.map((course) => (
        <Card key={course.id} className="hover:shadow-md transition-shadow" data-testid={`course-card-${course.id}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{course.name}</CardTitle>
                  <p className="text-sm text-muted-foreground font-mono">{course.code}</p>
                </div>
              </div>
              <Badge variant={course.isActive ? "default" : "secondary"}>
                {course.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.description || "No description available"}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Grade:</span>
                <span className="font-medium">{course.gradeLevel.replace('GRADE_', 'Grade ')}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Credits:</span>
                <span className="font-medium">{course.credits}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Max Students:</span>
                <span className="font-medium">{course.maxStudents}</span>
              </div>
            </div>

            {course.teacher && (
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={course.teacher.profileImageUrl || ""} />
                  <AvatarFallback className="text-xs">
                    {course.teacher.firstName?.[0]}{course.teacher.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {course.teacher.firstName} {course.teacher.lastName}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t">
              <Button variant="outline" size="sm" data-testid={`button-view-${course.id}`}>
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4 mr-1" />
                Enroll
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredCourses.length === 0 && (
        <div className="col-span-full text-center py-8">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No courses found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

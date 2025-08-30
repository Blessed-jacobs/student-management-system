import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Eye, Edit, Trash2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import type { Student, User } from "@shared/schema";

type StudentWithUser = Student & { user: User };

interface StudentListProps {
  searchTerm?: string;
  gradeFilter?: string;
  statusFilter?: string;
  onStudentSelect?: (student: StudentWithUser) => void;
  onStudentEdit?: (student: StudentWithUser) => void;
  onStudentDelete?: (studentId: string) => void;
  showActions?: boolean;
  showFilters?: boolean;
  maxHeight?: string;
  title?: string;
  courseId?: string; // For filtering students by course enrollment
}

export default function StudentList({
  searchTerm: externalSearchTerm = "",
  gradeFilter: externalGradeFilter = "",
  statusFilter: externalStatusFilter = "",
  onStudentSelect,
  onStudentEdit,
  onStudentDelete,
  showActions = true,
  showFilters = false,
  maxHeight,
  title = "Students",
  courseId
}: StudentListProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalGradeFilter, setInternalGradeFilter] = useState("");
  const [internalStatusFilter, setInternalStatusFilter] = useState("");

  // Use external filters if provided, otherwise use internal state
  const searchTerm = externalSearchTerm || internalSearchTerm;
  const gradeFilter = externalGradeFilter || internalGradeFilter;
  const statusFilter = externalStatusFilter || internalStatusFilter;

  const { data: students = [], isLoading } = useQuery<StudentWithUser[]>({
    queryKey: courseId ? ["/api/enrollments", courseId] : ["/api/students"],
    select: (data) => {
      if (courseId) {
        // If courseId is provided, extract students from enrollments
        return (data as any[]).map((enrollment: any) => enrollment.student);
      }
      return data;
    },
    retry: false,
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = !gradeFilter || student.gradeLevel === gradeFilter;
    const matchesStatus = !statusFilter || student.status === statusFilter;
    
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const handleStudentClick = (student: StudentWithUser) => {
    if (onStudentSelect) {
      onStudentSelect(student);
    }
  };

  const handleEditClick = (e: React.MouseEvent, student: StudentWithUser) => {
    e.stopPropagation();
    if (onStudentEdit) {
      onStudentEdit(student);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, studentId: string) => {
    e.stopPropagation();
    if (onStudentDelete) {
      onStudentDelete(studentId);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {title} ({filteredStudents.length})
          </div>
        </CardTitle>
        
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={internalSearchTerm}
                onChange={(e) => setInternalSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-students"
              />
            </div>
            <Select value={internalGradeFilter} onValueChange={setInternalGradeFilter}>
              <SelectTrigger data-testid="select-grade-filter">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                <SelectItem value="GRADE_9">Grade 9</SelectItem>
                <SelectItem value="GRADE_10">Grade 10</SelectItem>
                <SelectItem value="GRADE_11">Grade 11</SelectItem>
                <SelectItem value="GRADE_12">Grade 12</SelectItem>
              </SelectContent>
            </Select>
            <Select value={internalStatusFilter} onValueChange={setInternalStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="GRADUATED">Graduated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div 
          className="space-y-3"
          style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
        >
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-4 border border-border rounded-lg transition-colors ${
                onStudentSelect ? 'cursor-pointer hover:bg-muted/50' : ''
              }`}
              onClick={() => handleStudentClick(student)}
              data-testid={`student-item-${student.id}`}
            >
              <div className="flex items-center space-x-4 flex-1">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={student.user.profileImageUrl || ""} />
                  <AvatarFallback>
                    {student.user.firstName?.[0]}{student.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-foreground truncate">
                      {student.user.firstName} {student.user.lastName}
                    </p>
                    <Badge 
                      variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="flex-shrink-0"
                    >
                      {student.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                    <span className="truncate">{student.studentId}</span>
                    <span className="flex-shrink-0">{student.gradeLevel.replace('GRADE_', 'Grade ')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                    {student.user.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{student.user.email}</span>
                      </div>
                    )}
                    {student.guardianPhone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span className="truncate">{student.guardianPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {showActions && (
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    data-testid={`button-view-${student.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {onStudentEdit && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => handleEditClick(e, student)}
                      data-testid={`button-edit-${student.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  {onStudentDelete && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => handleDeleteClick(e, student.id)}
                      data-testid={`button-delete-${student.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || gradeFilter || statusFilter 
                  ? "No students found matching your criteria."
                  : courseId 
                    ? "No students enrolled in this course."
                    : "No students found."
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

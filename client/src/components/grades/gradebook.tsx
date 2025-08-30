import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface GradebookProps {
  courseId: string;
}

export default function Gradebook({ courseId }: GradebookProps) {
  const [gradeChanges, setGradeChanges] = useState<Record<string, number>>({});
  const [filterType, setFilterType] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: course } = useQuery({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
    retry: false,
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ["/api/enrollments", courseId],
    enabled: !!courseId,
    retry: false,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ["/api/assessments", courseId],
    enabled: !!courseId,
    retry: false,
  });

  const { data: grades = [] } = useQuery({
    queryKey: ["/api/grades", courseId],
    enabled: !!courseId,
    retry: false,
  });

  const updateGradeMutation = useMutation({
    mutationFn: async ({ gradeId, score }: { gradeId: string; score: number }) => {
      await apiRequest("PATCH", `/api/grades/${gradeId}`, { score });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades", courseId] });
      toast({
        title: "Success",
        description: "Grades saved successfully",
      });
      setGradeChanges({});
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
        description: "Failed to save grades",
        variant: "destructive",
      });
    },
  });

  const filteredAssessments = assessments.filter(assessment => 
    !filterType || assessment.type === filterType
  );

  const getGradeForStudentAssessment = (studentId: string, assessmentId: string) => {
    return grades.find(grade => 
      grade.studentId === studentId && grade.assessmentId === assessmentId
    );
  };

  const calculateStudentTotal = (studentId: string) => {
    let totalScore = 0;
    let totalPossible = 0;

    filteredAssessments.forEach(assessment => {
      const grade = getGradeForStudentAssessment(studentId, assessment.id);
      const gradeKey = `${studentId}-${assessment.id}`;
      const currentScore = gradeChanges[gradeKey] ?? (grade ? Number(grade.score) : 0);
      
      totalScore += currentScore * Number(assessment.weight);
      totalPossible += Number(assessment.maxScore) * Number(assessment.weight);
    });

    return totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
  };

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const handleGradeChange = (studentId: string, assessmentId: string, value: string) => {
    const gradeKey = `${studentId}-${assessmentId}`;
    const numValue = parseFloat(value) || 0;
    setGradeChanges(prev => ({
      ...prev,
      [gradeKey]: numValue
    }));
  };

  const handleSaveChanges = () => {
    const promises = Object.entries(gradeChanges).map(([gradeKey, score]) => {
      const [studentId, assessmentId] = gradeKey.split('-');
      const existingGrade = getGradeForStudentAssessment(studentId, assessmentId);
      
      if (existingGrade) {
        return updateGradeMutation.mutateAsync({
          gradeId: existingGrade.id,
          score
        });
      }
      // For new grades, we'd need a create mutation
      return Promise.resolve();
    });

    Promise.all(promises);
  };

  const canEditGrades = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  if (!courseId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Select a course to view the gradebook.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {course?.name} - Gradebook
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40" data-testid="select-assessment-filter">
                <SelectValue placeholder="All Assessments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Assessments</SelectItem>
                <SelectItem value="QUIZ">Quizzes Only</SelectItem>
                <SelectItem value="ASSIGNMENT">Assignments Only</SelectItem>
                <SelectItem value="MIDTERM">Midterms Only</SelectItem>
                <SelectItem value="FINAL">Finals Only</SelectItem>
                <SelectItem value="PROJECT">Projects Only</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" data-testid="button-export">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-muted min-w-[200px]">
                  Student
                </th>
                {filteredAssessments.map((assessment) => (
                  <th key={assessment.id} className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[100px]">
                    <div>{assessment.name}</div>
                    <div className="font-normal">({assessment.maxScore} pts)</div>
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[80px]">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-[80px]">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {enrollments.map((enrollment: any) => {
                const student = enrollment.student;
                const totalPercentage = calculateStudentTotal(student.id);
                const letterGrade = getLetterGrade(totalPercentage);
                
                return (
                  <tr key={student.id} data-testid={`gradebook-row-${student.id}`}>
                    <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-card min-w-[200px]">
                      <div className="flex items-center">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={student.user.profileImageUrl || ""} />
                          <AvatarFallback className="text-xs">
                            {student.user.firstName?.[0]}{student.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-foreground">
                            {student.user.firstName} {student.user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {student.studentId}
                          </div>
                        </div>
                      </div>
                    </td>
                    {filteredAssessments.map((assessment) => {
                      const grade = getGradeForStudentAssessment(student.id, assessment.id);
                      const gradeKey = `${student.id}-${assessment.id}`;
                      const currentValue = gradeChanges[gradeKey] ?? (grade ? Number(grade.score) : "");
                      
                      return (
                        <td key={assessment.id} className="px-4 py-4 text-center">
                          {canEditGrades ? (
                            <Input
                              type="number"
                              min="0"
                              max={Number(assessment.maxScore)}
                              step="0.01"
                              value={currentValue}
                              onChange={(e) => handleGradeChange(student.id, assessment.id, e.target.value)}
                              className="w-20 text-center"
                              data-testid={`input-grade-${student.id}-${assessment.id}`}
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {grade ? Number(grade.score).toFixed(1) : "-"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center font-medium text-foreground">
                      {totalPercentage.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge
                        variant={
                          letterGrade === 'A' ? 'default' :
                          letterGrade === 'B' ? 'secondary' :
                          letterGrade === 'C' ? 'outline' :
                          'destructive'
                        }
                      >
                        {letterGrade}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {enrollments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No students enrolled in this course.</p>
          </div>
        )}

        {canEditGrades && Object.keys(gradeChanges).length > 0 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {Object.keys(gradeChanges).length} unsaved changes
            </div>
            <Button onClick={handleSaveChanges} data-testid="button-save-grades">
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

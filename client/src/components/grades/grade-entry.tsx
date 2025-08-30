import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertGradeSchema, type InsertGrade } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

const gradeEntrySchema = insertGradeSchema.extend({
  courseId: z.string().min(1, "Course is required"),
  assessmentId: z.string().min(1, "Assessment is required"),
});

type GradeEntryData = z.infer<typeof gradeEntrySchema>;

interface GradeEntryProps {
  onClose: () => void;
}

export default function GradeEntry({ onClose }: GradeEntryProps) {
  const { toast } = useToast();
  
  const form = useForm<GradeEntryData>({
    resolver: zodResolver(gradeEntrySchema),
    defaultValues: {
      studentId: "",
      assessmentId: "",
      score: 0,
      letterGrade: "",
      feedback: "",
      courseId: "",
    },
  });

  const selectedCourseId = form.watch("courseId");

  const { data: courses = [] } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["/api/enrollments", selectedCourseId],
    enabled: !!selectedCourseId,
    retry: false,
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ["/api/assessments", selectedCourseId],
    enabled: !!selectedCourseId,
    retry: false,
  });

  const createGradeMutation = useMutation({
    mutationFn: async (data: Omit<GradeEntryData, "courseId">) => {
      await apiRequest("POST", "/api/grades", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
      toast({
        title: "Success",
        description: "Grade saved successfully",
      });
      onClose();
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
        description: "Failed to save grade",
        variant: "destructive",
      });
    },
  });

  const calculateLetterGrade = (score: number, maxScore: number = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const onSubmit = (data: GradeEntryData) => {
    const selectedAssessment = assessments.find(a => a.id === data.assessmentId);
    const maxScore = selectedAssessment?.maxScore || 100;
    
    const gradeData = {
      ...data,
      letterGrade: data.letterGrade || calculateLetterGrade(Number(data.score), Number(maxScore)),
    };

    // Remove courseId as it's not part of the grade schema
    const { courseId, ...gradePayload } = gradeData;
    createGradeMutation.mutate(gradePayload);
  };

  const isLoading = createGradeMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          name="assessmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assessment</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCourseId}>
                <FormControl>
                  <SelectTrigger data-testid="select-assessment">
                    <SelectValue placeholder="Select an assessment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assessments.map((assessment: any) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.name} ({assessment.type}) - {assessment.maxScore} pts
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
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCourseId}>
                <FormControl>
                  <SelectTrigger data-testid="select-student">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((enrollment: any) => (
                    <SelectItem key={enrollment.student.id} value={enrollment.student.id}>
                      {enrollment.student.user.firstName} {enrollment.student.user.lastName} ({enrollment.student.studentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Score</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0" 
                    step="0.01"
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    data-testid="input-score"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="letterGrade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Letter Grade (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-letter-grade">
                      <SelectValue placeholder="Auto-calculated" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Auto-calculate</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Provide feedback for the student..."
                  data-testid="textarea-feedback"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="button-save"
          >
            {isLoading ? "Saving..." : "Save Grade"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

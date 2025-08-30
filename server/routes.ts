import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertStudentSchema, 
  insertCourseSchema, 
  insertEnrollmentSchema, 
  insertAttendanceSchema, 
  insertAssessmentSchema, 
  insertGradeSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Student routes
  app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post('/api/students', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.patch('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      const partialSchema = insertStudentSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete('/api/students/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(validatedData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.patch('/api/courses/:id', isAuthenticated, async (req, res) => {
    try {
      const partialSchema = insertCourseSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const course = await storage.updateCourse(req.params.id, validatedData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete('/api/courses/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCourse(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Enrollment routes
  app.get('/api/enrollments', isAuthenticated, async (req, res) => {
    try {
      const { courseId, studentId } = req.query;
      const enrollments = await storage.getEnrollments(
        courseId as string, 
        studentId as string
      );
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post('/api/enrollments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(validatedData);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.delete('/api/enrollments/:studentId/:courseId', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEnrollment(req.params.studentId, req.params.courseId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      res.status(500).json({ message: "Failed to delete enrollment" });
    }
  });

  // Attendance routes
  app.get('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const { courseId, date } = req.query;
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }
      const attendance = await storage.getAttendance(courseId as string, date as string);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse({
        ...req.body,
        markedBy: req.user.claims.sub,
      });
      const attendance = await storage.markAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  app.patch('/api/attendance/:id', isAuthenticated, async (req, res) => {
    try {
      const partialSchema = insertAttendanceSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const attendance = await storage.updateAttendance(req.params.id, validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // Assessment routes
  app.get('/api/assessments', isAuthenticated, async (req, res) => {
    try {
      const { courseId } = req.query;
      const assessments = await storage.getAssessments(courseId as string);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.post('/api/assessments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.patch('/api/assessments/:id', isAuthenticated, async (req, res) => {
    try {
      const partialSchema = insertAssessmentSchema.partial();
      const validatedData = partialSchema.parse(req.body);
      const assessment = await storage.updateAssessment(req.params.id, validatedData);
      res.json(assessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  app.delete('/api/assessments/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteAssessment(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });

  // Grade routes
  app.get('/api/grades', isAuthenticated, async (req, res) => {
    try {
      const { studentId, courseId, assessmentId } = req.query;
      const grades = await storage.getGrades(
        studentId as string,
        courseId as string,
        assessmentId as string
      );
      res.json(grades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ message: "Failed to fetch grades" });
    }
  });

  app.post('/api/grades', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertGradeSchema.parse({
        ...req.body,
        gradedBy: req.user.claims.sub,
      });
      const grade = await storage.createGrade(validatedData);
      res.status(201).json(grade);
    } catch (error) {
      console.error("Error creating grade:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create grade" });
    }
  });

  app.patch('/api/grades/:id', isAuthenticated, async (req: any, res) => {
    try {
      const partialSchema = insertGradeSchema.partial();
      const validatedData = partialSchema.parse({
        ...req.body,
        gradedBy: req.user.claims.sub,
      });
      const grade = await storage.updateGrade(req.params.id, validatedData);
      res.json(grade);
    } catch (error) {
      console.error("Error updating grade:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update grade" });
    }
  });

  app.delete('/api/grades/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteGrade(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting grade:", error);
      res.status(500).json({ message: "Failed to delete grade" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

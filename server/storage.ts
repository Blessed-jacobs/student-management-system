import {
  users,
  students,
  courses,
  enrollments,
  attendance,
  assessments,
  grades,
  type User,
  type UpsertUser,
  type Student,
  type InsertStudent,
  type Course,
  type InsertCourse,
  type Enrollment,
  type InsertEnrollment,
  type Attendance,
  type InsertAttendance,
  type Assessment,
  type InsertAssessment,
  type Grade,
  type InsertGrade,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Student operations
  getStudents(): Promise<(Student & { user: User })[]>;
  getStudent(id: string): Promise<(Student & { user: User }) | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;

  // Course operations
  getCourses(): Promise<(Course & { teacher: User | null })[]>;
  getCourse(id: string): Promise<(Course & { teacher: User | null }) | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: string): Promise<void>;

  // Enrollment operations
  getEnrollments(courseId?: string, studentId?: string): Promise<(Enrollment & { student: Student & { user: User }, course: Course })[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  deleteEnrollment(studentId: string, courseId: string): Promise<void>;

  // Attendance operations
  getAttendance(courseId: string, date?: string): Promise<(Attendance & { student: Student & { user: User } })[]>;
  markAttendance(attendanceData: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendanceData: Partial<InsertAttendance>): Promise<Attendance>;

  // Assessment operations
  getAssessments(courseId?: string): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment>;
  deleteAssessment(id: string): Promise<void>;

  // Grade operations
  getGrades(studentId?: string, courseId?: string, assessmentId?: string): Promise<(Grade & { student: Student & { user: User }, assessment: Assessment })[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade>;
  deleteGrade(id: string): Promise<void>;

  // Statistics
  getDashboardStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    attendanceRate: number;
    averageGrade: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Student operations
  async getStudents(): Promise<(Student & { user: User })[]> {
    const result = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .orderBy(desc(students.createdAt));
    
    return result.map(row => ({
      ...row.students,
      user: row.users,
    }));
  }

  async getStudent(id: string): Promise<(Student & { user: User }) | undefined> {
    const [result] = await db
      .select()
      .from(students)
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(students.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.students,
      user: result.users,
    };
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(student)
      .returning();
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set({ ...student, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  // Course operations
  async getCourses(): Promise<(Course & { teacher: User | null })[]> {
    const result = await db
      .select()
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .orderBy(desc(courses.createdAt));
    
    return result.map(row => ({
      ...row.courses,
      teacher: row.users,
    }));
  }

  async getCourse(id: string): Promise<(Course & { teacher: User | null }) | undefined> {
    const [result] = await db
      .select()
      .from(courses)
      .leftJoin(users, eq(courses.teacherId, users.id))
      .where(eq(courses.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.courses,
      teacher: result.users,
    };
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db
      .insert(courses)
      .values(course)
      .returning();
    return newCourse;
  }

  async updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: string): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Enrollment operations
  async getEnrollments(courseId?: string, studentId?: string): Promise<(Enrollment & { student: Student & { user: User }, course: Course })[]> {
    let query = db
      .select()
      .from(enrollments)
      .innerJoin(students, eq(enrollments.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(courses, eq(enrollments.courseId, courses.id));

    if (courseId) {
      query = query.where(eq(enrollments.courseId, courseId));
    }
    if (studentId) {
      query = query.where(eq(enrollments.studentId, studentId));
    }

    const result = await query;
    
    return result.map(row => ({
      ...row.enrollments,
      student: {
        ...row.students,
        user: row.users,
      },
      course: row.courses,
    }));
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db
      .insert(enrollments)
      .values(enrollment)
      .returning();
    return newEnrollment;
  }

  async deleteEnrollment(studentId: string, courseId: string): Promise<void> {
    await db
      .delete(enrollments)
      .where(
        and(
          eq(enrollments.studentId, studentId),
          eq(enrollments.courseId, courseId)
        )
      );
  }

  // Attendance operations
  async getAttendance(courseId: string, date?: string): Promise<(Attendance & { student: Student & { user: User } })[]> {
    let query = db
      .select()
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .where(eq(attendance.courseId, courseId));

    if (date) {
      query = query.where(and(eq(attendance.courseId, courseId), eq(attendance.date, date)));
    }

    const result = await query.orderBy(desc(attendance.date));
    
    return result.map(row => ({
      ...row.attendance,
      student: {
        ...row.students,
        user: row.users,
      },
    }));
  }

  async markAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db
      .insert(attendance)
      .values(attendanceData)
      .onConflictDoUpdate({
        target: [attendance.studentId, attendance.courseId, attendance.date],
        set: {
          status: attendanceData.status,
          notes: attendanceData.notes,
          markedBy: attendanceData.markedBy,
          markedAt: new Date(),
        },
      })
      .returning();
    return newAttendance;
  }

  async updateAttendance(id: string, attendanceData: Partial<InsertAttendance>): Promise<Attendance> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set(attendanceData)
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }

  // Assessment operations
  async getAssessments(courseId?: string): Promise<Assessment[]> {
    let query = db.select().from(assessments);
    
    if (courseId) {
      query = query.where(eq(assessments.courseId, courseId));
    }
    
    return await query.orderBy(desc(assessments.createdAt));
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db
      .insert(assessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set({ ...assessment, updatedAt: new Date() })
      .where(eq(assessments.id, id))
      .returning();
    return updatedAssessment;
  }

  async deleteAssessment(id: string): Promise<void> {
    await db.delete(assessments).where(eq(assessments.id, id));
  }

  // Grade operations
  async getGrades(studentId?: string, courseId?: string, assessmentId?: string): Promise<(Grade & { student: Student & { user: User }, assessment: Assessment })[]> {
    let query = db
      .select()
      .from(grades)
      .innerJoin(students, eq(grades.studentId, students.id))
      .innerJoin(users, eq(students.userId, users.id))
      .innerJoin(assessments, eq(grades.assessmentId, assessments.id));

    const conditions = [];
    if (studentId) conditions.push(eq(grades.studentId, studentId));
    if (courseId) conditions.push(eq(assessments.courseId, courseId));
    if (assessmentId) conditions.push(eq(grades.assessmentId, assessmentId));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(desc(grades.gradedAt));
    
    return result.map(row => ({
      ...row.grades,
      student: {
        ...row.students,
        user: row.users,
      },
      assessment: row.assessments,
    }));
  }

  async createGrade(grade: InsertGrade): Promise<Grade> {
    const [newGrade] = await db
      .insert(grades)
      .values(grade)
      .onConflictDoUpdate({
        target: [grades.studentId, grades.assessmentId],
        set: {
          score: grade.score,
          letterGrade: grade.letterGrade,
          feedback: grade.feedback,
          gradedBy: grade.gradedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return newGrade;
  }

  async updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade> {
    const [updatedGrade] = await db
      .update(grades)
      .set({ ...grade, updatedAt: new Date() })
      .where(eq(grades.id, id))
      .returning();
    return updatedGrade;
  }

  async deleteGrade(id: string): Promise<void> {
    await db.delete(grades).where(eq(grades.id, id));
  }

  // Statistics
  async getDashboardStats(): Promise<{
    totalStudents: number;
    activeCourses: number;
    attendanceRate: number;
    averageGrade: number;
  }> {
    const [studentsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(eq(students.status, 'ACTIVE'));

    const [coursesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(courses)
      .where(eq(courses.isActive, true));

    const [attendanceData] = await db
      .select({
        present: sql<number>`count(*) filter (where status = 'PRESENT')`,
        total: sql<number>`count(*)`
      })
      .from(attendance)
      .where(sql`date >= current_date - interval '30 days'`);

    const [gradeData] = await db
      .select({ avgScore: sql<number>`avg(score)` })
      .from(grades);

    const attendanceRate = attendanceData?.total > 0 ? 
      (attendanceData.present / attendanceData.total) * 100 : 0;

    return {
      totalStudents: studentsCount?.count || 0,
      activeCourses: coursesCount?.count || 0,
      attendanceRate: Math.round(attendanceRate * 10) / 10,
      averageGrade: Math.round((gradeData?.avgScore || 0) * 10) / 10,
    };
  }
}

export const storage = new DatabaseStorage();

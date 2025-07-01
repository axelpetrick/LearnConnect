import { users, courses, courseEnrollments, notes, forumTopics, forumComments, commentVotes, topicVotes, noteCompletions, attendanceRecords, type User, type InsertUser, type Course, type InsertCourse, type CourseEnrollment, type Note, type InsertNote, type ForumTopic, type InsertForumTopic, type ForumComment, type InsertForumComment, type CommentVote, type TopicVote, type AttendanceRecord } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCoursesByAuthor(authorId: number): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // Enrollment methods
  enrollInCourse(userId: number, courseId: number): Promise<CourseEnrollment>;
  getUserEnrollments(userId: number): Promise<CourseEnrollment[]>;
  getCourseEnrollments(courseId: number): Promise<CourseEnrollment[]>;
  updateProgress(userId: number, courseId: number, progress: number): Promise<void>;
  setStudentGrade(studentId: number, courseId: number, grade: number): Promise<void>;
  removeStudentFromCourse(studentId: number, courseId: number): Promise<void>;
  getStudentsByRole(role: string): Promise<User[]>;
  
  // Note methods
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  getNotesByAuthor(authorId: number): Promise<Note[]>;
  getNotesByCourse(courseId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Note completion methods
  markNoteAsCompleted(userId: number, noteId: number): Promise<void>;
  unmarkNoteAsCompleted(userId: number, noteId: number): Promise<void>;
  getCompletedNotes(userId: number): Promise<number[]>;
  
  // Forum methods
  getForumTopics(): Promise<ForumTopic[]>;
  getForumTopic(id: number): Promise<ForumTopic | undefined>;
  getForumTopicsByCourse(courseId: number): Promise<ForumTopic[]>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  updateForumTopic(id: number, topic: Partial<InsertForumTopic>): Promise<ForumTopic | undefined>;
  incrementTopicViews(id: number): Promise<void>;
  deleteForumTopic(id: number): Promise<boolean>;
  
  getForumComments(topicId: number): Promise<ForumComment[]>;
  getForumComment(id: number): Promise<ForumComment | undefined>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  updateForumComment(id: number, comment: Partial<InsertForumComment>): Promise<ForumComment | undefined>;
  deleteForumComment(id: number): Promise<boolean>;
  voteOnComment(userId: number, commentId: number, voteType: number): Promise<void>;
  voteOnTopic(userId: number, topicId: number, voteType: number): Promise<void>;
  
  // Attendance methods
  markAttendance(userId: number, courseId: number): Promise<void>;
  markAbsence(userId: number, courseId: number): Promise<void>;
  markAttendanceForDate(userId: number, courseId: number, date: string): Promise<void>;
  markAbsenceForDate(userId: number, courseId: number, date: string): Promise<void>;
  getAttendanceForDate(courseId: number, date: string): Promise<AttendanceRecord[]>;
  getStudentAttendanceRecords(userId: number, courseId: number): Promise<AttendanceRecord[]>;
  
  // Analytics methods
  getUserStats(userId: number): Promise<{
    coursesEnrolled: number;
    coursesCompleted: number;
    notesCreated: number;
    forumPosts: number;
  }>;
  getAdminStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalNotes: number;
  }>;
  getRecentActivityForProfessor(professorId: number): Promise<any[]>;
  getPopularDiscussions(): Promise<ForumTopic[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.firstName, users.lastName);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(desc(courses.createdAt));
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getCoursesByAuthor(authorId: number): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.authorId, authorId));
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async updateCourse(id: number, updateData: Partial<InsertCourse>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, id))
      .returning();
    return course || undefined;
  }

  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id));
    return result.rowCount > 0;
  }

  async enrollInCourse(userId: number, courseId: number): Promise<CourseEnrollment> {
    const [enrollment] = await db
      .insert(courseEnrollments)
      .values({
        userId,
        courseId,
        progress: 0,
        enrolledAt: new Date(),
      })
      .returning();
    return enrollment;
  }

  async getUserEnrollments(userId: number): Promise<CourseEnrollment[]> {
    return await db.select().from(courseEnrollments).where(eq(courseEnrollments.userId, userId));
  }

  async getCourseEnrollments(courseId: number): Promise<CourseEnrollment[]> {
    return await db.select().from(courseEnrollments).where(eq(courseEnrollments.courseId, courseId));
  }

  async updateProgress(userId: number, courseId: number, progress: number): Promise<void> {
    await db
      .update(courseEnrollments)
      .set({ progress })
      .where(
        and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId))
      );
  }

  async setStudentGrade(studentId: number, courseId: number, grade: number): Promise<void> {
    await db
      .update(courseEnrollments)
      .set({ grade })
      .where(
        and(eq(courseEnrollments.userId, studentId), eq(courseEnrollments.courseId, courseId))
      );
  }

  async removeStudentFromCourse(studentId: number, courseId: number): Promise<void> {
    await db.delete(courseEnrollments).where(
      and(eq(courseEnrollments.userId, studentId), eq(courseEnrollments.courseId, courseId))
    );
  }

  async getStudentsByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes).orderBy(desc(notes.createdAt));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note || undefined;
  }

  async getNotesByAuthor(authorId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.authorId, authorId));
  }

  async getNotesByCourse(courseId: number): Promise<Note[]> {
    return await db.select().from(notes).where(eq(notes.courseId, courseId));
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db
      .insert(notes)
      .values(insertNote)
      .returning();
    return note;
  }

  async updateNote(id: number, updateData: Partial<InsertNote>): Promise<Note | undefined> {
    const [note] = await db
      .update(notes)
      .set(updateData)
      .where(eq(notes.id, id))
      .returning();
    return note || undefined;
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id));
    return result.rowCount > 0;
  }

  async markNoteAsCompleted(userId: number, noteId: number): Promise<void> {
    await db
      .insert(noteCompletions)
      .values({ userId, noteId, completedAt: new Date() })
      .onConflictDoNothing();
  }

  async unmarkNoteAsCompleted(userId: number, noteId: number): Promise<void> {
    await db
      .delete(noteCompletions)
      .where(and(eq(noteCompletions.userId, userId), eq(noteCompletions.noteId, noteId)));
  }

  async getCompletedNotes(userId: number): Promise<number[]> {
    const completions = await db
      .select({ noteId: noteCompletions.noteId })
      .from(noteCompletions)
      .where(eq(noteCompletions.userId, userId));
    return completions.map(c => c.noteId);
  }

  async getForumTopics(): Promise<ForumTopic[]> {
    const topics = await db
      .select({
        id: forumTopics.id,
        createdAt: forumTopics.createdAt,
        title: forumTopics.title,
        content: forumTopics.content,
        authorId: forumTopics.authorId,
        tags: forumTopics.tags,
        updatedAt: forumTopics.updatedAt,
        courseId: forumTopics.courseId,
        isPinned: forumTopics.isPinned,
        views: forumTopics.views,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorUsername: users.username,
        authorRole: users.role,
        authorEmail: users.email,
        authorAvatar: users.avatar,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .orderBy(desc(forumTopics.createdAt));

    return topics.map(topic => ({
      id: topic.id,
      createdAt: topic.createdAt,
      title: topic.title,
      content: topic.content,
      authorId: topic.authorId,
      tags: topic.tags,
      updatedAt: topic.updatedAt,
      courseId: topic.courseId,
      isPinned: topic.isPinned,
      views: topic.views,
      author: {
        id: topic.authorId,
        firstName: topic.authorFirstName,
        lastName: topic.authorLastName,
        username: topic.authorUsername,
        email: topic.authorEmail,
        role: topic.authorRole,
        avatar: topic.authorAvatar,
        createdAt: new Date(),
      },
      commentCount: 0,
      voteScore: 0,
    }));
  }

  async getForumTopic(id: number): Promise<ForumTopic | undefined> {
    const [topic] = await db.select().from(forumTopics).where(eq(forumTopics.id, id));
    return topic || undefined;
  }

  async getForumTopicsByCourse(courseId: number): Promise<ForumTopic[]> {
    return await db.select().from(forumTopics).where(eq(forumTopics.courseId, courseId));
  }

  async createForumTopic(insertTopic: InsertForumTopic): Promise<ForumTopic> {
    const [topic] = await db
      .insert(forumTopics)
      .values(insertTopic)
      .returning();
    return topic;
  }

  async updateForumTopic(id: number, updateData: Partial<InsertForumTopic>): Promise<ForumTopic | undefined> {
    const [topic] = await db
      .update(forumTopics)
      .set(updateData)
      .where(eq(forumTopics.id, id))
      .returning();
    return topic || undefined;
  }

  async incrementTopicViews(id: number): Promise<void> {
    await db
      .update(forumTopics)
      .set({ views: sql`${forumTopics.views} + 1` })
      .where(eq(forumTopics.id, id));
  }

  async deleteForumTopic(id: number): Promise<boolean> {
    const result = await db.delete(forumTopics).where(eq(forumTopics.id, id));
    return result.rowCount > 0;
  }

  async getForumComments(topicId: number): Promise<ForumComment[]> {
    const comments = await db
      .select({
        id: forumComments.id,
        createdAt: forumComments.createdAt,
        content: forumComments.content,
        authorId: forumComments.authorId,
        updatedAt: forumComments.updatedAt,
        topicId: forumComments.topicId,
        parentId: forumComments.parentId,
        votes: forumComments.votes,
        isAnonymous: forumComments.isAnonymous,
        authorFirstName: users.firstName,
        authorLastName: users.lastName,
        authorUsername: users.username,
        authorRole: users.role,
        authorEmail: users.email,
        authorAvatar: users.avatar,
      })
      .from(forumComments)
      .leftJoin(users, eq(forumComments.authorId, users.id))
      .where(eq(forumComments.topicId, topicId))
      .orderBy(forumComments.createdAt);

    return comments.map(comment => ({
      id: comment.id,
      createdAt: comment.createdAt,
      content: comment.content,
      authorId: comment.authorId,
      updatedAt: comment.updatedAt,
      topicId: comment.topicId,
      parentId: comment.parentId,
      votes: comment.votes,
      isAnonymous: comment.isAnonymous,
      author: {
        id: comment.authorId,
        firstName: comment.authorFirstName,
        lastName: comment.authorLastName,
        username: comment.authorUsername,
        email: comment.authorEmail,
        role: comment.authorRole,
        avatar: comment.authorAvatar,
        createdAt: new Date(),
      },
    }));
  }

  async getForumComment(id: number): Promise<ForumComment | undefined> {
    const [comment] = await db.select().from(forumComments).where(eq(forumComments.id, id));
    return comment || undefined;
  }

  async createForumComment(insertComment: InsertForumComment): Promise<ForumComment> {
    const [comment] = await db
      .insert(forumComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async updateForumComment(id: number, updateData: Partial<InsertForumComment>): Promise<ForumComment | undefined> {
    const [comment] = await db
      .update(forumComments)
      .set(updateData)
      .where(eq(forumComments.id, id))
      .returning();
    return comment || undefined;
  }

  async deleteForumComment(id: number): Promise<boolean> {
    const result = await db.delete(forumComments).where(eq(forumComments.id, id));
    return result.rowCount > 0;
  }

  async voteOnComment(userId: number, commentId: number, voteType: number): Promise<void> {
    await db
      .insert(commentVotes)
      .values({ userId, commentId, voteType })
      .onConflictDoUpdate({
        target: [commentVotes.userId, commentVotes.commentId],
        set: { voteType }
      });
  }

  async voteOnTopic(userId: number, topicId: number, voteType: number): Promise<void> {
    await db
      .insert(topicVotes)
      .values({ userId, topicId, voteType })
      .onConflictDoUpdate({
        target: [topicVotes.userId, topicVotes.topicId],
        set: { voteType }
      });
  }

  async markAttendance(userId: number, courseId: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.markAttendanceForDate(userId, courseId, today);
  }

  async markAbsence(userId: number, courseId: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.markAbsenceForDate(userId, courseId, today);
  }

  async markAttendanceForDate(userId: number, courseId: number, date: string): Promise<void> {
    await db
      .insert(attendanceRecords)
      .values({
        userId,
        courseId,
        date: new Date(date),
        isPresent: true,
      })
      .onConflictDoUpdate({
        target: [attendanceRecords.userId, attendanceRecords.courseId, attendanceRecords.date],
        set: { isPresent: true }
      });
  }

  async markAbsenceForDate(userId: number, courseId: number, date: string): Promise<void> {
    await db
      .insert(attendanceRecords)
      .values({
        userId,
        courseId,
        date: new Date(date),
        isPresent: false,
      })
      .onConflictDoUpdate({
        target: [attendanceRecords.userId, attendanceRecords.courseId, attendanceRecords.date],
        set: { isPresent: false }
      });
  }

  async getAttendanceForDate(courseId: number, date: string): Promise<AttendanceRecord[]> {
    return await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.courseId, courseId),
          eq(attendanceRecords.date, new Date(date))
        )
      );
  }

  async getStudentAttendanceRecords(userId: number, courseId: number): Promise<AttendanceRecord[]> {
    return await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.userId, userId),
          eq(attendanceRecords.courseId, courseId)
        )
      )
      .orderBy(desc(attendanceRecords.date));
  }

  async getUserStats(userId: number): Promise<{
    coursesEnrolled: number;
    coursesCompleted: number;
    notesCreated: number;
    forumPosts: number;
  }> {
    const enrollments = await this.getUserEnrollments(userId);
    const userNotes = await this.getNotesByAuthor(userId);
    const userTopics = await db.select().from(forumTopics).where(eq(forumTopics.authorId, userId));
    
    return {
      coursesEnrolled: enrollments.length,
      coursesCompleted: enrollments.filter(e => e.progress === 100).length,
      notesCreated: userNotes.length,
      forumPosts: userTopics.length,
    };
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalNotes: number;
  }> {
    const allUsers = await db.select().from(users);
    const allCourses = await db.select().from(courses);
    const allEnrollments = await db.select().from(courseEnrollments);
    const allNotes = await db.select().from(notes);

    return {
      totalUsers: allUsers.length,
      totalCourses: allCourses.length,
      totalEnrollments: allEnrollments.length,
      totalNotes: allNotes.length,
    };
  }

  async getRecentActivityForProfessor(professorId: number): Promise<any[]> {
    // Buscar cursos do professor
    const professorCourses = await this.getCoursesByAuthor(professorId);
    const courseIds = professorCourses.map(c => c.id);
    
    if (courseIds.length === 0) return [];
    
    // Buscar atividades recentes dos cursos do professor
    const activities = [];
    
    // Matrículas recentes
    const recentEnrollments = await db
      .select({
        id: courseEnrollments.id,
        type: sql<string>`'enrollment'`,
        userId: courseEnrollments.userId,
        courseId: courseEnrollments.courseId,
        createdAt: courseEnrollments.enrolledAt,
        studentName: users.firstName,
        courseName: courses.title,
      })
      .from(courseEnrollments)
      .leftJoin(users, eq(courseEnrollments.userId, users.id))
      .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(inArray(courseEnrollments.courseId, courseIds))
      .orderBy(desc(courseEnrollments.enrolledAt))
      .limit(10);
      
    activities.push(...recentEnrollments);

    // Completações de notas recentes
    const recentCompletions = await db
      .select({
        id: noteCompletions.userId,
        type: sql<string>`'note_completion'`,
        userId: noteCompletions.userId,
        courseId: notes.courseId,
        createdAt: noteCompletions.completedAt,
        studentName: users.firstName,
        courseName: courses.title,
        noteTitle: notes.title,
      })
      .from(noteCompletions)
      .leftJoin(notes, eq(noteCompletions.noteId, notes.id))
      .leftJoin(users, eq(noteCompletions.userId, users.id))
      .leftJoin(courses, eq(notes.courseId, courses.id))
      .where(and(
        inArray(notes.courseId, courseIds),
        sql`${notes.courseId} IS NOT NULL`
      ))
      .orderBy(desc(noteCompletions.completedAt))
      .limit(10);
      
    activities.push(...recentCompletions);

    // Ordenar por data mais recente
    return activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }

  async getPopularDiscussions(): Promise<ForumTopic[]> {
    const topics = await db
      .select()
      .from(forumTopics)
      .orderBy(desc(forumTopics.views))
      .limit(5);
    return topics;
  }
}

export const storage = new DatabaseStorage();
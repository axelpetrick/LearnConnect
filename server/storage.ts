import { users, courses, courseEnrollments, notes, forumTopics, forumComments, commentVotes, type User, type InsertUser, type Course, type InsertCourse, type CourseEnrollment, type Note, type InsertNote, type ForumTopic, type InsertForumTopic, type ForumComment, type InsertForumComment, type CommentVote } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
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
  
  // Notes methods
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  getNotesByAuthor(authorId: number): Promise<Note[]>;
  getNotesByCourse(courseId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Forum methods
  getForumTopics(): Promise<ForumTopic[]>;
  getForumTopic(id: number): Promise<ForumTopic | undefined>;
  getForumTopicsByCourse(courseId: number): Promise<ForumTopic[]>;
  createForumTopic(topic: InsertForumTopic): Promise<ForumTopic>;
  updateForumTopic(id: number, topic: Partial<InsertForumTopic>): Promise<ForumTopic | undefined>;
  incrementTopicViews(id: number): Promise<void>;
  
  getForumComments(topicId: number): Promise<ForumComment[]>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  voteOnComment(userId: number, commentId: number, voteType: number): Promise<void>;
  
  // Analytics methods
  getUserStats(userId: number): Promise<{
    coursesEnrolled: number;
    coursesCompleted: number;
    notesCreated: number;
    forumPosts: number;
  }>;
}

// Implementação com banco de dados PostgreSQL
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

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.isPublished, true));
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
    return (result.rowCount || 0) > 0;
  }

  async enrollInCourse(userId: number, courseId: number): Promise<CourseEnrollment> {
    const [enrollment] = await db
      .insert(courseEnrollments)
      .values({ userId, courseId, progress: 0, enrolledAt: new Date() })
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
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)));
  }

  async setStudentGrade(studentId: number, courseId: number, grade: number): Promise<void> {
    await db
      .update(courseEnrollments)
      .set({ grade })
      .where(and(eq(courseEnrollments.userId, studentId), eq(courseEnrollments.courseId, courseId)));
  }

  async removeStudentFromCourse(studentId: number, courseId: number): Promise<void> {
    await db
      .delete(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, studentId), eq(courseEnrollments.courseId, courseId)));
  }

  async getStudentsByRole(role: string): Promise<User[]> {
    try {
      console.log('Getting students with role:', role);
      const result = await db.select().from(users).where(eq(users.role, role));
      console.log('Query result count:', result.length);
      return result;
    } catch (error) {
      console.error('Error in getStudentsByRole:', error);
      throw new Error(`Failed to fetch users by role: ${error}`);
    }
  }

  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes);
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
    return (result.rowCount || 0) > 0;
  }

  async getForumTopics(): Promise<ForumTopic[]> {
    return await db.select().from(forumTopics);
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
    // Buscar o tópico atual
    const [topic] = await db.select().from(forumTopics).where(eq(forumTopics.id, id));
    if (topic) {
      await db
        .update(forumTopics)
        .set({ views: (topic.views || 0) + 1 })
        .where(eq(forumTopics.id, id));
    }
  }

  async getForumComments(topicId: number): Promise<ForumComment[]> {
    return await db.select().from(forumComments).where(eq(forumComments.topicId, topicId));
  }

  async createForumComment(insertComment: InsertForumComment): Promise<ForumComment> {
    const [comment] = await db
      .insert(forumComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async voteOnComment(userId: number, commentId: number, voteType: number): Promise<void> {
    try {
      await db
        .insert(commentVotes)
        .values({ userId, commentId, voteType });
    } catch {
      await db
        .update(commentVotes)
        .set({ voteType })
        .where(and(eq(commentVotes.userId, userId), eq(commentVotes.commentId, commentId)));
    }
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
}

export const storage = new DatabaseStorage();
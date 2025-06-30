import { 
  users, courses, courseEnrollments, notes, forumTopics, forumComments, commentVotes,
  type User, type InsertUser, type Course, type InsertCourse, 
  type CourseEnrollment, type Note, type InsertNote,
  type ForumTopic, type InsertForumTopic, type ForumComment, type InsertForumComment,
  type CommentVote
} from "@shared/schema";

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
  updateProgress(userId: number, courseId: number, progress: number): Promise<void>;
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private courses: Map<number, Course>;
  private enrollments: Map<number, CourseEnrollment>;
  private notes: Map<number, Note>;
  private forumTopics: Map<number, ForumTopic>;
  private forumComments: Map<number, ForumComment>;
  private commentVotes: Map<number, CommentVote>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.courses = new Map();
    this.enrollments = new Map();
    this.notes = new Map();
    this.forumTopics = new Map();
    this.forumComments = new Map();
    this.commentVotes = new Map();
    this.currentId = 1;

    // Create admin user with correct password hash for "admin123"
    this.createUser({
      username: "admin",
      email: "admin@educollab.com", 
      password: "$2b$10$a/0ftghSgywDAuIdsHV45uWbC213Y5p.9mJVPO7S9OjToFR2T7BLW",
      firstName: "Admin",
      lastName: "User",
      role: "admin"
    });
  }

  private getNextId(): number {
    return this.currentId++;
  }



  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.getNextId();
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      role: insertUser.role || 'student',
      avatar: insertUser.avatar || null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Course methods
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.isPublished);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async getCoursesByAuthor(authorId: number): Promise<Course[]> {
    return Array.from(this.courses.values()).filter(course => course.authorId === authorId);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.getNextId();
    const course: Course = {
      id,
      title: insertCourse.title,
      description: insertCourse.description,
      content: insertCourse.content || null,
      category: insertCourse.category,
      tags: insertCourse.tags || null,
      authorId: insertCourse.authorId,
      isPublished: insertCourse.isPublished || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: number, updateData: Partial<InsertCourse>): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...updateData, updatedAt: new Date() };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Enrollment methods
  async enrollInCourse(userId: number, courseId: number): Promise<CourseEnrollment> {
    const id = this.getNextId();
    const enrollment: CourseEnrollment = {
      id,
      userId,
      courseId,
      progress: 0,
      completedAt: null,
      enrolledAt: new Date(),
    };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async getUserEnrollments(userId: number): Promise<CourseEnrollment[]> {
    return Array.from(this.enrollments.values()).filter(e => e.userId === userId);
  }

  async updateProgress(userId: number, courseId: number, progress: number): Promise<void> {
    const enrollment = Array.from(this.enrollments.values()).find(
      e => e.userId === userId && e.courseId === courseId
    );
    if (enrollment) {
      enrollment.progress = progress;
      if (progress >= 100) {
        enrollment.completedAt = new Date();
      }
      this.enrollments.set(enrollment.id, enrollment);
    }
  }

  // Notes methods
  async getNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.isPublic);
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }

  async getNotesByAuthor(authorId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.authorId === authorId);
  }

  async getNotesByCourse(courseId: number): Promise<Note[]> {
    return Array.from(this.notes.values()).filter(note => note.courseId === courseId);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.getNextId();
    const note: Note = {
      id,
      title: insertNote.title,
      content: insertNote.content,
      tags: insertNote.tags || null,
      authorId: insertNote.authorId,
      courseId: insertNote.courseId || null,
      isPublic: insertNote.isPublic || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notes.set(id, note);
    return note;
  }

  async updateNote(id: number, updateData: Partial<InsertNote>): Promise<Note | undefined> {
    const note = this.notes.get(id);
    if (!note) return undefined;
    
    const updatedNote = { ...note, ...updateData, updatedAt: new Date() };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }

  // Forum methods
  async getForumTopics(): Promise<ForumTopic[]> {
    return Array.from(this.forumTopics.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getForumTopic(id: number): Promise<ForumTopic | undefined> {
    return this.forumTopics.get(id);
  }

  async getForumTopicsByCourse(courseId: number): Promise<ForumTopic[]> {
    return Array.from(this.forumTopics.values()).filter(topic => topic.courseId === courseId);
  }

  async createForumTopic(insertTopic: InsertForumTopic): Promise<ForumTopic> {
    const id = this.getNextId();
    const topic: ForumTopic = {
      id,
      title: insertTopic.title,
      content: insertTopic.content,
      tags: insertTopic.tags || null,
      authorId: insertTopic.authorId,
      courseId: insertTopic.courseId || null,
      isPinned: insertTopic.isPinned || null,
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.forumTopics.set(id, topic);
    return topic;
  }

  async updateForumTopic(id: number, updateData: Partial<InsertForumTopic>): Promise<ForumTopic | undefined> {
    const topic = this.forumTopics.get(id);
    if (!topic) return undefined;
    
    const updatedTopic = { ...topic, ...updateData, updatedAt: new Date() };
    this.forumTopics.set(id, updatedTopic);
    return updatedTopic;
  }

  async incrementTopicViews(id: number): Promise<void> {
    const topic = this.forumTopics.get(id);
    if (topic) {
      topic.views = (topic.views || 0) + 1;
      this.forumTopics.set(id, topic);
    }
  }

  async getForumComments(topicId: number): Promise<ForumComment[]> {
    return Array.from(this.forumComments.values())
      .filter(comment => comment.topicId === topicId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createForumComment(insertComment: InsertForumComment): Promise<ForumComment> {
    const id = this.getNextId();
    const comment: ForumComment = {
      id,
      content: insertComment.content,
      authorId: insertComment.authorId,
      topicId: insertComment.topicId,
      parentId: insertComment.parentId || null,
      votes: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.forumComments.set(id, comment);
    return comment;
  }

  async voteOnComment(userId: number, commentId: number, voteType: number): Promise<void> {
    // Remove existing vote if any
    const existingVote = Array.from(this.commentVotes.values()).find(
      vote => vote.userId === userId && vote.commentId === commentId
    );
    if (existingVote) {
      this.commentVotes.delete(existingVote.id);
      // Update comment vote count
      const comment = this.forumComments.get(commentId);
      if (comment) {
        comment.votes = (comment.votes || 0) - existingVote.voteType;
      }
    }

    // Add new vote
    const voteId = this.getNextId();
    const vote: CommentVote = {
      id: voteId,
      userId,
      commentId,
      voteType,
      createdAt: new Date(),
    };
    this.commentVotes.set(voteId, vote);

    // Update comment vote count
    const comment = this.forumComments.get(commentId);
    if (comment) {
      comment.votes = (comment.votes || 0) + voteType;
      this.forumComments.set(commentId, comment);
    }
  }

  async getUserStats(userId: number): Promise<{
    coursesEnrolled: number;
    coursesCompleted: number;
    notesCreated: number;
    forumPosts: number;
  }> {
    const enrollments = await this.getUserEnrollments(userId);
    const notes = await this.getNotesByAuthor(userId);
    const forumPosts = Array.from(this.forumComments.values()).filter(c => c.authorId === userId);
    
    return {
      coursesEnrolled: enrollments.length,
      coursesCompleted: enrollments.filter(e => e.completedAt).length,
      notesCreated: notes.length,
      forumPosts: forumPosts.length,
    };
  }
}

export const storage = new MemStorage();

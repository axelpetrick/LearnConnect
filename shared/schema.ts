import { pgTable, text, serial, integer, boolean, timestamp, jsonb, numeric, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("student"), // student, tutor, admin
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  category: text("category").notNull(),
  tags: text("tags").array().default([]),
  authorId: integer("author_id").notNull().references(() => users.id),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const courseEnrollments = pgTable("course_enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  courseId: integer("course_id").notNull().references(() => courses.id),
  progress: integer("progress").default(0), // 0-100
  grade: integer("grade"), // nota do aluno (0-100)
  completedAt: timestamp("completed_at"),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().default([]),
  authorId: integer("author_id").notNull().references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  isPublic: boolean("is_public").default(false),
  allowedRoles: text("allowed_roles").array().default(['tutor', 'admin']), // quais perfis podem ver
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const forumTopics = pgTable("forum_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  tags: text("tags").array().default([]),
  isPinned: boolean("is_pinned").default(false),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  topicId: integer("topic_id").notNull().references(() => forumTopics.id),
  parentId: integer("parent_id").references(() => forumComments.id),
  votes: integer("votes").default(0),
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const commentVotes = pgTable("comment_votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  commentId: integer("comment_id").notNull().references(() => forumComments.id),
  voteType: integer("vote_type").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'grade', 'enrollment', 'note', 'forum'
  relatedId: integer("related_id"), // ID do item relacionado (curso, nota, etc)
  relatedType: text("related_type"), // 'course', 'note', 'topic'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const noteCompletions = pgTable("note_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  noteId: integer("note_id").notNull().references(() => notes.id),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertForumTopicSchema = createInsertSchema(forumTopics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
});

export const insertForumCommentSchema = createInsertSchema(forumComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  votes: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type ForumTopic = typeof forumTopics.$inferSelect;
export type InsertForumTopic = z.infer<typeof insertForumTopicSchema>;
export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type CommentVote = typeof commentVotes.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

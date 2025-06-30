import express, { type Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { 
  loginSchema, insertUserSchema, insertCourseSchema, 
  insertNoteSchema, insertForumTopicSchema, insertForumCommentSchema 
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Multer configuration for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Authentication middleware (simplified)
async function authenticateToken(req: any, res: any, next: any) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Authentication error' });
  }
}

// Role-based authorization middleware
function requireRole(roles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  const MemStore = MemoryStore(session);
  app.use(session({
    cookie: { maxAge: 86400000 }, // 24 hours
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false
  }));

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log('Registration request body:', req.body);
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username) || 
                          await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      (req as any).session.userId = user.id;
      
      res.json({ 
        user: { ...user, password: undefined }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Invalid registration data', error: String(error) });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log('Login request body:', req.body);
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      console.log('User found:', user ? 'yes' : 'no');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Password valid:', validPassword);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      (req as any).session.userId = user.id;
      console.log('Session set for user:', user.id);
      
      res.json({ 
        user: { ...user, password: undefined }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Invalid login data', error: String(error) });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // User routes
  app.put("/api/users/profile", authenticateToken, async (req: any, res) => {
    try {
      const updateData = req.body;
      delete updateData.password; // Don't allow password updates through this endpoint
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      res.status(400).json({ message: 'Failed to update profile' });
    }
  });

  app.post("/api/users/avatar", authenticateToken, upload.single('avatar'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      const updatedUser = await storage.updateUser(req.user.id, { avatar: avatarUrl });
      
      res.json({ avatar: avatarUrl });
    } catch (error) {
      res.status(400).json({ message: 'Failed to upload avatar' });
    }
  });

  app.get("/api/users/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getUserStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user stats' });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get courses' });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get course' });
    }
  });

  app.post("/api/courses", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        authorId: req.user.id,
      });
      
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      res.status(400).json({ message: 'Invalid course data' });
    }
  });

  app.put("/api/courses/:id", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      if (course.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to edit this course' });
      }

      const updatedCourse = await storage.updateCourse(id, req.body);
      res.json(updatedCourse);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update course' });
    }
  });

  app.delete("/api/courses/:id", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      if (course.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this course' });
      }

      await storage.deleteCourse(id);
      res.json({ message: 'Course deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete course' });
    }
  });

  app.post("/api/courses/:id/enroll", authenticateToken, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const enrollment = await storage.enrollInCourse(req.user.id, courseId);
      res.json(enrollment);
    } catch (error) {
      res.status(400).json({ message: 'Failed to enroll in course' });
    }
  });

  app.get("/api/courses/my/enrollments", authenticateToken, async (req: any, res) => {
    try {
      const enrollments = await storage.getUserEnrollments(req.user.id);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get enrollments' });
    }
  });

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get notes' });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get note' });
    }
  });

  app.post("/api/notes", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const noteData = insertNoteSchema.parse({
        ...req.body,
        authorId: req.user.id,
      });
      
      const note = await storage.createNote(noteData);
      res.json(note);
    } catch (error) {
      res.status(400).json({ message: 'Invalid note data' });
    }
  });

  app.put("/api/notes/:id", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      if (note.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to edit this note' });
      }

      const updatedNote = await storage.updateNote(id, req.body);
      res.json(updatedNote);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update note' });
    }
  });

  // Forum routes
  app.get("/api/forum/topics", async (req, res) => {
    try {
      const topics = await storage.getForumTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get forum topics' });
    }
  });

  app.get("/api/forum/topics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getForumTopic(id);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
      
      await storage.incrementTopicViews(id);
      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get topic' });
    }
  });

  app.post("/api/forum/topics", authenticateToken, async (req: any, res) => {
    try {
      const topicData = insertForumTopicSchema.parse({
        ...req.body,
        authorId: req.user.id,
      });
      
      const topic = await storage.createForumTopic(topicData);
      res.json(topic);
    } catch (error) {
      res.status(400).json({ message: 'Invalid topic data' });
    }
  });

  app.get("/api/forum/topics/:id/comments", async (req, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const comments = await storage.getForumComments(topicId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get comments' });
    }
  });

  app.post("/api/forum/comments", authenticateToken, async (req: any, res) => {
    try {
      const commentData = insertForumCommentSchema.parse({
        ...req.body,
        authorId: req.user.id,
      });
      
      const comment = await storage.createForumComment(commentData);
      res.json(comment);
    } catch (error) {
      res.status(400).json({ message: 'Invalid comment data' });
    }
  });

  app.post("/api/forum/comments/:id/vote", authenticateToken, async (req: any, res) => {
    try {
      const commentId = parseInt(req.params.id);
      const { voteType } = req.body; // 1 for upvote, -1 for downvote
      
      await storage.voteOnComment(req.user.id, commentId, voteType);
      res.json({ message: 'Vote recorded' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to vote on comment' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}

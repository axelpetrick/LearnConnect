import express, { type Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
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

  // Recuperação de senha
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      console.log('🔍 Password reset requested for email:', email);
      
      // Verificar se o usuário existe
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado com este email' });
      }
      
      // Gerar nova senha aleatória
      const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      console.log('Generated new password for user:', user.username);
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Atualizar senha no banco
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Verificar se SendGrid está configurado
      if (!process.env.SENDGRID_API_KEY) {
        console.log('⚠️ SendGrid not configured, returning password in response (dev mode)');
        return res.json({ 
          message: 'Nova senha gerada (modo desenvolvimento)', 
          newPassword: newPassword,
          note: 'Em produção, esta senha seria enviada por email'
        });
      }
      
      // Enviar email com SendGrid
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        const msg = {
          to: email,
          from: 'noreply@educollab.com', // Substitua pelo seu email verificado no SendGrid
          subject: 'Nova senha - EduCollab',
          text: `Olá ${user.firstName},\n\nSua nova senha é: ${newPassword}\n\nPor favor, faça login e altere sua senha.\n\nEquipe EduCollab`,
          html: `
            <h2>Nova senha - EduCollab</h2>
            <p>Olá <strong>${user.firstName}</strong>,</p>
            <p>Sua nova senha é: <strong>${newPassword}</strong></p>
            <p>Por favor, faça login e altere sua senha.</p>
            <p>Equipe EduCollab</p>
          `,
        };
        
        await sgMail.send(msg);
        console.log('✅ Password reset email sent successfully to:', email);
        
        res.json({ message: 'Nova senha enviada por email' });
      } catch (emailError) {
        console.error('❌ Failed to send email:', emailError);
        
        // Se falhar no envio, retornar a senha (modo fallback)
        res.json({ 
          message: 'Falha no envio do email, nova senha gerada', 
          newPassword: newPassword,
          note: 'Use esta senha para fazer login'
        });
      }
      
    } catch (error) {
      console.error('❌ Error in password reset:', error);
      res.status(500).json({ message: 'Erro ao processar recuperação de senha' });
    }
  });

  // Alterar senha própria
  app.put("/api/users/change-password", authenticateToken, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      console.log('🔐 Password change request for user:', userId);
      
      // Buscar usuário atual
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar senha atual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }
      
      // Validar nova senha
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
      }
      
      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Atualizar senha
      await storage.updateUser(userId, { password: hashedPassword });
      
      console.log('✅ Password changed successfully for user:', userId);
      res.json({ message: 'Senha alterada com sucesso' });
      
    } catch (error) {
      console.error('❌ Error changing password:', error);
      res.status(500).json({ message: 'Erro ao alterar senha' });
    }
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

  // Estatísticas administrativas (apenas para admins)
  app.get("/api/admin/stats", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const adminStats = await storage.getAdminStats();
      res.json(adminStats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get admin stats' });
    }
  });

  // Atividade recente para professores/tutores
  app.get("/api/users/recent-activity", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const recentActivity = await storage.getRecentActivityForProfessor(req.user.id);
      res.json(recentActivity);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get recent activity' });
    }
  });

  // Get courses for filter (professors see only their courses, admins see all)
  app.get('/api/courses/filter', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      let courses;
      if (userRole === 'admin') {
        courses = await storage.getCourses();
      } else {
        courses = await storage.getCoursesByAuthor(userId);
      }
      
      res.json(courses);
    } catch (error) {
      console.error('Error getting courses for filter:', error);
      res.status(500).json({ message: 'Failed to get courses' });
    }
  });

  // Buscar matrículas do usuário atual
  app.get("/api/users/enrollments", authenticateToken, async (req: any, res) => {
    try {
      const enrollments = await storage.getUserEnrollments(req.user.id);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user enrollments' });
    }
  });

  // Listar estudantes (para professores matricularem) - DEVE VIR ANTES DA ROTA :id
  app.get("/api/users/students", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    console.log('🔍 API /api/users/students called - user:', req.user?.username, 'role:', req.user?.role);
    
    try {
      // Buscar todos os estudantes do banco de dados
      const students = await storage.getStudentsByRole('student');
      
      // Remover campo de senha por segurança
      const safeStudents = students.map(student => ({
        id: student.id,
        username: student.username,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        role: student.role
      }));
      
      console.log(`✅ Returning ${safeStudents.length} students`);
      res.json(safeStudents);
      
    } catch (error) {
      console.error('❌ Error in students API:', error);
      res.status(500).json({ message: 'Students API Error', error: String(error) });
    }
  });

  // Buscar tutores/professores (para admin definir responsável pelo curso)
  app.get("/api/users/tutors", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const tutors = await storage.getStudentsByRole('tutor');
      const admins = await storage.getStudentsByRole('admin');
      const allTutors = [...tutors, ...admins];
      res.json(allTutors);
    } catch (error) {
      console.error('Error getting tutors:', error);
      res.status(500).json({ message: 'Failed to get tutors' });
    }
  });

  // Buscar usuário por ID - DEVE VIR DEPOIS DA ROTA /students
  // Listar todos os usuários (apenas para admins)
  app.get("/api/users", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      console.log('🔍 API /api/users called by admin:', req.user?.username);
      
      // Buscar todos os usuários
      const allUsers = await storage.getAllUsers();
      
      // Remover senhas por segurança
      const safeUsers = allUsers.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      console.log(`✅ Returning ${safeUsers.length} users`);
      res.json(safeUsers);
    } catch (error) {
      console.error('❌ Error fetching all users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Criar usuário (apenas para admins)
  app.post("/api/users", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const { username, email, password, firstName, lastName, role } = req.body;
      
      console.log('🔍 Creating user:', { username, email, firstName, lastName, role });
      
      // Verificar se username ou email já existem
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username já está em uso' });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
      
      // Hash da senha
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        avatar: null
      });
      
      // Remover senha da resposta
      const { password: _, ...safeUser } = newUser;
      
      console.log('✅ User created successfully:', safeUser.id);
      res.status(201).json(safeUser);
    } catch (error) {
      console.error('❌ Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user' });
    }
  });

  // Atualizar usuário (apenas para admins)
  app.put("/api/users/:id", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { username, email, firstName, lastName, role } = req.body;
      
      console.log('🔍 Updating user:', userId, { username, email, firstName, lastName, role });
      
      // Verificar se o usuário existe
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verificar se username ou email já existem em outros usuários
      if (username !== existingUser.username) {
        const userWithUsername = await storage.getUserByUsername(username);
        if (userWithUsername && userWithUsername.id !== userId) {
          return res.status(400).json({ message: 'Username já está em uso por outro usuário' });
        }
      }
      
      if (email !== existingUser.email) {
        const userWithEmail = await storage.getUserByEmail(email);
        if (userWithEmail && userWithEmail.id !== userId) {
          return res.status(400).json({ message: 'Email já está em uso por outro usuário' });
        }
      }
      
      const updatedUser = await storage.updateUser(userId, {
        username,
        email,
        firstName,
        lastName,
        role
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Remover senha da resposta
      const { password: _, ...safeUser } = updatedUser;
      
      console.log('✅ User updated successfully:', safeUser.id);
      res.json(safeUser);
    } catch (error) {
      console.error('❌ Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Deletar usuário (apenas para admins)
  app.delete("/api/users/:id", authenticateToken, requireRole(['admin']), async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      console.log('🔍 Deleting user:', userId);
      
      // Verificar se o usuário existe
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Impedir que admin delete a si mesmo
      if (userId === req.user.id) {
        return res.status(400).json({ message: 'Você não pode deletar sua própria conta' });
      }
      
      const success = await storage.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      console.log('✅ User deleted successfully:', userId);
      res.json({ message: 'Usuário removido com sucesso' });
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      res.status(500).json({ message: 'Failed to delete user' });
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
      
      // Permitir edição apenas para o autor do curso, tutores ou admins
      if (course.authorId !== req.user.id && !['tutor', 'admin'].includes(req.user.role)) {
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

  // Matrícula de estudante (self-enrollment)
  app.post("/api/courses/:id/enroll", authenticateToken, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const enrollment = await storage.enrollInCourse(req.user.id, courseId);
      res.json(enrollment);
    } catch (error) {
      res.status(400).json({ message: 'Failed to enroll in course' });
    }
  });

  // Matricular estudante específico (para professores/admin)
  app.post("/api/courses/:id/enroll-student", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const { studentId } = req.body;
      
      console.log(`Enrolling student ${studentId} in course ${courseId}`);
      
      // Verificar se o estudante já está matriculado no curso
      const existingEnrollments = await storage.getCourseEnrollments(courseId);
      const isAlreadyEnrolled = existingEnrollments.some(enrollment => enrollment.userId === parseInt(studentId));
      
      if (isAlreadyEnrolled) {
        console.log(`❌ Student ${studentId} is already enrolled in course ${courseId}`);
        return res.status(400).json({ 
          message: 'Este estudante já está matriculado neste curso',
          error: 'ALREADY_ENROLLED'
        });
      }
      
      const enrollment = await storage.enrollInCourse(parseInt(studentId), courseId);
      console.log(`✅ Student ${studentId} successfully enrolled in course ${courseId}`);
      res.json(enrollment);
    } catch (error) {
      console.error('Error enrolling student:', error);
      res.status(400).json({ message: 'Failed to enroll student' });
    }
  });

  // Ver estudantes matriculados
  app.get("/api/courses/:id/students", authenticateToken, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const enrollments = await storage.getCourseEnrollments(courseId);
      
      // Se for estudante, verificar se está matriculado no curso
      if (req.user.role === 'student') {
        const userEnrollments = await storage.getUserEnrollments(req.user.id);
        const isEnrolled = userEnrollments.some(e => e.courseId === courseId);
        
        if (!isEnrolled) {
          return res.status(403).json({ message: 'You must be enrolled to see classmates' });
        }
        
        // Para estudantes, retornar apenas dados básicos dos colegas
        const basicEnrollments = enrollments.map(e => ({
          id: e.id,
          userId: e.userId,
          courseId: e.courseId,
          progress: e.progress,
          enrolledAt: e.enrolledAt,
          // Omitir informações sensíveis como notas para outros estudantes
          grade: e.userId === req.user.id ? e.grade : null
        }));
        
        return res.json(basicEnrollments);
      }
      
      // Para tutores/admins, retornar dados completos
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get course students' });
    }
  });

  // Atribuir nota a estudante
  app.put("/api/courses/:courseId/students/:studentId/grade", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      const { grade } = req.body;
      
      await storage.setStudentGrade(studentId, courseId, grade);
      res.json({ message: 'Grade assigned successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to assign grade' });
    }
  });

  // Marcar presença de um estudante
  app.post("/api/courses/:courseId/students/:studentId/attendance", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      
      await storage.markAttendance(studentId, courseId);
      res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to mark attendance' });
    }
  });

  // Marcar falta de um estudante
  app.post("/api/courses/:courseId/students/:studentId/absence", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      
      await storage.markAbsence(studentId, courseId);
      res.json({ message: 'Absence marked successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to mark absence' });
    }
  });

  // Marcar presença para uma data específica
  app.post("/api/courses/:courseId/students/:studentId/attendance-date", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      const { date } = req.body;
      
      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }

      await storage.markAttendanceForDate(studentId, courseId, new Date(date));
      res.json({ message: 'Attendance marked for date successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to mark attendance for date' });
    }
  });

  // Marcar falta para uma data específica
  app.post("/api/courses/:courseId/students/:studentId/absence-date", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      const { date } = req.body;
      
      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }

      await storage.markAbsenceForDate(studentId, courseId, new Date(date));
      res.json({ message: 'Absence marked for date successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message || 'Failed to mark absence for date' });
    }
  });

  // Verificar presença/falta para uma data específica
  app.get("/api/courses/:courseId/students/:studentId/attendance-date", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }

      const record = await storage.getAttendanceForDate(studentId, courseId, new Date(date as string));
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: 'Failed to get attendance for date' });
    }
  });

  // Obter todos os registros de presença de um estudante
  app.get("/api/courses/:courseId/students/:studentId/attendance-records", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      
      const records = await storage.getStudentAttendanceRecords(studentId, courseId);
      res.json(records);
    } catch (error) {
      res.status(400).json({ message: 'Failed to get attendance records' });
    }
  });

  // Remover estudante do curso
  app.delete("/api/courses/:courseId/students/:studentId", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const studentId = parseInt(req.params.studentId);
      
      await storage.removeStudentFromCourse(studentId, courseId);
      res.json({ message: 'Student removed from course successfully' });
    } catch (error) {
      console.error('Error removing student from course:', error);
      res.status(400).json({ message: 'Failed to remove student from course' });
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

  // Get notes by course
  app.get("/api/notes/course/:courseId", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const notes = await storage.getNotesByCourse(courseId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get course notes' });
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

  app.delete("/api/notes/:id", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      if (note.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this note' });
      }

      const success = await storage.deleteNote(id);
      if (!success) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete note' });
    }
  });

  // Marcar anotação como concluída pelo estudante
  app.post("/api/notes/:noteId/complete", authenticateToken, async (req: any, res) => {
    try {
      const noteId = parseInt(req.params.noteId);
      const userId = req.user.id;
      
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      // Verificar se o estudante está matriculado no curso da anotação
      if (note.courseId) {
        const enrollments = await storage.getUserEnrollments(userId);
        const isEnrolled = enrollments.some(enrollment => enrollment.courseId === note.courseId);
        
        if (!isEnrolled) {
          return res.status(403).json({ message: 'You must be enrolled in the course to complete notes' });
        }
      }
      
      await storage.markNoteAsCompleted(userId, noteId);
      
      // Calcular e atualizar progresso se a nota pertence a um curso
      if (note.courseId) {
        const courseNotes = await storage.getNotesByCourse(note.courseId);
        const completedNotes = await storage.getCompletedNotes(userId, note.courseId);
        const progress = Math.round((completedNotes.length / courseNotes.length) * 100);
        
        await storage.updateProgress(userId, note.courseId, progress);
      }
      
      res.json({ message: 'Note marked as completed' });
    } catch (error) {
      console.error('Error completing note:', error);
      res.status(400).json({ message: 'Failed to complete note' });
    }
  });

  // Desmarcar anotação como concluída
  app.delete("/api/notes/:noteId/complete", authenticateToken, async (req: any, res) => {
    try {
      const noteId = parseInt(req.params.noteId);
      const userId = req.user.id;
      
      const note = await storage.getNote(noteId);
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
      
      await storage.unmarkNoteAsCompleted(userId, noteId);
      
      // Recalcular progresso se a nota pertence a um curso
      if (note.courseId) {
        const courseNotes = await storage.getNotesByCourse(note.courseId);
        const completedNotes = await storage.getCompletedNotes(userId, note.courseId);
        const progress = Math.round((completedNotes.length / courseNotes.length) * 100);
        
        await storage.updateProgress(userId, note.courseId, progress);
      }
      
      res.json({ message: 'Note unmarked as completed' });
    } catch (error) {
      console.error('Error uncompleting note:', error);
      res.status(400).json({ message: 'Failed to uncomplete note' });
    }
  });

  // Obter anotações concluídas do estudante
  app.get("/api/notes/completed/:courseId", authenticateToken, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const userId = req.user.id;
      
      const completedNotes = await storage.getCompletedNotes(userId, courseId);
      res.json(completedNotes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get completed notes' });
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

  // Rota para discussões populares (3 mais comentadas)
  app.get("/api/forum/popular-discussions", async (_req, res) => {
    try {
      const popularDiscussions = await storage.getPopularDiscussions();
      res.json(popularDiscussions);
    } catch (error) {
      console.error('Failed to get popular discussions:', error);
      res.status(500).json({ message: "Failed to get popular discussions" });
    }
  });

  app.get("/api/forum/topics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getForumTopic(id);
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
      
      // Buscar dados do autor
      const author = await storage.getUser(topic.authorId);
      
      await storage.incrementTopicViews(id);
      res.json({
        ...topic,
        author: author ? {
          id: author.id,
          username: author.username,
          firstName: author.firstName,
          lastName: author.lastName
        } : null
      });
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

  app.get("/api/forum/topics/:id/comments", authenticateToken, async (req: any, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const comments = await storage.getForumComments(topicId);
      
      // Os dados do autor já vêm do storage via JOIN
      // Agora só precisamos ajustar a exibição para admins em comentários anônimos
      const isAdmin = req.user && req.user.role === 'admin';
      
      const processedComments = comments.map(comment => {
        if (comment.author) {
          const displayName = comment.isAnonymous 
            ? (isAdmin ? `Anônimo (${comment.author.firstName || comment.author.username})` : 'Anônimo')
            : (comment.author.firstName || comment.author.username);
          return {
            ...comment,
            author: {
              ...comment.author,
              username: displayName
            }
          };
        }
        return comment;
      });
      
      // Adicionar cabeçalho para invalidar cache baseado no papel do usuário
      res.setHeader('Cache-Control', `no-cache, max-age=0, must-revalidate, private, user-role-${req.user?.role || 'guest'}`);
      res.json(processedComments);
    } catch (error) {
      console.error('Error getting comments:', error);
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

  app.post("/api/forum/topics/:id/vote", authenticateToken, async (req: any, res) => {
    try {
      const topicId = parseInt(req.params.id);
      const { voteType } = req.body; // 1 for like, -1 for dislike
      
      await storage.voteOnTopic(req.user.id, topicId, voteType);
      res.json({ message: 'Vote recorded' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to vote on topic' });
    }
  });

  // Editar tópico do fórum - apenas autor ou admin
  app.put("/api/forum/topics/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getForumTopic(id);
      
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
      
      // Apenas autor ou admin pode editar
      if (topic.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to edit this topic' });
      }

      const updatedTopic = await storage.updateForumTopic(id, req.body);
      res.json(updatedTopic);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update topic' });
    }
  });

  // Excluir tópico do fórum - apenas autor ou admin
  app.delete("/api/forum/topics/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const topic = await storage.getForumTopic(id);
      
      if (!topic) {
        return res.status(404).json({ message: 'Topic not found' });
      }
      
      // Apenas autor ou admin pode excluir
      if (topic.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this topic' });
      }

      await storage.deleteForumTopic(id);
      res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete topic' });
    }
  });

  // Editar comentário do fórum - apenas autor ou admin
  app.put("/api/forum/comments/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.getForumComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      // Apenas autor ou admin pode editar
      if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to edit this comment' });
      }

      const updatedComment = await storage.updateForumComment(id, req.body);
      res.json(updatedComment);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update comment' });
    }
  });

  // Excluir comentário do fórum - apenas autor ou admin
  app.delete("/api/forum/comments/:id", authenticateToken, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const comment = await storage.getForumComment(id);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      // Apenas autor ou admin pode excluir
      if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this comment' });
      }

      await storage.deleteForumComment(id);
      res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Failed to delete comment' });
    }
  });



  // Dados de performance dos estudantes
  app.get("/api/students/performance-data", authenticateToken, requireRole(['tutor', 'admin']), async (req: any, res) => {
    try {
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : null;
      const students = await storage.getStudentsByRole('student');
      const performanceData = [];

      for (const student of students) {
        let enrollments = await storage.getUserEnrollments(student.id);
        
        // Filtrar por curso específico se solicitado
        if (courseId) {
          enrollments = enrollments.filter(enrollment => enrollment.courseId === courseId);
        }
        
        // Se for professor, filtrar apenas cursos que ele ensina
        if (req.user.role === 'tutor') {
          const professorCourses = await storage.getCoursesByAuthor(req.user.id);
          const professorCourseIds = professorCourses.map(course => course.id);
          enrollments = enrollments.filter(enrollment => professorCourseIds.includes(enrollment.courseId));
        }
        
        if (enrollments.length > 0) {
          // Calcular progresso médio e nota média
          let totalProgress = 0;
          let totalGrade = 0;
          let coursesWithGrades = 0;
          
          for (const enrollment of enrollments) {
            totalProgress += enrollment.progress || 0;
            if (enrollment.grade !== null) {
              totalGrade += enrollment.grade;
              coursesWithGrades++;
            }
          }
          
          const averageProgress = totalProgress / enrollments.length;
          const averageGrade = coursesWithGrades > 0 ? totalGrade / coursesWithGrades : 0;
          
          // Determinar status baseado na nota média
          let status: 'Cursando' | 'Aprovado' | 'Reprovado' = 'Cursando';
          if (coursesWithGrades > 0) {
            status = averageGrade >= 7 ? 'Aprovado' : 'Reprovado';
          }

          performanceData.push({
            studentName: student.firstName || student.username,
            grade: Math.round(averageGrade * 10) / 10,
            progress: Math.round(averageProgress),
            status
          });
        }
      }

      res.json(performanceData);
    } catch (error) {
      console.error('Failed to get student performance data:', error);
      res.status(500).json({ message: 'Failed to get student performance data' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}

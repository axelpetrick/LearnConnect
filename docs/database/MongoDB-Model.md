# Modelo de Documento MongoDB (Alternativo)

## Visão Geral

Embora o EduCollab utilize PostgreSQL como banco principal, este documento apresenta como seria a modelagem caso fosse utilizado MongoDB. A estrutura de documentos oferece uma abordagem diferente para organizar os dados educacionais.

## Estrutura de Documentos

### 1. Collection: users

```javascript
{
  _id: ObjectId("..."),
  username: "admin",
  email: "admin@educollab.com",
  password: "$2b$10$hashed_password",
  profile: {
    firstName: "João",
    lastName: "Silva",
    avatar: "https://example.com/avatar.jpg",
    bio: "Administrador da plataforma"
  },
  role: "admin", // "student", "tutor", "admin"
  preferences: {
    theme: "light",
    language: "pt-BR",
    notifications: {
      email: true,
      push: false,
      forum: true
    }
  },
  stats: {
    coursesCreated: 5,
    coursesEnrolled: 12,
    notesCreated: 25,
    forumPosts: 18,
    totalProgress: 85
  },
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T12:00:00Z"),
  lastLoginAt: ISODate("2025-01-01T10:30:00Z")
}
```

### 2. Collection: courses

```javascript
{
  _id: ObjectId("..."),
  title: "Medicina de Software",
  description: "Curso avançado sobre desenvolvimento de software na área médica",
  slug: "medicina-de-software",
  author: {
    id: ObjectId("..."),
    name: "Dr. Fabrício",
    avatar: "https://example.com/fabricio.jpg"
  },
  category: "Tecnologia",
  tags: ["javascript", "react", "medicina", "software"],
  difficulty: "advanced", // "beginner", "intermediate", "advanced"
  duration: {
    estimatedHours: 40,
    weeks: 8
  },
  content: {
    syllabus: "Conteúdo programático detalhado...",
    objectives: [
      "Desenvolver sistemas médicos",
      "Implementar segurança em saúde",
      "Integrar com APIs hospitalares"
    ],
    prerequisites: ["JavaScript básico", "Conceitos de banco de dados"]
  },
  settings: {
    isPublished: true,
    allowEnrollment: true,
    requireApproval: false,
    maxStudents: 50
  },
  statistics: {
    studentsEnrolled: 25,
    studentsCompleted: 8,
    averageGrade: 8.5,
    averageProgress: 65.2,
    totalViews: 1250
  },
  ratings: {
    average: 4.7,
    count: 15,
    distribution: {
      "5": 10,
      "4": 3,
      "3": 2,
      "2": 0,
      "1": 0
    }
  },
  enrollments: [
    {
      studentId: ObjectId("..."),
      enrolledAt: ISODate("2025-01-01T00:00:00Z"),
      progress: 75,
      grade: 8.5,
      status: "active", // "active", "completed", "dropped"
      completedAt: null,
      attendance: {
        present: 12,
        absent: 2,
        percentage: 85.7
      }
    }
  ],
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T12:00:00Z")
}
```

### 3. Collection: notes

```javascript
{
  _id: ObjectId("..."),
  title: "Introdução ao Sistema de Saúde Digital",
  content: "# Sistemas de Saúde Digital\n\nConteúdo da nota em Markdown...",
  author: {
    id: ObjectId("..."),
    name: "Dr. Fabrício",
    role: "tutor"
  },
  course: {
    id: ObjectId("..."),
    title: "Medicina de Software"
  },
  metadata: {
    tags: ["saúde", "digital", "sistemas"],
    category: "material-de-apoio",
    isPublic: true,
    isPinned: false,
    difficulty: "beginner"
  },
  attachments: [
    {
      filename: "diagrama-sistema.pdf",
      url: "https://storage.example.com/files/diagrama.pdf",
      type: "application/pdf",
      size: 2048576
    }
  ],
  interactions: {
    views: 156,
    likes: 24,
    downloads: 18,
    shares: 5
  },
  completions: [
    {
      studentId: ObjectId("..."),
      completedAt: ISODate("2025-01-01T10:30:00Z"),
      timeSpent: 1800 // segundos
    }
  ],
  versions: [
    {
      version: "1.0",
      content: "Conteúdo original...",
      createdAt: ISODate("2025-01-01T00:00:00Z"),
      changelog: "Versão inicial"
    }
  ],
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T12:00:00Z")
}
```

### 4. Collection: forum_topics

```javascript
{
  _id: ObjectId("..."),
  title: "Dúvidas sobre integração com API do SUS",
  content: "Gostaria de saber como integrar com as APIs do DataSUS...",
  author: {
    id: ObjectId("..."),
    name: "Ana Silva",
    role: "student",
    avatar: "https://example.com/ana.jpg"
  },
  course: {
    id: ObjectId("..."),
    title: "Medicina de Software"
  },
  metadata: {
    category: "duvida",
    tags: ["api", "sus", "integracao"],
    isPinned: false,
    isClosed: false,
    isAnonymous: false
  },
  statistics: {
    views: 45,
    likes: 8,
    replies: 12,
    participants: 6
  },
  lastActivity: {
    type: "comment",
    userId: ObjectId("..."),
    userName: "Dr. Fabrício",
    timestamp: ISODate("2025-01-01T15:30:00Z")
  },
  votes: {
    upvotes: 8,
    downvotes: 0,
    voters: [
      {
        userId: ObjectId("..."),
        type: "upvote",
        timestamp: ISODate("2025-01-01T12:00:00Z")
      }
    ]
  },
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T15:30:00Z")
}
```

### 5. Collection: forum_comments

```javascript
{
  _id: ObjectId("..."),
  topicId: ObjectId("..."),
  content: "Para integrar com as APIs do DataSUS, você precisa...",
  author: {
    id: ObjectId("..."),
    name: "Dr. Fabrício",
    role: "tutor",
    avatar: "https://example.com/fabricio.jpg"
  },
  metadata: {
    isAnonymous: false,
    isEdited: true,
    editedAt: ISODate("2025-01-01T12:15:00Z"),
    isAnswer: true // marcado como resposta pelo autor do tópico
  },
  thread: {
    parentId: null, // null para comentário principal
    level: 0, // 0 para principal, 1+ para replies
    repliesCount: 3
  },
  attachments: [
    {
      type: "code",
      language: "javascript",
      content: "const api = new DataSUSApi();..."
    }
  ],
  votes: {
    upvotes: 15,
    downvotes: 1,
    score: 14,
    voters: [
      {
        userId: ObjectId("..."),
        type: "upvote",
        timestamp: ISODate("2025-01-01T12:30:00Z")
      }
    ]
  },
  reactions: {
    "👍": ["userId1", "userId2"],
    "❤️": ["userId3"],
    "💡": ["userId4", "userId5"]
  },
  createdAt: ISODate("2025-01-01T12:00:00Z"),
  updatedAt: ISODate("2025-01-01T12:15:00Z")
}
```

### 6. Collection: attendance_records

```javascript
{
  _id: ObjectId("..."),
  student: {
    id: ObjectId("..."),
    name: "Ana Silva"
  },
  course: {
    id: ObjectId("..."),
    title: "Medicina de Software"
  },
  records: [
    {
      date: ISODate("2025-01-01T00:00:00Z"),
      status: "present", // "present", "absent", "late", "excused"
      timestamp: ISODate("2025-01-01T08:00:00Z"),
      notes: "Participou ativamente da discussão",
      method: "manual" // "manual", "automatic", "qr-code"
    },
    {
      date: ISODate("2025-01-02T00:00:00Z"),
      status: "absent",
      reason: "Motivo de saúde",
      excused: true
    }
  ],
  summary: {
    totalClasses: 20,
    present: 18,
    absent: 2,
    late: 0,
    excused: 1,
    attendanceRate: 90.0
  },
  semester: "2025.1",
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-02T08:00:00Z")
}
```

### 7. Collection: analytics

```javascript
{
  _id: ObjectId("..."),
  type: "daily_summary",
  date: ISODate("2025-01-01T00:00:00Z"),
  platform: {
    totalUsers: 1250,
    activeUsers: 325,
    newRegistrations: 15,
    totalCourses: 45,
    activeCourses: 38
  },
  engagement: {
    averageSessionTime: 1800, // segundos
    totalPageViews: 8500,
    totalForumPosts: 125,
    totalNotesCreated: 45,
    totalNotesCompleted: 180
  },
  courses: [
    {
      courseId: ObjectId("..."),
      title: "Medicina de Software",
      metrics: {
        studentsActive: 20,
        notesCompleted: 35,
        forumActivity: 12,
        averageProgress: 75.5
      }
    }
  ],
  performance: {
    averageLoadTime: 250, // ms
    errorRate: 0.02,
    uptime: 99.9
  },
  generatedAt: ISODate("2025-01-02T00:00:00Z")
}
```

## Índices MongoDB

```javascript
// Collection: users
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "createdAt": -1 });

// Collection: courses
db.courses.createIndex({ "author.id": 1 });
db.courses.createIndex({ "category": 1 });
db.courses.createIndex({ "tags": 1 });
db.courses.createIndex({ "settings.isPublished": 1 });
db.courses.createIndex({ "enrollments.studentId": 1 });
db.courses.createIndex({ "createdAt": -1 });

// Collection: notes
db.notes.createIndex({ "author.id": 1 });
db.notes.createIndex({ "course.id": 1 });
db.notes.createIndex({ "metadata.tags": 1 });
db.notes.createIndex({ "metadata.isPublic": 1 });
db.notes.createIndex({ "createdAt": -1 });

// Collection: forum_topics
db.forum_topics.createIndex({ "course.id": 1 });
db.forum_topics.createIndex({ "author.id": 1 });
db.forum_topics.createIndex({ "metadata.category": 1 });
db.forum_topics.createIndex({ "metadata.isPinned": 1, "createdAt": -1 });
db.forum_topics.createIndex({ "lastActivity.timestamp": -1 });

// Collection: forum_comments
db.forum_comments.createIndex({ "topicId": 1 });
db.forum_comments.createIndex({ "author.id": 1 });
db.forum_comments.createIndex({ "thread.parentId": 1 });
db.forum_comments.createIndex({ "createdAt": -1 });

// Collection: attendance_records
db.attendance_records.createIndex({ "student.id": 1, "course.id": 1 });
db.attendance_records.createIndex({ "course.id": 1 });
db.attendance_records.createIndex({ "records.date": -1 });

// Collection: analytics
db.analytics.createIndex({ "type": 1, "date": -1 });
db.analytics.createIndex({ "date": -1 });
```

## Aggregation Pipelines Úteis

### 1. Estatísticas de Curso

```javascript
db.courses.aggregate([
  {
    $match: { "settings.isPublished": true }
  },
  {
    $project: {
      title: 1,
      category: 1,
      enrollmentCount: { $size: "$enrollments" },
      averageProgress: { $avg: "$enrollments.progress" },
      completionRate: {
        $multiply: [
          {
            $divide: [
              { $size: { $filter: { input: "$enrollments", cond: { $eq: ["$$this.status", "completed"] } } } },
              { $size: "$enrollments" }
            ]
          },
          100
        ]
      }
    }
  },
  {
    $sort: { enrollmentCount: -1 }
  }
]);
```

### 2. Atividade do Fórum por Período

```javascript
db.forum_topics.aggregate([
  {
    $match: {
      createdAt: {
        $gte: ISODate("2025-01-01T00:00:00Z"),
        $lt: ISODate("2025-02-01T00:00:00Z")
      }
    }
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" }
      },
      topicsCount: { $sum: 1 },
      totalViews: { $sum: "$statistics.views" },
      totalReplies: { $sum: "$statistics.replies" }
    }
  },
  {
    $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
  }
]);
```

### 3. Progresso de Estudantes

```javascript
db.courses.aggregate([
  { $unwind: "$enrollments" },
  {
    $lookup: {
      from: "users",
      localField: "enrollments.studentId",
      foreignField: "_id",
      as: "student"
    }
  },
  { $unwind: "$student" },
  {
    $project: {
      courseTitle: "$title",
      studentName: { $concat: ["$student.profile.firstName", " ", "$student.profile.lastName"] },
      progress: "$enrollments.progress",
      grade: "$enrollments.grade",
      status: "$enrollments.status",
      enrolledAt: "$enrollments.enrolledAt"
    }
  },
  {
    $sort: { progress: -1 }
  }
]);
```

## Vantagens do Modelo MongoDB

1. **Flexibilidade de Schema**: Permite evolução natural dos documentos
2. **Desnormalização Inteligente**: Dados relacionados agrupados em um documento
3. **Consultas Complexas**: Aggregation Framework poderoso
4. **Escalabilidade Horizontal**: Suporte nativo para sharding
5. **Performance**: Menos JOINs necessários

## Desvantagens Consideradas

1. **Consistência Eventual**: Menos garantias ACID
2. **Duplicação de Dados**: Possível inconsistência em dados duplicados
3. **Tamanho dos Documentos**: Limite de 16MB por documento
4. **Transações**: Suporte limitado comparado ao PostgreSQL

## Migração PostgreSQL → MongoDB

Se fosse necessário migrar para MongoDB, seria preciso:

1. **ETL dos dados** relacionais para documentos
2. **Reestruturação de queries** para usar aggregation
3. **Ajuste da camada de aplicação** para trabalhar com documentos
4. **Revisão da estratégia de backup** e replicação
5. **Treinamento da equipe** em NoSQL e MongoDB específico
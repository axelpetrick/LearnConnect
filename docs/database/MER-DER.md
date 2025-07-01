# Modelo Entidade-Relacionamento (MER) e Diagrama Entidade-Relacionamento (DER)

## Modelo Conceitual (MER)

### Entidades Principais

#### 1. USUÁRIO
- **Atributos**: id, username, email, password, firstName, lastName, role, avatar, createdAt
- **Descrição**: Representa todos os usuários do sistema (estudantes, tutores, administradores)

#### 2. CURSO
- **Atributos**: id, title, description, authorId, category, tags, isPublished, createdAt, updatedAt
- **Descrição**: Representa os cursos oferecidos na plataforma

#### 3. MATRÍCULA (COURSE_ENROLLMENT)
- **Atributos**: id, userId, courseId, progress, grade, completedAt, enrolledAt, attendanceCount, absenceCount
- **Descrição**: Relacionamento entre usuário e curso, contendo informações de progresso

#### 4. NOTA
- **Atributos**: id, title, content, authorId, courseId, tags, isPublic, createdAt, updatedAt
- **Descrição**: Materiais de estudo criados pelos usuários

#### 5. TÓPICO_FÓRUM (FORUM_TOPIC)
- **Atributos**: id, title, content, authorId, courseId, isPinned, views, createdAt, updatedAt
- **Descrição**: Tópicos de discussão no fórum

#### 6. COMENTÁRIO_FÓRUM (FORUM_COMMENT)
- **Atributos**: id, content, authorId, topicId, parentId, votes, isAnonymous, createdAt, updatedAt
- **Descrição**: Comentários em tópicos do fórum

#### 7. VOTO_COMENTÁRIO (COMMENT_VOTE)
- **Atributos**: id, userId, commentId, voteType, createdAt
- **Descrição**: Votos dados pelos usuários em comentários

#### 8. VOTO_TÓPICO (TOPIC_VOTE)
- **Atributos**: id, userId, topicId, voteType, createdAt
- **Descrição**: Votos dados pelos usuários em tópicos

#### 9. COMPLETUDE_NOTA (NOTE_COMPLETION)
- **Atributos**: id, userId, noteId, completedAt
- **Descrição**: Controle de notas marcadas como concluídas

#### 10. REGISTRO_PRESENÇA (ATTENDANCE_RECORD)
- **Atributos**: id, userId, courseId, date, type, createdAt
- **Descrição**: Registro de presença/ausência dos estudantes

### Relacionamentos

1. **USUÁRIO cria CURSO** (1:N)
   - Um usuário pode criar vários cursos
   - Um curso é criado por um usuário

2. **USUÁRIO se matricula em CURSO** (N:N através de MATRÍCULA)
   - Um usuário pode se matricular em vários cursos
   - Um curso pode ter vários usuários matriculados

3. **USUÁRIO cria NOTA** (1:N)
   - Um usuário pode criar várias notas
   - Uma nota é criada por um usuário

4. **CURSO contém NOTA** (1:N)
   - Um curso pode ter várias notas
   - Uma nota pode estar associada a um curso

5. **USUÁRIO cria TÓPICO_FÓRUM** (1:N)
   - Um usuário pode criar vários tópicos
   - Um tópico é criado por um usuário

6. **CURSO contém TÓPICO_FÓRUM** (1:N)
   - Um curso pode ter vários tópicos
   - Um tópico pode estar associado a um curso

7. **USUÁRIO cria COMENTÁRIO_FÓRUM** (1:N)
   - Um usuário pode criar vários comentários
   - Um comentário é criado por um usuário

8. **TÓPICO_FÓRUM contém COMENTÁRIO_FÓRUM** (1:N)
   - Um tópico pode ter vários comentários
   - Um comentário pertence a um tópico

9. **COMENTÁRIO_FÓRUM responde COMENTÁRIO_FÓRUM** (1:N - autorreferência)
   - Um comentário pode ter várias respostas
   - Uma resposta é de um comentário pai

10. **USUÁRIO vota em COMENTÁRIO_FÓRUM** (N:N através de VOTO_COMENTÁRIO)
    - Um usuário pode votar em vários comentários
    - Um comentário pode receber votos de vários usuários

## Diagrama Entidade-Relacionamento (DER) - Representação Visual

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   USUÁRIO   │────│  MATRÍCULA  │────│    CURSO    │
│             │    │             │    │             │
│ • id (PK)   │    │ • id (PK)   │    │ • id (PK)   │
│ • username  │    │ • userId FK │    │ • title     │
│ • email     │    │ • courseId FK│   │ • description│
│ • password  │    │ • progress  │    │ • authorId FK│
│ • firstName │    │ • grade     │    │ • category  │
│ • lastName  │    │ • enrolledAt│    │ • tags      │
│ • role      │    │ • completedAt│   │ • isPublished│
│ • avatar    │    │ • attendanceCount│ • createdAt │
│ • createdAt │    │ • absenceCount│   │ • updatedAt │
└─────────────┘    └─────────────┘    └─────────────┘
       │                                     │
       │                                     │
       │            ┌─────────────┐          │
       └────────────│    NOTA     │──────────┘
                    │             │
                    │ • id (PK)   │
                    │ • title     │
                    │ • content   │
                    │ • authorId FK│
                    │ • courseId FK│
                    │ • tags      │
                    │ • isPublic  │
                    │ • createdAt │
                    │ • updatedAt │
                    └─────────────┘
                           │
                           │
       ┌─────────────────────────────────────┘
       │
       │    ┌─────────────────┐
       └────│ NOTE_COMPLETION │
            │                 │
            │ • id (PK)       │
            │ • userId (FK)   │
            │ • noteId (FK)   │
            │ • completedAt   │
            └─────────────────┘

┌─────────────┐    ┌─────────────────┐    ┌─────────────┐
│ FORUM_TOPIC │────│ FORUM_COMMENT   │────│COMMENT_VOTE │
│             │    │                 │    │             │
│ • id (PK)   │    │ • id (PK)       │    │ • id (PK)   │
│ • title     │    │ • content       │    │ • userId FK │
│ • content   │    │ • authorId FK   │    │ • commentId FK│
│ • authorId FK│   │ • topicId FK    │    │ • voteType  │
│ • courseId FK│   │ • parentId FK   │    │ • createdAt │
│ • isPinned  │    │ • votes         │    └─────────────┘
│ • views     │    │ • isAnonymous   │
│ • createdAt │    │ • createdAt     │
│ • updatedAt │    │ • updatedAt     │
└─────────────┘    └─────────────────┘
       │                   │
       │                   └─── (autorreferência para replies)
       │
       │    ┌─────────────┐
       └────│ TOPIC_VOTE  │
            │             │
            │ • id (PK)   │
            │ • userId FK │
            │ • topicId FK│
            │ • voteType  │
            │ • createdAt │
            └─────────────┘

┌─────────────────────┐
│ ATTENDANCE_RECORD   │
│                     │
│ • id (PK)           │
│ • userId (FK)       │
│ • courseId (FK)     │
│ • date              │
│ • type              │
│ • createdAt         │
└─────────────────────┘
```

## Modelo Lógico - Schema PostgreSQL

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student',
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Cursos
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(255) NOT NULL,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Matrículas
CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    grade INTEGER,
    completed_at TIMESTAMP,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_count INTEGER DEFAULT 0,
    absence_count INTEGER DEFAULT 0,
    UNIQUE(user_id, course_id)
);

-- Tabela de Notas
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    tags TEXT[],
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Completude de Notas
CREATE TABLE note_completions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, note_id)
);

-- Tabela de Tópicos do Fórum
CREATE TABLE forum_topics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Comentários do Fórum
CREATE TABLE forum_comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
    votes INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Votos em Comentários
CREATE TABLE comment_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL, -- 1 para upvote, -1 para downvote
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, comment_id)
);

-- Tabela de Votos em Tópicos
CREATE TABLE topic_votes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL, -- 1 para upvote, -1 para downvote
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_id)
);

-- Tabela de Registros de Presença
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'present' ou 'absent'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id, date)
);
```

## Índices para Otimização

```sql
-- Índices para melhorar performance
CREATE INDEX idx_courses_author ON courses(author_id);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_notes_author ON notes(author_id);
CREATE INDEX idx_notes_course ON notes(course_id);
CREATE INDEX idx_forum_topics_course ON forum_topics(course_id);
CREATE INDEX idx_forum_comments_topic ON forum_comments(topic_id);
CREATE INDEX idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_note_completions_user ON note_completions(user_id);
CREATE INDEX idx_attendance_user_course ON attendance_records(user_id, course_id);
```

## Constraints e Validações

```sql
-- Constraints adicionais
ALTER TABLE users ADD CONSTRAINT chk_role 
CHECK (role IN ('student', 'tutor', 'admin'));

ALTER TABLE course_enrollments ADD CONSTRAINT chk_progress 
CHECK (progress >= 0 AND progress <= 100);

ALTER TABLE course_enrollments ADD CONSTRAINT chk_grade 
CHECK (grade >= 0 AND grade <= 100);

ALTER TABLE comment_votes ADD CONSTRAINT chk_vote_type 
CHECK (vote_type IN (-1, 1));

ALTER TABLE topic_votes ADD CONSTRAINT chk_vote_type 
CHECK (vote_type IN (-1, 1));

ALTER TABLE attendance_records ADD CONSTRAINT chk_attendance_type 
CHECK (type IN ('present', 'absent'));
```

## Relacionamentos e Cardinalidades

| Relacionamento | Cardinalidade | Descrição |
|---|---|---|
| User → Course (autoria) | 1:N | Um usuário pode criar vários cursos |
| User ↔ Course (matrícula) | N:N | Através da tabela course_enrollments |
| User → Note | 1:N | Um usuário pode criar várias notas |
| Course → Note | 1:N | Um curso pode ter várias notas |
| User → ForumTopic | 1:N | Um usuário pode criar vários tópicos |
| Course → ForumTopic | 1:N | Um curso pode ter vários tópicos |
| ForumTopic → ForumComment | 1:N | Um tópico pode ter vários comentários |
| ForumComment → ForumComment | 1:N | Comentários podem ter respostas |
| User ↔ ForumComment (votos) | N:N | Através da tabela comment_votes |
| User ↔ Note (completude) | N:N | Através da tabela note_completions |
| User ↔ Course (presença) | N:N | Através da tabela attendance_records |
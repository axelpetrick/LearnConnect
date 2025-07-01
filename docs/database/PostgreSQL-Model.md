# Modelo de Dados PostgreSQL - EduCollab

## Visão Geral

O EduCollab utiliza PostgreSQL como banco de dados principal, oferecendo robustez, confiabilidade e suporte completo a transações ACID. Este documento detalha a estrutura de dados, relacionamentos e exemplos de registros utilizados na plataforma.

## Stack Tecnológico

- **Banco de Dados**: PostgreSQL 15+
- **ORM**: Drizzle ORM com TypeScript
- **Validação**: Zod para schemas
- **Migrações**: Drizzle Kit
- **Conexão**: Neon Database (Serverless PostgreSQL)

## Estrutura de Tabelas

### 1. Tabela: users

**Descrição**: Armazena informações de todos os usuários da plataforma (estudantes, tutores, administradores).

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  avatar TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Exemplo de Registro**:
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@educollab.com",
  "password": "$2b$10$hashed_password_here",
  "first_name": "Administrador",
  "last_name": "Sistema",
  "role": "admin",
  "avatar": null,
  "created_at": "2025-01-01T00:00:00.000Z"
}
```

**Roles Disponíveis**:
- `student`: Estudante da plataforma
- `tutor`: Professor/Instrutor
- `admin`: Administrador do sistema

### 2. Tabela: courses

**Descrição**: Contém informações sobre os cursos oferecidos na plataforma.

```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id INTEGER NOT NULL REFERENCES users(id),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Exemplo de Registro**:
```json
{
  "id": 1,
  "title": "Medicina de Software",
  "description": "Curso avançado sobre desenvolvimento de software aplicado à área médica",
  "content": "Conteúdo programático detalhado...",
  "category": "Tecnologia",
  "tags": ["javascript", "react", "medicina", "software"],
  "author_id": 8,
  "is_published": true,
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T12:00:00.000Z"
}
```

### 3. Tabela: course_enrollments

**Descrição**: Relaciona estudantes aos cursos em que estão matriculados, incluindo progresso e notas.

```sql
CREATE TABLE course_enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  progress INTEGER DEFAULT 0,
  grade INTEGER,
  completed_at TIMESTAMP,
  enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  attendance_count INTEGER DEFAULT 0,
  absence_count INTEGER DEFAULT 0
);
```

**Exemplo de Registro**:
```json
{
  "id": 18,
  "user_id": 9,
  "course_id": 1,
  "progress": 75,
  "grade": 85,
  "completed_at": null,
  "enrolled_at": "2025-01-01T00:00:00.000Z",
  "attendance_count": 12,
  "absence_count": 2
}
```

**Campos Importantes**:
- `progress`: Progresso do estudante (0-100%)
- `grade`: Nota final do estudante (0-100)
- `attendance_count`/`absence_count`: Contadores de presença/falta

### 4. Tabela: notes

**Descrição**: Armazena notas e materiais de estudo criados por professores e estudantes.

```sql
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  is_public BOOLEAN DEFAULT FALSE,
  allowed_roles TEXT[] DEFAULT '{tutor,admin}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Exemplo de Registro**:
```json
{
  "id": 1,
  "title": "Material de Apoio - Versionamento",
  "content": "# Versionamento de Software\n\nConteúdo sobre Git e controle de versão...",
  "tags": ["git", "versionamento", "desenvolvimento"],
  "author_id": 8,
  "course_id": 1,
  "is_public": false,
  "allowed_roles": ["tutor", "admin"],
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T10:30:00.000Z"
}
```

**Sistema de Permissões**:
- `is_public`: Se true, visível para todos
- `allowed_roles`: Array de roles que podem visualizar a nota

### 5. Tabela: note_completions

**Descrição**: Controla quais notas foram marcadas como concluídas pelos estudantes.

```sql
CREATE TABLE note_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  note_id INTEGER NOT NULL REFERENCES notes(id),
  completed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Exemplo de Registro**:
```json
{
  "id": 45,
  "user_id": 9,
  "note_id": 1,
  "completed_at": "2025-01-01T14:30:00.000Z"
}
```

### 6. Tabela: forum_topics

**Descrição**: Tópicos de discussão no fórum da plataforma.

```sql
CREATE TABLE forum_topics (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER REFERENCES courses(id),
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Exemplo de Registro**:
```json
{
  "id": 31,
  "title": "Dúvidas sobre integração com APIs médicas",
  "content": "Gostaria de entender melhor como integrar com APIs do sistema de saúde...",
  "author_id": 7,
  "course_id": 1,
  "tags": ["api", "integracao", "medicina"],
  "is_pinned": false,
  "views": 45,
  "created_at": "2025-01-01T09:00:00.000Z",
  "updated_at": "2025-01-01T15:30:00.000Z"
}
```

### 7. Tabela: forum_comments

**Descrição**: Comentários e respostas nos tópicos do fórum.

```sql
CREATE TABLE forum_comments (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL REFERENCES users(id),
  topic_id INTEGER NOT NULL REFERENCES forum_topics(id),
  parent_id INTEGER REFERENCES forum_comments(id),
  votes INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Exemplo de Registro**:
```json
{
  "id": 32,
  "content": "Para integração com APIs médicas, recomendo usar OAuth 2.0...",
  "author_id": 8,
  "topic_id": 31,
  "parent_id": null,
  "votes": 15,
  "is_anonymous": false,
  "created_at": "2025-01-01T10:00:00.000Z",
  "updated_at": "2025-01-01T10:15:00.000Z"
}
```

**Sistema de Threading**:
- `parent_id`: null para comentários principais, id do comentário pai para respostas
- `is_anonymous`: Permite comentários anônimos (proteção de privacidade)

### 8. Tabela: comment_votes

**Descrição**: Sistema de votação para comentários do fórum.

```sql
CREATE TABLE comment_votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment_id INTEGER NOT NULL REFERENCES forum_comments(id),
  vote_type INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Exemplo de Registro**:
```json
{
  "id": 1,
  "user_id": 7,
  "comment_id": 32,
  "vote_type": 1,
  "created_at": "2025-01-01T10:30:00.000Z"
}
```

**Tipos de Voto**:
- `1`: Upvote (positivo)
- `-1`: Downvote (negativo)

### 9. Tabela: topic_votes

**Descrição**: Sistema de votação para tópicos do fórum.

```sql
CREATE TABLE topic_votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  topic_id INTEGER NOT NULL REFERENCES forum_topics(id),
  vote_type INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 10. Tabela: attendance_records

**Descrição**: Registros de presença e ausência dos estudantes.

```sql
CREATE TABLE attendance_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  course_id INTEGER NOT NULL REFERENCES courses(id),
  date TIMESTAMP NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_course_date UNIQUE (user_id, course_id, date)
);
```

**Exemplo de Registro**:
```json
{
  "id": 1,
  "user_id": 9,
  "course_id": 1,
  "date": "2025-01-01T00:00:00.000Z",
  "type": "presence",
  "created_at": "2025-01-01T08:00:00.000Z"
}
```

**Tipos de Registro**:
- `presence`: Estudante presente
- `absence`: Estudante ausente

### 11. Tabela: notifications

**Descrição**: Sistema de notificações para usuários.

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  related_id INTEGER,
  related_type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Exemplo de Registro**:
```json
{
  "id": 1,
  "user_id": 9,
  "title": "Nova nota disponível",
  "message": "O professor adicionou uma nova nota ao curso Medicina de Software",
  "type": "note",
  "related_id": 1,
  "related_type": "note",
  "is_read": false,
  "created_at": "2025-01-01T10:30:00.000Z"
}
```

## Relacionamentos e Constraints

### Chaves Estrangeiras

```sql
-- Courses
ALTER TABLE courses ADD CONSTRAINT fk_courses_author 
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- Enrollments
ALTER TABLE course_enrollments ADD CONSTRAINT fk_enrollments_user 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE course_enrollments ADD CONSTRAINT fk_enrollments_course 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;

-- Notes
ALTER TABLE notes ADD CONSTRAINT fk_notes_author 
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE notes ADD CONSTRAINT fk_notes_course 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Forum Topics
ALTER TABLE forum_topics ADD CONSTRAINT fk_topics_author 
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE forum_topics ADD CONSTRAINT fk_topics_course 
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Forum Comments
ALTER TABLE forum_comments ADD CONSTRAINT fk_comments_author 
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE forum_comments ADD CONSTRAINT fk_comments_topic 
  FOREIGN KEY (topic_id) REFERENCES forum_topics(id) ON DELETE CASCADE;
ALTER TABLE forum_comments ADD CONSTRAINT fk_comments_parent 
  FOREIGN KEY (parent_id) REFERENCES forum_comments(id) ON DELETE CASCADE;
```

### Índices para Performance

```sql
-- Índices principais
CREATE INDEX idx_courses_author ON courses(author_id);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_notes_author ON notes(author_id);
CREATE INDEX idx_notes_course ON notes(course_id);
CREATE INDEX idx_notes_public ON notes(is_public);
CREATE INDEX idx_forum_topics_course ON forum_topics(course_id);
CREATE INDEX idx_forum_topics_pinned ON forum_topics(is_pinned);
CREATE INDEX idx_forum_comments_topic ON forum_comments(topic_id);
CREATE INDEX idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_note_completions_user ON note_completions(user_id);
CREATE INDEX idx_attendance_user_course ON attendance_records(user_id, course_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);

-- Índices compostos para queries complexas
CREATE INDEX idx_enrollments_user_progress ON course_enrollments(user_id, progress);
CREATE INDEX idx_notes_course_public ON notes(course_id, is_public);
CREATE INDEX idx_forum_comments_topic_created ON forum_comments(topic_id, created_at);
```

## Consultas SQL Úteis

### 1. Estatísticas de Curso

```sql
SELECT 
  c.id,
  c.title,
  COUNT(ce.id) as total_enrollments,
  AVG(ce.progress) as avg_progress,
  AVG(ce.grade) as avg_grade,
  COUNT(CASE WHEN ce.completed_at IS NOT NULL THEN 1 END) as completed_count
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
WHERE c.is_published = true
GROUP BY c.id, c.title
ORDER BY total_enrollments DESC;
```

### 2. Progresso do Estudante

```sql
SELECT 
  u.first_name,
  u.last_name,
  c.title as course_title,
  ce.progress,
  ce.grade,
  ce.attendance_count,
  ce.absence_count,
  ROUND((ce.attendance_count::FLOAT / 
    NULLIF(ce.attendance_count + ce.absence_count, 0)) * 100, 2) as attendance_rate
FROM users u
JOIN course_enrollments ce ON u.id = ce.user_id
JOIN courses c ON ce.course_id = c.id
WHERE u.role = 'student'
ORDER BY ce.progress DESC;
```

### 3. Atividade Recente do Fórum

```sql
SELECT 
  ft.title as topic_title,
  u.first_name as author_name,
  c.title as course_title,
  ft.views,
  COUNT(fc.id) as comment_count,
  ft.created_at
FROM forum_topics ft
JOIN users u ON ft.author_id = u.id
LEFT JOIN courses c ON ft.course_id = c.id
LEFT JOIN forum_comments fc ON ft.id = fc.topic_id
WHERE ft.created_at >= NOW() - INTERVAL '7 days'
GROUP BY ft.id, ft.title, u.first_name, c.title, ft.views, ft.created_at
ORDER BY ft.created_at DESC;
```

### 4. Notas Concluídas por Estudante

```sql
SELECT 
  u.first_name,
  u.last_name,
  c.title as course_title,
  COUNT(nc.id) as notes_completed,
  COUNT(n.id) as total_notes,
  ROUND((COUNT(nc.id)::FLOAT / NULLIF(COUNT(n.id), 0)) * 100, 2) as completion_rate
FROM users u
JOIN course_enrollments ce ON u.id = ce.user_id
JOIN courses c ON ce.course_id = c.id
LEFT JOIN notes n ON c.id = n.course_id
LEFT JOIN note_completions nc ON n.id = nc.note_id AND u.id = nc.user_id
WHERE u.role = 'student'
GROUP BY u.id, u.first_name, u.last_name, c.id, c.title
ORDER BY completion_rate DESC;
```

### 5. Relatório de Presença

```sql
SELECT 
  u.first_name,
  u.last_name,
  c.title as course_title,
  COUNT(CASE WHEN ar.type = 'presence' THEN 1 END) as present_days,
  COUNT(CASE WHEN ar.type = 'absence' THEN 1 END) as absent_days,
  COUNT(ar.id) as total_records
FROM users u
JOIN course_enrollments ce ON u.id = ce.user_id
JOIN courses c ON ce.course_id = c.id
LEFT JOIN attendance_records ar ON u.id = ar.user_id AND c.id = ar.course_id
WHERE u.role = 'student'
GROUP BY u.id, u.first_name, u.last_name, c.id, c.title
ORDER BY present_days DESC;
```

## Schema TypeScript (Drizzle ORM)

O projeto utiliza Drizzle ORM com TypeScript para type-safety:

```typescript
export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'tutor' | 'admin';
  avatar: string | null;
  createdAt: Date;
};

export type Course = {
  id: number;
  title: string;
  description: string;
  content: string | null;
  category: string;
  tags: string[];
  authorId: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseEnrollment = {
  id: number;
  userId: number;
  courseId: number;
  progress: number | null;
  grade: number | null;
  completedAt: Date | null;
  enrolledAt: Date;
  attendanceCount: number | null;
  absenceCount: number | null;
};
```

## Backup e Recuperação

### Backup Automático

```bash
# Backup diário
pg_dump -h host -U user -d educollab_db > backup_$(date +%Y%m%d).sql

# Backup com compressão
pg_dump -h host -U user -d educollab_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restauração

```bash
# Restaurar backup
psql -h host -U user -d educollab_db < backup_20250101.sql

# Restaurar backup comprimido
gunzip -c backup_20250101.sql.gz | psql -h host -U user -d educollab_db
```

## Monitoramento e Performance

### Queries de Monitoramento

```sql
-- Tabelas maiores
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Queries mais lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Índices não utilizados
SELECT 
  indexrelname,
  relname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;
```

## Vantagens do PostgreSQL

1. **ACID Compliance**: Garantias de transação completas
2. **JSON Support**: Suporte nativo para dados semi-estruturados
3. **Full-Text Search**: Busca textual avançada
4. **Extensibilidade**: Funções personalizadas e extensões
5. **Performance**: Otimizador de queries sofisticado
6. **Concurrent Control**: Controle de concorrência MVCC
7. **Reliability**: Backup e recuperação robustos
8. **Standards Compliance**: Aderência aos padrões SQL
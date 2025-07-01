# Diagramas UML - EduCollab Platform

## 1. Diagrama de Casos de Uso

### Atores

**Estudante**
- Visualizar cursos disponíveis
- Matricular-se em cursos
- Visualizar materiais do curso
- Marcar notas como concluídas
- Participar de discussões no fórum
- Visualizar seu progresso
- Comentar em tópicos
- Votar em comentários
- Visualizar registro de presença

**Tutor/Professor**
- Criar e editar cursos
- Gerenciar estudantes matriculados
- Criar materiais de estudo (notas)
- Atribuir notas aos estudantes
- Moderar discussões no fórum
- Controlar presença/ausência
- Visualizar relatórios de desempenho
- Responder a dúvidas

**Administrador**
- Gerenciar todos os usuários
- Visualizar todos os cursos
- Acessar relatórios globais
- Moderar todo o conteúdo
- Configurar sistema
- Resetar senhas
- Gerenciar permissões

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Sistema EduCollab                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Estudante                     Casos de Uso                Tutor    │
│     │                                                        │      │
│     ├─── Visualizar Cursos ────────────────────────────────┤      │
│     ├─── Matricular-se ─────────────────────────────────────┤      │
│     ├─── Visualizar Materiais ──────────────────────────────┤      │
│     ├─── Marcar Nota Concluída ─────────────────────────────┤      │
│     ├─── Participar do Fórum ───────────────────────────────┼─────┤
│     ├─── Visualizar Progresso ──────────────────────────────┤      │
│     ├─── Comentar Tópicos ──────────────────────────────────┼─────┤
│     ├─── Votar em Comentários ──────────────────────────────┼─────┤
│     └─── Ver Registro Presença ─────────────────────────────┤      │
│                                                              │      │
│                             │                               │      │
│                             ├─── Criar Cursos ──────────────┤      │
│                             ├─── Gerenciar Estudantes ──────┤      │
│                             ├─── Criar Materiais ───────────┤      │
│                             ├─── Atribuir Notas ────────────┤      │
│                             ├─── Moderar Fórum ─────────────┤      │
│                             ├─── Controlar Presença ────────┤      │
│                             ├─── Ver Relatórios ────────────┤      │
│                             └─── Responder Dúvidas ─────────┤      │
│                                                              │      │
│        Admin                       │                        │      │
│          │                         │                        │      │
│          ├─── Gerenciar Usuários ──┤                        │      │
│          ├─── Ver Todos Cursos ────┤                        │      │
│          ├─── Relatórios Globais ──┤                        │      │
│          ├─── Moderar Conteúdo ────┤                        │      │
│          ├─── Configurar Sistema ──┤                        │      │
│          ├─── Resetar Senhas ──────┤                        │      │
│          └─── Gerenciar Permissões ┤                        │      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## 2. Diagrama de Classes (Backend)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Sistema EduCollab - Classes                  │
└─────────────────────────────────────────────────────────────────────┘

┌────────────────────────┐
│        User            │
├────────────────────────┤
│ - id: number           │
│ - username: string     │
│ - email: string        │
│ - password: string     │
│ - firstName: string    │
│ - lastName: string     │
│ - role: UserRole       │
│ - avatar: string?      │
│ - createdAt: Date      │
├────────────────────────┤
│ + login()              │
│ + logout()             │
│ + updateProfile()      │
│ + changePassword()     │
└────────────────────────┘
            │
            │ 1:N
            ▼
┌────────────────────────┐         ┌─────────────────────────┐
│       Course           │◄────────│   CourseEnrollment     │
├────────────────────────┤   1:N   ├─────────────────────────┤
│ - id: number           │         │ - id: number            │
│ - title: string        │         │ - userId: number        │
│ - description: string  │         │ - courseId: number      │
│ - content: string?     │         │ - progress: number      │
│ - category: string     │         │ - grade: number?        │
│ - tags: string[]       │         │ - completedAt: Date?    │
│ - authorId: number     │         │ - enrolledAt: Date      │
│ - isPublished: boolean │         │ - attendanceCount: number│
│ - createdAt: Date      │         │ - absenceCount: number  │
│ - updatedAt: Date      │         ├─────────────────────────┤
├────────────────────────┤         │ + updateProgress()      │
│ + create()             │         │ + setGrade()            │
│ + update()             │         │ + markCompleted()       │
│ + delete()             │         │ + getAttendanceRate()   │
│ + publish()            │         └─────────────────────────┘
│ + addStudent()         │
│ + removeStudent()      │
└────────────────────────┘
            │
            │ 1:N
            ▼
┌────────────────────────┐         ┌─────────────────────────┐
│         Note           │         │    NoteCompletion       │
├────────────────────────┤   1:N   ├─────────────────────────┤
│ - id: number           │◄────────│ - id: number            │
│ - title: string        │         │ - userId: number        │
│ - content: string      │         │ - noteId: number        │
│ - tags: string[]       │         │ - completedAt: Date     │
│ - authorId: number     │         ├─────────────────────────┤
│ - courseId: number?    │         │ + create()              │
│ - isPublic: boolean    │         │ + delete()              │
│ - allowedRoles: string[]│        └─────────────────────────┘
│ - createdAt: Date      │
│ - updatedAt: Date      │
├────────────────────────┤
│ + create()             │
│ + update()             │
│ + delete()             │
│ + markAsCompleted()    │
│ + checkPermissions()   │
└────────────────────────┘

┌────────────────────────┐         ┌─────────────────────────┐
│      ForumTopic        │   1:N   │     ForumComment        │
├────────────────────────┤◄────────├─────────────────────────┤
│ - id: number           │         │ - id: number            │
│ - title: string        │         │ - content: string       │
│ - content: string      │         │ - authorId: number      │
│ - authorId: number     │         │ - topicId: number       │
│ - courseId: number?    │         │ - parentId: number?     │
│ - tags: string[]       │         │ - votes: number         │
│ - isPinned: boolean    │         │ - isAnonymous: boolean  │
│ - views: number        │         │ - createdAt: Date       │
│ - createdAt: Date      │         │ - updatedAt: Date       │
│ - updatedAt: Date      │         ├─────────────────────────┤
├────────────────────────┤         │ + create()              │
│ + create()             │         │ + update()              │
│ + update()             │         │ + delete()              │
│ + delete()             │         │ + reply()               │
│ + pin()                │         │ + vote()                │
│ + incrementViews()     │         └─────────────────────────┘
│ + addComment()         │                      │
└────────────────────────┘                      │ 1:N (self-reference)
                                                 ▼
                                   ┌─────────────────────────┐
                                   │      CommentVote        │
                                   ├─────────────────────────┤
                                   │ - id: number            │
                                   │ - userId: number        │
                                   │ - commentId: number     │
                                   │ - voteType: number      │
                                   │ - createdAt: Date       │
                                   ├─────────────────────────┤
                                   │ + create()              │
                                   │ + update()              │
                                   │ + delete()              │
                                   └─────────────────────────┘

┌────────────────────────┐
│   AttendanceRecord     │
├────────────────────────┤
│ - id: number           │
│ - userId: number       │
│ - courseId: number     │
│ - date: Date           │
│ - type: AttendanceType │
│ - createdAt: Date      │
├────────────────────────┤
│ + markPresence()       │
│ + markAbsence()        │
│ + getRecordsByDate()   │
└────────────────────────┘

┌────────────────────────┐
│     DatabaseStorage    │
├────────────────────────┤
│ - db: Database         │
├────────────────────────┤
│ + getUser()            │
│ + createUser()         │
│ + updateUser()         │
│ + getCourses()         │
│ + createCourse()       │
│ + enrollInCourse()     │
│ + getNotes()           │
│ + createNote()         │
│ + getForumTopics()     │
│ + createForumTopic()   │
│ + getForumComments()   │
│ + createForumComment() │
│ + markAttendance()     │
│ + getUserStats()       │
└────────────────────────┘

Enumerações:

┌────────────────────────┐
│      UserRole          │
├────────────────────────┤
│ STUDENT                │
│ TUTOR                  │
│ ADMIN                  │
└────────────────────────┘

┌────────────────────────┐
│   AttendanceType       │
├────────────────────────┤
│ PRESENCE               │
│ ABSENCE                │
└────────────────────────┘

┌────────────────────────┐
│      VoteType          │
├────────────────────────┤
│ UPVOTE = 1             │
│ DOWNVOTE = -1          │
└────────────────────────┘
```

## 3. Fluxograma de Autenticação

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Fluxo de Autenticação EduCollab                  │
└─────────────────────────────────────────────────────────────────────┘

                                [INÍCIO]
                                    │
                                    ▼
                            ┌───────────────┐
                            │ Página Login  │
                            └───────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │ Usuário insere│
                            │ credenciais   │
                            └───────────────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │ POST /auth/   │
                            │ login         │
                            └───────────────┘
                                    │
                                    ▼
                           ┌────────────────┐
                           │ Validar dados  │
                           │ com Zod        │
                           └────────────────┘
                                    │
                                    ▼
                              ┌──────────┐
                              │ Dados    │ ────── Não ──────┐
                              │ válidos? │                  │
                              └──────────┘                  │
                                    │ Sim                   │
                                    ▼                       │
                            ┌───────────────┐               │
                            │ Buscar usuário│               │
                            │ no banco      │               │
                            └───────────────┘               │
                                    │                       │
                                    ▼                       │
                              ┌──────────┐                  │
                              │ Usuário  │ ────── Não ──────┤
                              │ existe?  │                  │
                              └──────────┘                  │
                                    │ Sim                   │
                                    ▼                       │
                            ┌───────────────┐               │
                            │ Verificar     │               │
                            │ senha (bcrypt)│               │
                            └───────────────┘               │
                                    │                       │
                                    ▼                       │
                              ┌──────────┐                  │
                              │ Senha    │ ────── Não ──────┤
                              │ correta? │                  │
                              └──────────┘                  │
                                    │ Sim                   │
                                    ▼                       │
                            ┌───────────────┐               │
                            │ Gerar JWT     │               │
                            │ Token         │               │
                            └───────────────┘               │
                                    │                       │
                                    ▼                       │
                            ┌───────────────┐               │
                            │ Retornar:     │               │
                            │ - token       │               │ 
                            │ - user data   │               │
                            └───────────────┘               │
                                    │                       │
                                    ▼                       │
                            ┌───────────────┐               │
                            │ Armazenar     │               │
                            │ token no      │               │
                            │ localStorage  │               │
                            └───────────────┘               │
                                    │                       │
                                    ▼                       │
                            ┌───────────────┐               │
                            │ Redirecionar  │               │
                            │ para Dashboard│               │
                            └───────────────┘               │
                                    │                       │
                                    ▼                       │
                                [SUCESSO]                   │
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │ Retornar erro │
                                                    │ 401 - Não    │
                                                    │ autorizado    │
                                                    └───────────────┘
                                                            │
                                                            ▼
                                                    ┌───────────────┐
                                                    │ Exibir        │
                                                    │ mensagem de   │
                                                    │ erro          │
                                                    └───────────────┘
                                                            │
                                                            ▼
                                                        [ERRO]

```

### Middleware de Autenticação

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Middleware authenticateToken                       │
└─────────────────────────────────────────────────────────────────────┘

                                [REQUISIÇÃO]
                                     │
                                     ▼
                            ┌─────────────────┐
                            │ Extrair Bearer  │
                            │ Token do Header │
                            └─────────────────┘
                                     │
                                     ▼
                               ┌──────────┐
                               │ Token    │ ────── Não ──────┐
                               │ existe?  │                  │
                               └──────────┘                  │
                                     │ Sim                   │
                                     ▼                       │
                            ┌─────────────────┐               │
                            │ Verificar JWT   │               │
                            │ com secret      │               │
                            └─────────────────┘               │
                                     │                       │
                                     ▼                       │
                               ┌──────────┐                  │
                               │ Token    │ ────── Não ──────┤
                               │ válido?  │                  │
                               └──────────┘                  │
                                     │ Sim                   │
                                     ▼                       │
                            ┌─────────────────┐               │
                            │ Buscar usuário  │               │
                            │ pelo ID do token│               │
                            └─────────────────┘               │
                                     │                       │
                                     ▼                       │
                               ┌──────────┐                  │
                               │ Usuário  │ ────── Não ──────┤
                               │ existe?  │                  │
                               └──────────┘                  │
                                     │ Sim                   │
                                     ▼                       │
                            ┌─────────────────┐               │
                            │ Adicionar user  │               │
                            │ ao req.user     │               │
                            └─────────────────┘               │
                                     │                       │
                                     ▼                       │
                            ┌─────────────────┐               │
                            │ Chamar next()   │               │
                            │ middleware      │               │
                            └─────────────────┘               │
                                     │                       │
                                     ▼                       │
                                [AUTORIZADO]                  │
                                                              │
                                                              ▼
                                                    ┌─────────────────┐
                                                    │ Retornar 401    │
                                                    │ Não autorizado  │
                                                    └─────────────────┘
                                                              │
                                                              ▼
                                                        [NÃO AUTORIZADO]
```

### Controle de Acesso por Role

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Middleware requireRole                            │
└─────────────────────────────────────────────────────────────────────┘

                            [APÓS AUTHENTICATETOKEN]
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │ Verificar role do   │
                            │ usuário autenticado │
                            └─────────────────────┘
                                      │
                                      ▼
                              ┌─────────────┐
                              │ Role está   │ ───── Não ─────┐
                              │ na lista    │                │
                              │ permitida?  │                │
                              └─────────────┘                │
                                      │ Sim                  │
                                      ▼                      │
                            ┌─────────────────────┐           │
                            │ Chamar next()       │           │
                            │ middleware          │           │
                            └─────────────────────┘           │
                                      │                      │
                                      ▼                      │
                                  [AUTORIZADO]               │
                                                             │
                                                             ▼
                                                   ┌─────────────────┐
                                                   │ Retornar 403    │
                                                   │ Acesso negado   │
                                                   └─────────────────┘
                                                             │
                                                             ▼
                                                      [ACESSO NEGADO]

Exemplo de uso:
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), ...)
app.get('/api/courses', authenticateToken, requireRole(['student', 'tutor', 'admin']), ...)
```

## 4. Diagrama de Sequência - Criação de Curso

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Sequência: Criação de Curso                       │
└─────────────────────────────────────────────────────────────────────┘

Tutor    Frontend    Backend    Database    Storage
  │         │          │          │          │
  │ 1. Clica em       │          │          │
  │ "Criar Curso"     │          │          │
  │─────────►│        │          │          │
  │         │ 2. Exibe formulário│          │
  │         │◄─────────│          │          │
  │ 3. Preenche dados │          │          │
  │─────────►│        │          │          │
  │         │ 4. POST /api/courses           │
  │         │─────────►│          │          │
  │         │          │ 5. Validar com Zod │
  │         │          │─────────►│          │
  │         │          │ 6. Verificar auth  │
  │         │          │─────────►│          │
  │         │          │ 7. Verificar role  │
  │         │          │─────────►│          │
  │         │          │ 8. storage.createCourse()
  │         │          │─────────────────────►│
  │         │          │          │ 9. INSERT SQL
  │         │          │          │◄─────────│
  │         │          │          │─────────►│
  │         │          │ 10. Retorna curso  │
  │         │          │◄─────────────────────│
  │         │ 11. Retorna 201    │          │
  │         │◄─────────│          │          │
  │ 12. Redireciona   │          │          │
  │ para curso        │          │          │
  │◄─────────│        │          │          │
```

## 5. Diagrama de Atividade - Progresso do Estudante

```
┌─────────────────────────────────────────────────────────────────────┐
│              Atividade: Progresso do Estudante                      │
└─────────────────────────────────────────────────────────────────────┘

                            [ESTUDANTE ACESSA CURSO]
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Visualizar lista│
                              │ de notas do     │
                              │ curso           │
                              └─────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Selecionar nota │
                              │ para estudar    │
                              └─────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Ler conteúdo    │
                              │ da nota         │
                              └─────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Marcar nota     │
                              │ como concluída  │
                              └─────────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────────┐
                        │ Sistema atualiza:                │
                        │ - note_completions              │
                        │ - course_enrollments.progress   │
                        │ - estatísticas do dashboard     │
                        └─────────────────────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ Calcular novo   │      ┌─────────────────┐
                              │ progresso do    │ ────►│ Todas as notas  │
                              │ curso           │      │ concluídas?     │
                              └─────────────────┘      └─────────────────┘
                                       │                        │
                                       │                        │ Sim
                                       │                        ▼
                              ┌─────────────────┐      ┌─────────────────┐
                              │ Atualizar UI    │      │ Marcar curso    │
                              │ com novo        │      │ como concluído  │
                              │ progresso       │      └─────────────────┘
                              └─────────────────┘               │
                                       │                        │
                                       ▼                        │
                              ┌─────────────────┐               │
                              │ Mais notas para │ ──── Sim ─────┘
                              │ estudar?        │
                              └─────────────────┘
                                       │ Não
                                       ▼
                                   [FIM]
```

## 6. Diagrama de Estados - Fórum

```
┌─────────────────────────────────────────────────────────────────────┐
│                  Estados do Tópico do Fórum                         │
└─────────────────────────────────────────────────────────────────────┘

                            ┌─────────────────┐
                            │     CRIADO      │ ← Estado inicial
                            │                 │
                            │ - isPinned: false│
                            │ - views: 0      │
                            │ - comments: 0   │
                            └─────────────────┘
                                      │
                                      │ Usuários visualizam
                                      ▼
                            ┌─────────────────┐
                            │    POPULAR      │
                            │                 │
                            │ - views > 10    │
                            │ - comments > 5  │
                            └─────────────────┘
                                      │
                      ┌───────────────┼───────────────┐
                      │               │               │
              Admin fixa│       Muitos comments      │ Baixa atividade
                      ▼               ▼               ▼
            ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
            │    FIXADO       │ │     ATIVO       │ │    INATIVO      │
            │                 │ │                 │ │                 │
            │ - isPinned: true│ │ - comments > 20 │ │ - sem atividade │
            │ - sempre no topo│ │ - última ativ.  │ │ - 30+ dias      │
            └─────────────────┘ │   recente       │ └─────────────────┘
                      │         └─────────────────┘
                      │                   │
                      │                   │ Admin ou autor
                      │                   │ pode fechar
                      │                   ▼
                      │         ┌─────────────────┐
                      └────────►│    FECHADO      │
                                │                 │
                                │ - não aceita    │
                                │   comentários   │
                                │ - somente       │
                                │   leitura       │
                                └─────────────────┘
```

Este conjunto de diagramas UML fornece uma visão abrangente da arquitetura e funcionamento do sistema EduCollab, cobrindo desde os casos de uso até os fluxos detalhados de autenticação e estados dos componentes.
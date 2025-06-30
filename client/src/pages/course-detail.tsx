import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Book, User, Calendar, Users, Play, CheckCircle, CheckCircle2, UserPlus, GraduationCap, FileText, Plus, Trash2, Edit, MoreVertical } from 'lucide-react';
import { Course, CourseEnrollment, Note } from '@shared/schema';

export default function CourseDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [gradeValue, setGradeValue] = useState('');
  const [gradingStudent, setGradingStudent] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteIsPublic, setNoteIsPublic] = useState(true);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCourseDialogOpen, setEditCourseDialogOpen] = useState(false);
  const [editCourseData, setEditCourseData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    tags: '',
    authorId: 0,
  });
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}`);
      if (!response.ok) throw new Error('Failed to fetch course');
      return response.json();
    },
    enabled: !!id,
  });

  // Buscar informações do autor do curso
  const { data: courseAuthor, isLoading: authorLoading, error: authorError } = useQuery<any>({
    queryKey: [`/api/users/${course?.authorId}`],
    queryFn: async () => {
      if (!course?.authorId) return null;
      const response = await fetch(`/api/users/${course.authorId}`);
      if (!response.ok) throw new Error('Failed to fetch author');
      return response.json();
    },
    enabled: !!course?.authorId,
  });

  // Buscar estudantes matriculados com informações do usuário
  const { data: enrolledStudents = [] } = useQuery<any[]>({
    queryKey: ['/api/courses', id, 'enrollments-with-users'],
    queryFn: async () => {
      if (!id) return [];
      // Buscar matrículas
      const enrollments = await fetch(`/api/courses/${id}/students`).then(res => res.json());
      // Buscar dados dos usuários para cada matrícula
      const enrollmentsWithUsers = await Promise.all(
        enrollments.map(async (enrollment: any) => {
          const userResponse = await fetch(`/api/users/${enrollment.userId}`);
          const userData = userResponse.ok ? await userResponse.json() : null;
          return {
            ...enrollment,
            user: userData
          };
        })
      );
      return enrollmentsWithUsers;
    },
    enabled: !!(id && user),
  });

  // Buscar estudantes disponíveis (para matricular) - com tipagem correta
  const { data: availableStudents = [] } = useQuery<any[]>({
    queryKey: ['/api/users/students'],
    enabled: !!(user && ['tutor', 'admin'].includes(user.role)),
  });

  // Buscar tutores/professores disponíveis (para definir como responsável)
  const { data: availableTutors = [] } = useQuery<any[]>({
    queryKey: ['/api/users/tutors'],
    enabled: !!(user && ['tutor', 'admin'].includes(user.role)),
  });

  // Buscar anotações do curso
  const { data: courseNotes = [] } = useQuery<Note[]>({
    queryKey: ['/api/notes/course', id],
    queryFn: () => fetch(`/api/notes/course/${id}`).then(res => res.json()),
    enabled: !!id,
  });

  // Buscar anotações concluídas pelo estudante
  const { data: completedNotes = [], isLoading: completedNotesLoading } = useQuery<any[]>({
    queryKey: ['/api/notes/completed', id],
    queryFn: () => fetch(`/api/notes/completed/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()),
    enabled: !!(id && user?.role === 'student' && user?.id),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Buscar dados da matrícula atual do estudante
  const { data: userEnrollments = [] } = useQuery<any[]>({
    queryKey: ['/api/users/enrollments'],
    queryFn: () => fetch('/api/users/enrollments', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()),
    enabled: !!(user?.role === 'student' && user?.id),
    refetchOnMount: true,
  });

  const myEnrollment = Array.isArray(userEnrollments) 
    ? userEnrollments.find(e => e.courseId === parseInt(id || '0'))
    : null;

  // Usar dados da matrícula específica ou buscar nos dados gerais (para admins/tutors)
  const currentEnrollment = user?.role === 'student' 
    ? myEnrollment 
    : enrolledStudents.find(enrollment => enrollment.userId === user?.id);
    
  const myProgress = currentEnrollment?.progress || 0;
  const myGrade = currentEnrollment?.grade || 0;

  // Calcular estatísticas do progresso
  const totalNotes = courseNotes.length;
  const completedNotesCount = completedNotes.length;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/courses/${id}/enroll`);
    },
    onSuccess: () => {
      toast({
        title: 'Matrícula realizada!',
        description: 'Você foi matriculado no curso com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses/my/enrollments'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro na matrícula',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return apiRequest('DELETE', `/api/courses/${id}/students/${studentId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Estudante removido',
        description: 'Estudante foi removido do curso com sucesso.',
      });
      // Invalidar múltiplas queries para atualizar todas as listas
      queryClient.invalidateQueries({ queryKey: ['/api/courses', id, 'students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', id] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover estudante',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, data }: { noteId: number; data: any }) => {
      return apiRequest('PUT', `/api/notes/${noteId}`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Anotação atualizada',
        description: 'A anotação foi atualizada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notes/course', id] });
      setEditDialogOpen(false);
      setEditingNote(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar anotação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      return apiRequest('DELETE', `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      toast({
        title: 'Anotação excluída',
        description: 'A anotação foi excluída com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notes/course', id] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir anotação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para marcar anotação como concluída
  const completeNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      return apiRequest('POST', `/api/notes/${noteId}/complete`);
    },
    onSuccess: () => {
      toast({
        title: 'Anotação marcada como concluída',
        description: 'Seu progresso foi atualizado.',
      });
      // Invalidar e refazer as queries para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: ['/api/notes/completed', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', id, 'students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/enrollments'] });
      
      // Forçar refetch imediato para atualizar progresso
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/courses', id, 'students'] });
        queryClient.refetchQueries({ queryKey: ['/api/users/enrollments'] });
      }, 100);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao marcar como concluída',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para desmarcar anotação como concluída
  const uncompleteNoteMutation = useMutation({
    mutationFn: async (noteId: number) => {
      return apiRequest('DELETE', `/api/notes/${noteId}/complete`);
    },
    onSuccess: () => {
      toast({
        title: 'Anotação desmarcada',
        description: 'Seu progresso foi atualizado.',
      });
      // Invalidar e refazer as queries para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: ['/api/notes/completed', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses', id, 'students'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/enrollments'] });
      
      // Forçar refetch imediato para atualizar progresso
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/courses', id, 'students'] });
        queryClient.refetchQueries({ queryKey: ['/api/users/enrollments'] });
      }, 100);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao desmarcar como concluída',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mutation para editar curso
  const editCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      return apiRequest('PUT', `/api/courses/${id}`, courseData);
    },
    onSuccess: () => {
      toast({
        title: 'Curso atualizado!',
        description: 'As informações do curso foram atualizadas com sucesso.',
      });
      setEditCourseDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/courses', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar curso',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Função para abrir modal de edição e carregar dados
  const openEditCourseModal = () => {
    if (course) {
      setEditCourseData({
        title: course.title,
        description: course.description,
        content: course.content || '',
        category: course.category || '',
        tags: course.tags ? course.tags.join(', ') : '',
        authorId: course.authorId,
      });
      setEditCourseDialogOpen(true);
    }
  };

  // Função para salvar alterações do curso
  const handleEditCourse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editCourseData.title || !editCourseData.description || !editCourseData.category) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const courseData = {
      title: editCourseData.title,
      description: editCourseData.description,
      content: editCourseData.content || null,
      category: editCourseData.category,
      tags: editCourseData.tags ? editCourseData.tags.split(',').map(tag => tag.trim()) : null,
      authorId: editCourseData.authorId,
    };

    editCourseMutation.mutate(courseData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64">
          <Header title="Carregando..." onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64">
          <Header title="Erro" onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-8">
            <Alert variant="destructive">
              <AlertDescription>
                Curso não encontrado ou erro ao carregar.
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  const canEnroll = user?.role === 'student';
  const isAuthor = user?.id === course.authorId;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <Header title={course ? course.title : "Carregando curso..."} onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Course Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <Book className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                    <Badge variant="secondary" className="mt-1">
                      {course.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-lg text-gray-600 mb-6">{course.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 space-x-6">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>
                      {courseAuthor ? 
                        (courseAuthor.firstName ? `${courseAuthor.firstName} ${courseAuthor.lastName}` : courseAuthor.username) 
                        : (authorLoading ? 'Carregando...' : 'Professor')}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      Criado em {course.createdAt ? new Date(course.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{enrolledStudents.length} {enrolledStudents.length === 1 ? 'aluno matriculado' : 'alunos matriculados'}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-0 sm:ml-6">
                {isAuthor && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Autor deste curso</span>
                  </div>
                )}
              </div>
            </div>

            {/* Course Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre o Curso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Nome do curso */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">{course?.title}</h3>
                    </div>
                    
                    {/* Descrição do curso */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                      <p className="text-gray-700">{course?.description}</p>
                    </div>
                    
                    {/* Conteúdo detalhado */}
                    {course.content && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Conteúdo Detalhado</h4>
                        <div className="prose prose-gray max-w-none">
                          {course.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-3 text-gray-700">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Professor responsável */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Professor Responsável</h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {courseAuthor ? 
                              (courseAuthor.firstName && courseAuthor.lastName ? 
                                `${courseAuthor.firstName} ${courseAuthor.lastName}` : 
                                courseAuthor.username) 
                              : (authorLoading ? 'Carregando...' : 'Professor não definido')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {courseAuthor?.role === 'admin' ? 'Administrador' : 'Professor'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {course.tags && course.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Informações do Curso
                      {user && ['tutor', 'admin'].includes(user.role) && (
                        <Button
                          onClick={openEditCourseModal}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Status para estudantes ou status de publicação para professores */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                      <div className="flex items-center gap-2">
                        {user?.role === 'student' ? (
                          // Sistema de status para estudantes baseado na nota
                          (() => {
                            const studentGrade = myEnrollment?.grade;
                            if (!studentGrade || studentGrade === 0) {
                              return <Badge className="bg-blue-500 text-white">Cursando</Badge>;
                            } else if (studentGrade < 70) {
                              return <Badge className="bg-red-500 text-white">Reprovado</Badge>;
                            } else {
                              return <Badge className="bg-green-500 text-white">Aprovado</Badge>;
                            }
                          })()
                        ) : (
                          // Status de publicação para professores/admins
                          <>
                            <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                              {course.isPublished ? 'Publicado' : 'Rascunho'}
                            </Badge>
                            {user && ['tutor', 'admin'].includes(user.role) && course.authorId === user.id && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    await apiRequest('PUT', `/api/courses/${course.id}`, {
                                      isPublished: !course.isPublished
                                    });
                                    toast({
                                      title: 'Status alterado!',
                                      description: course.isPublished ? 'Curso despublicado' : 'Curso publicado',
                                    });
                                    queryClient.invalidateQueries({ queryKey: ['/api/courses', id] });
                                  } catch (error) {
                                    toast({
                                      title: 'Erro',
                                      description: 'Não foi possível alterar o status do curso',
                                      variant: 'destructive',
                                    });
                                  }
                                }}
                              >
                                {course.isPublished ? 'Despublicar' : 'Publicar'}
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Categoria</h4>
                      <p className="text-gray-600 capitalize">{course?.category || 'Não especificada'}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Instrutor</h4>
                      <p className="text-gray-600">
                        {courseAuthor ? 
                          (courseAuthor.firstName && courseAuthor.lastName ? 
                            `${courseAuthor.firstName} ${courseAuthor.lastName}` : 
                            courseAuthor.username) 
                          : (authorLoading ? 'Carregando...' : 'Não definido')}
                      </p>
                    </div>
                  </CardContent>
                </Card>


              </div>
            </div>

            {/* Funcionalidades Avançadas */}
            <div className="mt-12">
              {/* Para Estudantes */}
              {user?.role === 'student' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Minha Área do Curso</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          Meu Desempenho
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-2xl font-bold text-blue-600">{myGrade || '--'}</p>
                            <p className="text-sm text-blue-600">Minha Nota</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{myProgress}%</p>
                            <p className="text-sm text-green-600">Progresso</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full transition-all duration-300" style={{ width: `${myProgress}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {completedNotesCount} de {totalNotes} anotações concluídas
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Colegas de Turma
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {enrolledStudents.length === 0 ? (
                            <p className="text-gray-500">Seja o primeiro a se matricular!</p>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex flex-wrap gap-2">
                                {enrolledStudents.slice(0, 6).map((enrollment, index) => {
                                  const isCurrentUser = enrollment.userId === user?.id;
                                  const studentName = isCurrentUser 
                                    ? 'Você' 
                                    : enrollment.user 
                                      ? `${enrollment.user.firstName || enrollment.user.username}` 
                                      : `Estudante ${enrollment.userId}`;
                                  
                                  return (
                                    <Badge 
                                      key={index} 
                                      variant={isCurrentUser ? "default" : "secondary"} 
                                      className="flex items-center gap-1"
                                    >
                                      <User className="w-3 h-3" />
                                      {studentName}
                                      {enrollment.progress > 0 && (
                                        <span className="text-xs ml-1">({enrollment.progress}%)</span>
                                      )}
                                    </Badge>
                                  );
                                })}
                                {enrolledStudents.length > 6 && (
                                  <Badge variant="outline">
                                    +{enrolledStudents.length - 6} mais
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                <div>
                                  <span className="font-medium">Progresso médio:</span> {Math.round(enrolledStudents.reduce((acc, e) => acc + (e.progress || 0), 0) / enrolledStudents.length)}%
                                </div>
                                <div>
                                  <span className="font-medium">Ativos:</span> {enrolledStudents.filter(e => (e.progress || 0) > 0).length}
                                </div>
                                <div>
                                  <span className="font-medium">Média da turma:</span> {
                                    (() => {
                                      const studentsWithGrades = enrolledStudents.filter(e => e.grade && e.grade > 0);
                                      if (studentsWithGrades.length === 0) return '--';
                                      const average = studentsWithGrades.reduce((acc, e) => acc + (e.grade || 0), 0) / studentsWithGrades.length;
                                      return Math.round(average);
                                    })()
                                  }
                                </div>
                                <div>
                                  <span className="font-medium">Avaliados:</span> {enrolledStudents.filter(e => e.grade && e.grade > 0).length}
                                </div>
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Total de {enrolledStudents.length} estudantes matriculados
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Anotações do Professor
                      </CardTitle>
                      <CardDescription>
                        Material disponibilizado pelo professor para estudantes matriculados
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {courseNotes.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Nenhuma anotação disponível ainda.</p>
                          <p className="text-sm text-gray-400">O professor ainda não compartilhou materiais.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {courseNotes.map((note) => {
                            const isCompleted = Array.isArray(completedNotes) && completedNotes.some(cn => cn.noteId === note.id);
                            return (
                              <div key={note.id} className="p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h4 className="font-medium text-lg">{note.title}</h4>
                                      {user?.role === 'student' && (
                                        <Button
                                          variant={isCompleted ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => {
                                            if (isCompleted) {
                                              uncompleteNoteMutation.mutate(note.id);
                                            } else {
                                              completeNoteMutation.mutate(note.id);
                                            }
                                          }}
                                          disabled={completeNoteMutation.isPending || uncompleteNoteMutation.isPending}
                                          className={`flex items-center gap-2 transition-all duration-200 ${
                                            isCompleted 
                                              ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                                              : 'border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600'
                                          }`}
                                        >
                                          {isCompleted ? (
                                            <>
                                              <CheckCircle className="w-4 h-4" />
                                              Concluído
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle2 className="w-4 h-4" />
                                              Marcar como concluído
                                            </>
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                    <p className="text-gray-600 mt-2 line-clamp-3">
                                      {note.content}
                                    </p>
                                    <div className="flex items-center justify-between mt-4">
                                      <div className="flex gap-2">
                                        {note.tags?.map((tag, index) => (
                                          <Badge key={index} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Para Professores/Admins */}
              {user && ['tutor', 'admin'].includes(user.role) && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">Gerenciar Curso</h2>
                  
                  <Tabs defaultValue="students" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="students" className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Estudantes
                      </TabsTrigger>
                      <TabsTrigger value="enroll" className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Matricular
                      </TabsTrigger>
                      <TabsTrigger value="grades" className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Notas
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Anotações
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Aba Estudantes Matriculados */}
                    <TabsContent value="students" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Estudantes Matriculados
                            </span>
                            <Badge variant="secondary">{enrolledStudents.length} total</Badge>
                          </CardTitle>
                          <CardDescription>
                            Visualize todos os estudantes matriculados e seus progressos
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {enrolledStudents.length === 0 ? (
                            <div className="text-center py-8">
                              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">Nenhum estudante matriculado ainda.</p>
                              <p className="text-sm text-gray-400">Use a aba "Matricular" para adicionar estudantes.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {enrolledStudents.map((enrollment) => (
                                <div key={enrollment.id} className="p-4 border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                          <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                          <p className="font-medium">
                                            {enrollment.user ? `${enrollment.user.firstName} ${enrollment.user.lastName}` : `Estudante #${enrollment.userId}`}
                                          </p>
                                          <p className="text-sm text-gray-500">
                                            {enrollment.user && `@${enrollment.user.username} • `}
                                            Matriculado em {new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}
                                          </p>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-3 grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-500">Progresso</p>
                                          <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                              <div 
                                                className="bg-blue-600 h-2 rounded-full" 
                                                style={{ width: `${enrollment.progress || 0}%` }}
                                              ></div>
                                            </div>
                                            <span className="text-sm font-medium">{enrollment.progress || 0}%</span>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-500">Nota</p>
                                          {enrollment.grade ? (
                                            <Badge variant={enrollment.grade >= 70 ? "default" : "destructive"}>
                                              {enrollment.grade}/100
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline">Não avaliado</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Botão de remover estudante */}
                                    <div className="ml-4">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (confirm(`Tem certeza que deseja remover ${enrollment.user ? `${enrollment.user.firstName} ${enrollment.user.lastName}` : `Estudante #${enrollment.userId}`} do curso?`)) {
                                            removeStudentMutation.mutate(enrollment.userId);
                                          }
                                        }}
                                        disabled={removeStudentMutation.isPending}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Aba Matricular Estudantes */}
                    <TabsContent value="enroll" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Matricular Novos Estudantes
                          </CardTitle>
                          <CardDescription>
                            Selecione estudantes com cadastro ativo para matricular no curso
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label htmlFor="student">Selecionar Estudante</Label>
                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha um estudante para matricular" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableStudents.map((student: any) => (
                                  <SelectItem key={student.id} value={student.id.toString()}>
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      {student.firstName} {student.lastName} ({student.username})
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button 
                            onClick={async () => {
                              if (selectedStudent) {
                                try {
                                  await apiRequest('POST', `/api/courses/${id}/enroll-student`, {
                                    studentId: parseInt(selectedStudent)
                                  });
                                  toast({
                                    title: 'Estudante matriculado!',
                                    description: 'Estudante foi matriculado com sucesso no curso.',
                                  });
                                  setSelectedStudent('');
                                  // Invalidar múltiplas queries para atualizar todas as listas
                                  queryClient.invalidateQueries({ queryKey: ['/api/courses', id, 'students'] });
                                  queryClient.invalidateQueries({ queryKey: ['/api/users/students'] });
                                  queryClient.invalidateQueries({ queryKey: ['/api/courses', id] });
                                } catch (error) {
                                  toast({
                                    title: 'Erro',
                                    description: 'Não foi possível matricular o estudante',
                                    variant: 'destructive',
                                  });
                                }
                              }
                            }}
                            disabled={!selectedStudent}
                            className="w-full"
                            size="lg"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Matricular Estudante
                          </Button>
                          
                          {availableStudents.length === 0 && (
                            <Alert>
                              <AlertDescription>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Não há estudantes disponíveis para matrícula no momento.
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Aba Dar Notas */}
                    <TabsContent value="grades" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5" />
                            Atribuir Notas aos Estudantes
                          </CardTitle>
                          <CardDescription>
                            Avalie o desempenho dos estudantes matriculados
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {enrolledStudents.length === 0 ? (
                            <div className="text-center py-8">
                              <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">Nenhum estudante matriculado para avaliar.</p>
                              <p className="text-sm text-gray-400">Matricule estudantes primeiro para poder avaliá-los.</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {enrolledStudents.map((enrollment) => (
                                <div key={enrollment.id} className="p-4 border rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-purple-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium">
                                          {enrollment.user ? `${enrollment.user.firstName} ${enrollment.user.lastName}` : `Estudante #${enrollment.userId}`}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1">
                                          <span className="text-sm text-gray-500">
                                            {enrollment.user && `@${enrollment.user.username} • `}
                                            Progresso: {enrollment.progress || 0}%
                                          </span>
                                          {enrollment.grade ? (
                                            <Badge variant={enrollment.grade >= 70 ? "default" : "destructive"}>
                                              Nota atual: {enrollment.grade}/100
                                            </Badge>
                                          ) : (
                                            <Badge variant="outline">Sem nota</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                          <GraduationCap className="w-4 h-4 mr-1" />
                                          {enrollment.grade ? 'Alterar Nota' : 'Dar Nota'}
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>
                                            {enrollment.grade ? 'Alterar Nota' : 'Atribuir Nota'}
                                          </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div>
                                            <Label htmlFor="grade">Nota (0-100)</Label>
                                            <Input
                                              id="grade"
                                              type="number"
                                              min="0"
                                              max="100"
                                              value={gradeValue}
                                              onChange={(e) => setGradeValue(e.target.value)}
                                              placeholder={enrollment.grade?.toString() || "Digite a nota"}
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                              Nota mínima para aprovação: 70
                                            </p>
                                          </div>
                                          <Button 
                                            onClick={async () => {
                                              const grade = parseInt(gradeValue);
                                              if (grade >= 0 && grade <= 100) {
                                                try {
                                                  await apiRequest('PUT', `/api/courses/${id}/students/${enrollment.userId}/grade`, {
                                                    grade: grade
                                                  });
                                                  toast({
                                                    title: 'Nota atribuída!',
                                                    description: `Nota ${grade} atribuída com sucesso ao estudante.`,
                                                  });
                                                  setGradeValue('');
                                                  // Invalidar múltiplas queries para atualizar todas as listas
                                                  queryClient.invalidateQueries({ queryKey: ['/api/courses', id, 'students'] });
                                                  queryClient.invalidateQueries({ queryKey: ['/api/courses', id] });
                                                  queryClient.invalidateQueries({ queryKey: ['/api/users/enrollments'] });
                                                } catch (error) {
                                                  toast({
                                                    title: 'Erro',
                                                    description: 'Não foi possível atribuir a nota',
                                                    variant: 'destructive',
                                                  });
                                                }
                                              }
                                            }}
                                            className="w-full"
                                            size="lg"
                                          >
                                            <GraduationCap className="w-4 h-4 mr-2" />
                                            Salvar Nota
                                          </Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Aba Anotações */}
                    <TabsContent value="notes" className="space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Anotações para Estudantes
                          </CardTitle>
                          <CardDescription>
                            Disponibilize anotações que os estudantes matriculados poderão visualizar
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                              <DialogTrigger asChild>
                                <Button className="w-full" size="lg">
                                  <Plus className="w-4 h-4 mr-2" />
                                  Criar Nova Anotação para Estudantes
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Nova Anotação do Curso</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="note-title">Título</Label>
                                    <Input
                                      id="note-title"
                                      value={noteTitle}
                                      onChange={(e) => setNoteTitle(e.target.value)}
                                      placeholder="Título da anotação"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="note-content">Conteúdo</Label>
                                    <Textarea
                                      id="note-content"
                                      value={noteContent}
                                      onChange={(e) => setNoteContent(e.target.value)}
                                      placeholder="Escreva o conteúdo da anotação..."
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="note-public"
                                      checked={noteIsPublic}
                                      onChange={(e) => setNoteIsPublic(e.target.checked)}
                                    />
                                    <Label htmlFor="note-public">Anotação pública (visível para todos os estudantes)</Label>
                                  </div>
                                  <Button 
                                    onClick={async () => {
                                      if (noteTitle && noteContent) {
                                        try {
                                          await apiRequest('POST', '/api/notes', {
                                            title: noteTitle,
                                            content: noteContent,
                                            isPublic: noteIsPublic,
                                            courseId: parseInt(id!),
                                            authorId: user!.id
                                          });
                                          toast({
                                            title: 'Anotação criada!',
                                            description: 'Nova anotação foi criada com sucesso.',
                                          });
                                          setNoteTitle('');
                                          setNoteContent('');
                                          setNoteIsPublic(true);
                                          setNoteDialogOpen(false);
                                          queryClient.invalidateQueries({ queryKey: ['/api/notes/course', id] });
                                        } catch (error) {
                                          toast({
                                            title: 'Erro',
                                            description: 'Não foi possível criar a anotação',
                                            variant: 'destructive',
                                          });
                                        }
                                      }
                                    }}
                                    className="w-full"
                                    size="lg"
                                    disabled={!noteTitle || !noteContent}
                                  >
                                    <FileText className="w-4 h-4 mr-2" />
                                    Criar Anotação
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>

                            {/* Modal de Edição de Anotação */}
                            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Editar Anotação</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-note-title">Título</Label>
                                    <Input
                                      id="edit-note-title"
                                      value={noteTitle}
                                      onChange={(e) => setNoteTitle(e.target.value)}
                                      placeholder="Título da anotação"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-note-content">Conteúdo</Label>
                                    <Textarea
                                      id="edit-note-content"
                                      value={noteContent}
                                      onChange={(e) => setNoteContent(e.target.value)}
                                      placeholder="Escreva o conteúdo da anotação..."
                                      rows={4}
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="edit-note-public"
                                      checked={noteIsPublic}
                                      onChange={(e) => setNoteIsPublic(e.target.checked)}
                                    />
                                    <Label htmlFor="edit-note-public">Anotação pública (visível para todos os estudantes)</Label>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => {
                                        setEditDialogOpen(false);
                                        setEditingNote(null);
                                        setNoteTitle('');
                                        setNoteContent('');
                                        setNoteIsPublic(true);
                                      }}
                                      variant="outline"
                                      className="flex-1"
                                    >
                                      Cancelar
                                    </Button>
                                    <Button 
                                      onClick={() => {
                                        if (editingNote && noteTitle && noteContent) {
                                          updateNoteMutation.mutate({
                                            noteId: editingNote.id,
                                            data: {
                                              title: noteTitle,
                                              content: noteContent,
                                              isPublic: noteIsPublic
                                            }
                                          });
                                        }
                                      }}
                                      className="flex-1"
                                      disabled={!noteTitle || !noteContent || updateNoteMutation.isPending}
                                    >
                                      {updateNoteMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            {courseNotes.length === 0 ? (
                              <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhuma anotação criada ainda.</p>
                                <p className="text-sm text-gray-400">Crie anotações para compartilhar com seus estudantes.</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {courseNotes.map((note) => (
                                  <div key={note.id} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-lg">{note.title}</h4>
                                        <p className="text-gray-600 mt-2 line-clamp-2">
                                          {note.content}
                                        </p>
                                        <div className="flex items-center justify-between mt-4">
                                          <div className="flex gap-2">
                                            {note.tags?.map((tag, index) => (
                                              <Badge key={index} variant="outline" className="text-xs">
                                                {tag}
                                              </Badge>
                                            ))}
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{note.isPublic ? 'Público' : 'Privado'}</span>
                                            <span>•</span>
                                            <span>{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 ml-4">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button size="sm" variant="outline">
                                              <MoreVertical className="w-4 h-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent>
                                            <DropdownMenuItem
                                              onClick={() => {
                                                setEditingNote(note);
                                                setNoteTitle(note.title);
                                                setNoteContent(note.content);
                                                setNoteIsPublic(note.isPublic ?? true);
                                                setEditDialogOpen(true);
                                              }}
                                            >
                                              <Edit className="w-4 h-4 mr-2" />
                                              Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => {
                                                if (confirm(`Tem certeza que deseja excluir a anotação "${note.title}"?`)) {
                                                  deleteNoteMutation.mutate(note.id);
                                                }
                                              }}
                                              className="text-red-600"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Excluir
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Edição de Curso */}
      <Dialog open={editCourseDialogOpen} onOpenChange={setEditCourseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={editCourseData.title}
                  onChange={(e) => setEditCourseData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do curso"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Categoria *</Label>
                <Select
                  value={editCourseData.category}
                  onValueChange={(value) => setEditCourseData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programacao">Programação</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="negocios">Negócios</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="idiomas">Idiomas</SelectItem>
                    <SelectItem value="ciencias">Ciências</SelectItem>
                    <SelectItem value="arte">Arte</SelectItem>
                    <SelectItem value="musica">Música</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Descrição *</Label>
              <Textarea
                id="edit-description"
                value={editCourseData.description}
                onChange={(e) => setEditCourseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição do curso"
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-content">Conteúdo Detalhado</Label>
              <Textarea
                id="edit-content"
                value={editCourseData.content}
                onChange={(e) => setEditCourseData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Descrição detalhada do conteúdo do curso"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="edit-tags"
                value={editCourseData.tags}
                onChange={(e) => setEditCourseData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="javascript, react, frontend"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-author">Professor Responsável</Label>
              <Select
                value={editCourseData.authorId ? editCourseData.authorId.toString() : ''}
                onValueChange={(value) => setEditCourseData(prev => ({ ...prev, authorId: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o professor responsável" />
                </SelectTrigger>
                <SelectContent>
                  {availableTutors.map((tutor) => (
                    <SelectItem key={tutor.id} value={tutor.id.toString()}>
                      {tutor.firstName ? `${tutor.firstName} ${tutor.lastName}` : tutor.username} ({tutor.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={editCourseMutation.isPending} className="flex-1">
                {editCourseMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditCourseDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

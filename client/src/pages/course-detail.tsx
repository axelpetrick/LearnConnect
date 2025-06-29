import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Book, User, Calendar, Users, Play, CheckCircle } from 'lucide-react';
import { Course } from '@shared/schema';

export default function CourseDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: course, isLoading, error } = useQuery<Course>({
    queryKey: ['/api/courses', id],
    enabled: !!id,
  });

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
        <Header title="Detalhes do Curso" onMenuClick={() => setSidebarOpen(true)} />
        
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
                    <span>Instrutor</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Criado em {new Date(course.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>0 alunos matriculados</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-0 sm:ml-6">
                {canEnroll && !isAuthor && (
                  <Button
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {enrollMutation.isPending ? 'Matriculando...' : 'Matricular-se'}
                  </Button>
                )}
                {isAuthor && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Você é o autor deste curso</span>
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
                  <CardContent>
                    {course.content ? (
                      <div className="prose prose-gray max-w-none">
                        {course.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">
                        Conteúdo detalhado do curso não disponível.
                      </p>
                    )}
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
                    <CardTitle>Informações do Curso</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                      <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                        {course.isPublished ? 'Publicado' : 'Rascunho'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Categoria</h4>
                      <p className="text-gray-600">{course.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Data de Criação</h4>
                      <p className="text-gray-600">
                        {new Date(course.createdAt).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Última Atualização</h4>
                      <p className="text-gray-600">
                        {new Date(course.updatedAt).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {canEnroll && !isAuthor && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Começar Agora</CardTitle>
                      <CardDescription>
                        Matricule-se para ter acesso completo ao curso
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => enrollMutation.mutate()}
                        disabled={enrollMutation.isPending}
                        className="w-full"
                        size="lg"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {enrollMutation.isPending ? 'Matriculando...' : 'Iniciar Curso'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

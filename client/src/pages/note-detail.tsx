import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { FileText, User, Calendar, Eye, Lock } from 'lucide-react';
import { Note } from '@shared/schema';

export default function NoteDetail() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();

  const { data: note, isLoading, error } = useQuery<Note>({
    queryKey: ['/api/notes', id],
    enabled: !!id,
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

  if (error || !note) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64">
          <Header title="Erro" onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-8">
            <Alert variant="destructive">
              <AlertDescription>
                Anotação não encontrada ou erro ao carregar.
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  const isAuthor = user?.id === note.authorId;
  const canView = note.isPublic || isAuthor || user?.role === 'admin';

  if (!canView) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64">
          <Header title="Acesso Negado" onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-8">
            <Card>
              <CardContent className="p-12 text-center">
                <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Anotação Privada
                </h3>
                <p className="text-gray-500">
                  Esta anotação é privada e você não tem permissão para visualizá-la.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <Header title="Anotação" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Note Header */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
                  <div className="flex items-center">
                    {note.isPublic ? (
                      <Eye className="w-5 h-5 text-green-500" title="Anotação pública" />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" title="Anotação privada" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 space-x-6">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>Autor da anotação</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Criada em {new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Atualizada em {new Date(note.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo da Anotação</CardTitle>
                    {user?.role === 'student' && (
                      <CardDescription>
                        Esta é uma anotação colaborativa compartilhada pelos tutores. 
                        Você pode visualizar o conteúdo, mas não pode editá-lo.
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray max-w-none">
                      {note.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Visibilidade</h4>
                      <Badge variant={note.isPublic ? 'default' : 'secondary'}>
                        {note.isPublic ? 'Pública' : 'Privada'}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Data de Criação</h4>
                      <p className="text-gray-600">
                        {new Date(note.createdAt).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Última Atualização</h4>
                      <p className="text-gray-600">
                        {new Date(note.updatedAt).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {note.courseId && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Curso Relacionado</h4>
                        <p className="text-gray-600">Curso #{note.courseId}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Access Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Acesso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {user?.role === 'student' ? (
                        <div className="flex items-start space-x-2">
                          <Eye className="w-4 h-4 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">Visualização</p>
                            <p className="text-blue-700">
                              Você pode visualizar esta anotação, mas não pode editá-la.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start space-x-2">
                          <FileText className="w-4 h-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900">Edição</p>
                            <p className="text-green-700">
                              Você pode visualizar e editar esta anotação.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

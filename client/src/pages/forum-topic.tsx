import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CommentThread } from '@/components/forum/comment-thread';
import { useAuth } from '@/hooks/use-auth';
import { MessageSquare, User, Calendar, Eye, Pin, Edit, Trash2 } from 'lucide-react';
import { ForumTopic, ForumComment } from '@shared/schema';

export default function ForumTopicPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();

  const { data: topic, isLoading: topicLoading, error: topicError } = useQuery<ForumTopic>({
    queryKey: [`/api/forum/topics/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/forum/topics/${id}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      return response.json();
    },
    enabled: !!id,
  });

  const { data: comments = [], isLoading: commentsLoading } = useQuery<ForumComment[]>({
    queryKey: ['/api/forum/topics', id, 'comments'],
    queryFn: async () => {
      const response = await fetch(`/api/forum/topics/${id}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      return response.json();
    },
    enabled: !!id,
  });

  if (topicLoading) {
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

  if (topicError || !topic) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64">
          <Header title="Erro" onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-8">
            <Alert variant="destructive">
              <AlertDescription>
                Tópico não encontrado ou erro ao carregar.
              </AlertDescription>
            </Alert>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <Header title="Discussão" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Topic Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {topic.isPinned && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                          <Pin className="w-3 h-3" />
                          Fixado
                        </Badge>
                      )}
                      <CardTitle className="text-2xl">{topic.title}</CardTitle>
                      
                      {/* Edit/Delete buttons for topic author or admin */}
                      {user && (user.id === topic.authorId || user.role === 'admin') && (
                        <div className="flex items-center space-x-2 ml-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Excluir</span>
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-6 mb-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>Autor da discussão</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Criado em {new Date(topic.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{topic.views || 0} visualizações</span>
                      </div>
                    </div>

                    {topic.tags && topic.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {topic.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none">
                  {topic.content && topic.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            {commentsLoading ? (
              <Card>
                <CardContent className="p-8">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <CommentThread topicId={parseInt(id!)} comments={comments} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

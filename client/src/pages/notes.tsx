import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Search, FileText, User, Calendar, Eye } from 'lucide-react';
import { Note, InsertNote } from '@shared/schema';

export default function Notes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    isPublic: true,
  });

  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
  });

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: InsertNote) => {
      const response = await apiRequest('POST', '/api/notes', noteData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Sucesso!',
        description: 'Anotação criada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      setShowCreateDialog(false);
      setFormData({
        title: '',
        content: '',
        tags: '',
        isPublic: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar anotação.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const noteData: InsertNote = {
      title: formData.title,
      content: formData.content,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
      authorId: user?.id || 1,
      courseId: null,
      isPublic: formData.isPublic,
    };

    createNoteMutation.mutate(noteData);
  };

  const canCreateNote = user?.role === 'tutor' || user?.role === 'admin';

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64">
          <Header title="Anotações" onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <Header title="Anotações" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Anotações</h1>
              <p className="text-gray-600">
                {user?.role === 'student' 
                  ? 'Visualize as anotações compartilhadas pelos tutores'
                  : 'Gerencie suas anotações colaborativas'
                }
              </p>
            </div>
            {canCreateNote && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="mt-4 sm:mt-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Anotação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Anotação</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateNote} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Digite o título da anotação"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">Conteúdo *</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Digite o conteúdo da anotação"
                        rows={6}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="Digite as tags separadas por vírgula"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                      />
                      <Label htmlFor="isPublic">Anotação pública</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createNoteMutation.isPending}>
                        {createNoteMutation.isPending ? 'Criando...' : 'Criar Anotação'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar anotações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação disponível'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? 'Tente ajustar sua busca ou limpar os filtros.' 
                    : canCreateNote 
                      ? 'Crie sua primeira anotação colaborativa.'
                      : 'Aguarde os tutores compartilharem anotações.'
                  }
                </p>

              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <Card 
                  key={note.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/notes/${note.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{note.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {note.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center ml-2">
                        {note.isPublic ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        <span>Autor</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{new Date(note.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {note.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

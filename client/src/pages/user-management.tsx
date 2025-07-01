import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { UserPlus, UserCog, Edit, Trash2, MoreVertical, Eye, EyeOff, KeyRound } from 'lucide-react';
import { User } from '@shared/schema';

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });
  
  const [editUser, setEditUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar todos os usuários
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: !!(user && user.role === 'admin'),
  });

  // Mutation para criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      return apiRequest('POST', '/api/users', userData);
    },
    onSuccess: () => {
      toast({
        title: 'Usuário criado!',
        description: 'Usuário foi criado com sucesso.',
      });
      setCreateUserOpen(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'student'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar usuário',
        description: error.response?.data?.message || 'Não foi possível criar o usuário.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...userData }: { id: number } & typeof editUser) => {
      return apiRequest('PUT', `/api/users/${id}`, userData);
    },
    onSuccess: () => {
      toast({
        title: 'Usuário atualizado!',
        description: 'Usuário foi atualizado com sucesso.',
      });
      setEditUserOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar usuário',
        description: error.response?.data?.message || 'Não foi possível atualizar o usuário.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para deletar usuário
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Usuário removido!',
        description: 'Usuário foi removido com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao remover usuário',
        description: error.response?.data?.message || 'Não foi possível remover o usuário.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !editUser.username || !editUser.email || !editUser.firstName || !editUser.lastName) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }
    updateUserMutation.mutate({ id: selectedUser.id, ...editUser });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });
    setEditUserOpen(true);
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Tem certeza que deseja resetar a senha de ${user.firstName} ${user.lastName}?`)) {
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/auth/reset-password', { email: user.email });
      const data = await response.json();
      
      if (data.newPassword) {
        toast({
          title: 'Senha resetada!',
          description: `Nova senha para ${user.firstName}: ${data.newPassword}`,
        });
      } else {
        toast({
          title: 'Senha resetada!',
          description: data.message || 'Uma nova senha foi enviada por email.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao resetar senha',
        description: error.response?.data?.message || 'Não foi possível resetar a senha.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500';
      case 'tutor': return 'bg-primary';
      case 'student': return 'bg-secondary';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'tutor': return 'Tutor';
      case 'student': return 'Aluno';
      default: return role;
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertDescription>
            Acesso negado. Apenas administradores podem acessar esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title="Gerenciamento de Usuários" onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:pl-72 pt-16">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                <p className="text-gray-600">Gerencie todos os usuários da plataforma</p>
              </div>
              
              <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          value={newUser.firstName}
                          onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          value={newUser.lastName}
                          onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={newUser.password}
                          onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="role">Tipo de Usuário</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Aluno</SelectItem>
                          <SelectItem value="tutor">Tutor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" disabled={createUserMutation.isPending} className="flex-1">
                        {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setCreateUserOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Cadastrados</CardTitle>
                  <CardDescription>
                    Total de {users.length} usuários na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Nome</th>
                          <th className="text-left p-2">Username</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-left p-2">Cadastrado em</th>
                          <th className="text-left p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div>
                                <div className="font-medium">{user.firstName} {user.lastName}</div>
                              </div>
                            </td>
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">
                              <Badge className={getRoleBadgeColor(user.role)}>
                                {getRoleLabel(user.role)}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleResetPassword(user)}
                                    className="text-orange-600"
                                  >
                                    <KeyRound className="w-4 h-4 mr-2" />
                                    Resetar Senha
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      if (confirm('Tem certeza que deseja remover este usuário?')) {
                                        deleteUserMutation.mutate(user.id);
                                      }
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remover
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Dialog de Edição */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">Nome</Label>
                <Input
                  id="editFirstName"
                  value={editUser.firstName}
                  onChange={(e) => setEditUser(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Sobrenome</Label>
                <Input
                  id="editLastName"
                  value={editUser.lastName}
                  onChange={(e) => setEditUser(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="editUsername">Username</Label>
              <Input
                id="editUsername"
                value={editUser.username}
                onChange={(e) => setEditUser(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editRole">Tipo de Usuário</Label>
              <Select value={editUser.role} onValueChange={(value) => setEditUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Aluno</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" disabled={updateUserMutation.isPending} className="flex-1">
                {updateUserMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditUserOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
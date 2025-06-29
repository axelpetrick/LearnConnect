import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { BarChart3, TrendingUp, Users, BookOpen, MessageSquare, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { UserStats } from '@/lib/types';

// Mock data for charts
const progressData = [
  { name: 'Jan', cursos: 12, alunos: 8, notas: 15 },
  { name: 'Fev', cursos: 19, alunos: 12, notas: 22 },
  { name: 'Mar', cursos: 8, alunos: 15, notas: 18 },
  { name: 'Abr', cursos: 15, alunos: 18, notas: 25 },
  { name: 'Mai', cursos: 25, alunos: 20, notas: 30 },
  { name: 'Jun', cursos: 22, alunos: 24, notas: 28 },
];

const categoryData = [
  { name: 'Programação', value: 35, color: '#2563EB' },
  { name: 'Design', value: 25, color: '#10B981' },
  { name: 'Marketing', value: 20, color: '#F59E0B' },
  { name: 'Negócios', value: 20, color: '#8B5CF6' },
];

const engagementData = [
  { name: 'Segunda', posts: 12, visualizacoes: 245, comentarios: 18 },
  { name: 'Terça', posts: 15, visualizacoes: 312, comentarios: 25 },
  { name: 'Quarta', posts: 8, visualizacoes: 198, comentarios: 12 },
  { name: 'Quinta', posts: 22, visualizacoes: 456, comentarios: 34 },
  { name: 'Sexta', posts: 18, visualizacoes: 378, comentarios: 28 },
  { name: 'Sábado', posts: 6, visualizacoes: 123, comentarios: 8 },
  { name: 'Domingo', posts: 4, visualizacoes: 89, comentarios: 5 },
];

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('30days');
  const { user } = useAuth();

  const { data: userStats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  const statsCards = [
    {
      title: 'Total de Cursos',
      value: '47',
      change: '+12% este mês',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Usuários Ativos',
      value: '1,234',
      change: '+8% esta semana',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Posts no Fórum',
      value: '856',
      change: '+23% este mês',
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Taxa de Conclusão',
      value: '78%',
      change: '+5% este mês',
      icon: Award,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64">
        <Header title="Relatórios" onMenuClick={() => setSidebarOpen(true)} />
        
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios e Analytics</h1>
                <p className="text-gray-600">
                  Acompanhe o desempenho e engajamento da plataforma
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="30days">Últimos 30 dias</SelectItem>
                    <SelectItem value="90days">Últimos 90 dias</SelectItem>
                    <SelectItem value="1year">Último ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                          <Icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-green-600 font-medium">{stat.change}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Progress Over Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução da Plataforma</CardTitle>
                  <CardDescription>
                    Acompanhamento mensal de cursos, alunos e anotações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="cursos" 
                          stroke="hsl(217, 89%, 56%)" 
                          strokeWidth={2}
                          name="Cursos"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="alunos" 
                          stroke="hsl(156, 68%, 39%)" 
                          strokeWidth={2}
                          name="Novos Alunos"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="notas" 
                          stroke="hsl(36, 95%, 48%)" 
                          strokeWidth={2}
                          name="Anotações"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Course Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                  <CardDescription>
                    Porcentagem de cursos por categoria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Forum Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle>Engajamento no Fórum</CardTitle>
                  <CardDescription>
                    Atividade semanal no fórum por dia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="posts" fill="hsl(217, 89%, 56%)" name="Posts" />
                        <Bar dataKey="comentarios" fill="hsl(156, 68%, 39%)" name="Comentários" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Suas Estatísticas Pessoais</CardTitle>
                  <CardDescription>
                    Resumo das suas atividades na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-primary">{userStats?.coursesEnrolled || 0}</p>
                          <p className="text-sm text-gray-600">Cursos Matriculados</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-secondary">{userStats?.coursesCompleted || 0}</p>
                          <p className="text-sm text-gray-600">Cursos Concluídos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-accent">{userStats?.notesCreated || 0}</p>
                          <p className="text-sm text-gray-600">Anotações Criadas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-purple-600">{userStats?.forumPosts || 0}</p>
                          <p className="text-sm text-gray-600">Posts no Fórum</p>
                        </div>
                      </div>

                      {userStats && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Taxa de Conclusão</span>
                            <span className="font-medium">
                              {userStats.coursesEnrolled > 0 
                                ? Math.round((userStats.coursesCompleted / userStats.coursesEnrolled) * 100)
                                : 0
                              }%
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${userStats.coursesEnrolled > 0 
                                  ? (userStats.coursesCompleted / userStats.coursesEnrolled) * 100
                                  : 0
                                }%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crescimento Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">+24%</p>
                    <p className="text-sm text-gray-600">Novos usuários este mês</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Engajamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">89%</p>
                    <p className="text-sm text-gray-600">Taxa de retenção semanal</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Satisfação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">4.8</p>
                    <p className="text-sm text-gray-600">Avaliação média dos cursos</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

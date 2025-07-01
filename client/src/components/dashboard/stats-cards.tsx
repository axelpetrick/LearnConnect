import { Card, CardContent } from '@/components/ui/card';
import { Book, Users, FileText, MessageSquare } from 'lucide-react';
import { UserStats } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

interface StatsCardsProps {
  stats: UserStats;
  isLoading?: boolean;
}

interface AdminStats {
  totalCourses: number;
  totalStudentsEnrolled: number;
  totalNotesCreated: number;
  totalForumPosts: number;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const { user } = useAuth();
  
  // Buscar estatísticas administrativas apenas para admins
  const { data: adminStats, isLoading: adminStatsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: !!(user && user.role === 'admin'),
  });

  // Se é admin, usa estatísticas administrativas; senão, não mostra nada
  if (user?.role !== 'admin') {
    return null;
  }

  const statsToUse = adminStats || {
    totalCourses: 0,
    totalStudentsEnrolled: 0,
    totalNotesCreated: 0,
    totalForumPosts: 0,
  };

  const cards = [
    {
      title: 'Cursos Ativos',
      value: statsToUse.totalCourses,
      change: '+2 esta semana',
      icon: Book,
      color: 'bg-blue-100 text-primary',
    },
    {
      title: 'Alunos Matriculados',
      value: statsToUse.totalStudentsEnrolled,
      change: '+15 este mês',
      icon: Users,
      color: 'bg-green-100 text-secondary',
    },
    {
      title: 'Anotações Criadas',
      value: statsToUse.totalNotesCreated,
      change: '+7 hoje',
      icon: FileText,
      color: 'bg-yellow-100 text-accent',
    },
    {
      title: 'Posts no Fórum',
      value: statsToUse.totalForumPosts,
      change: '+12 esta semana',
      icon: MessageSquare,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  if (isLoading || adminStatsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-secondary font-medium">{card.change}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

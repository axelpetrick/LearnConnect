import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentActivity {
  id: number;
  noteId: number;
  userId: number;
  completedAt: string;
  noteTitle: string;
  courseId: number;
  courseTitle: string;
  studentName: string;
  studentLastName: string;
}

export function RecentActivity() {
  const { user } = useAuth();
  
  // Buscar atividade recente apenas para tutores/admins
  const { data: activities, isLoading } = useQuery<RecentActivity[]>({
    queryKey: ['/api/users/recent-activity'],
    enabled: !!(user && (user.role === 'tutor' || user.role === 'admin')),
  });

  // Se não é tutor/admin, não mostra o componente
  if (!user || (user.role !== 'tutor' && user.role !== 'admin')) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Nenhuma atividade recente de alunos nos seus cursos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-sm">
                  <span className="font-medium">Atividade:</span>{' '}
                  <span className="text-primary">{activity.noteTitle}</span>{' '}
                  foi concluída
                </p>
                <p className="text-sm">
                  <span className="font-medium">Por:</span>{' '}
                  <span className="text-secondary-foreground">
                    {activity.studentName} {activity.studentLastName}
                  </span>{' '}
                  - {formatDistanceToNow(new Date(activity.completedAt), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Curso: {activity.courseTitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
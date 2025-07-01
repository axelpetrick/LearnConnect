import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

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

interface RecentActivityResponse {
  activities: RecentActivity[];
  total: number;
}

export function RecentActivity() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  
  // Buscar cursos para o filtro
  const { data: courses } = useQuery({
    queryKey: ['/api/courses/filter'],
    enabled: !!(user && (user.role === 'tutor' || user.role === 'admin')),
  });

  // Buscar atividade recente apenas para tutores/admins
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/users/recent-activity', selectedCourse],
    queryFn: async () => {
      if (selectedCourse === 'all') {
        const res = await apiRequest('GET', '/api/users/recent-activity');
        return res.json();
      } else {
        const res = await apiRequest('GET', `/api/recent-activity/course/${selectedCourse}`);
        return res.json();
      }
    },
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </div>
          {courses && courses.length > 0 && (
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedCourse === 'all' ? 'Todos os cursos' : courses.find(c => c.id.toString() === selectedCourse)?.title || 'Curso'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma atividade recente {selectedCourse !== 'all' ? 'neste curso' : 'nos seus cursos'}.
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any, index: number) => (
              <div key={activity.id || index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  {activity.type === 'enrollment' ? (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">Nova matrícula:</span>{' '}
                        <span className="text-secondary-foreground">
                          {activity.studentName}
                        </span>{' '}
                        se matriculou
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Curso: {activity.courseName}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">Atividade concluída:</span>{' '}
                        <span className="text-primary">{activity.noteTitle}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Por:</span>{' '}
                        <span className="text-secondary-foreground">
                          {activity.studentName}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Curso: {activity.courseName}
                      </p>
                    </>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.createdAt), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
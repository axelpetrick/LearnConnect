import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Users, FileText, MessageSquare } from 'lucide-react';
import { Activity } from '@/lib/types';

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'course_created',
    message: 'Novo curso "React Avançado" foi criado',
    user: 'Maria Santos',
    timestamp: 'há 2 horas',
    icon: 'book',
  },
  {
    id: '2',
    type: 'user_enrolled',
    message: '15 novos alunos se matricularam hoje',
    user: 'Sistema',
    timestamp: 'há 4 horas',
    icon: 'users',
  },
  {
    id: '3',
    type: 'note_updated',
    message: 'Anotação colaborativa "JavaScript ES6" foi atualizada',
    user: 'Carlos Lima',
    timestamp: 'há 6 horas',
    icon: 'edit',
  },
  {
    id: '4',
    type: 'forum_post',
    message: 'Nova discussão no fórum: "Melhores práticas em Node.js"',
    user: 'Ana Paula',
    timestamp: 'há 1 dia',
    icon: 'message-circle',
  },
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'book': return Book;
    case 'users': return Users;
    case 'edit': return FileText;
    case 'message-circle': return MessageSquare;
    default: return Book;
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'course_created': return 'bg-blue-100 text-primary';
    case 'user_enrolled': return 'bg-green-100 text-secondary';
    case 'note_updated': return 'bg-yellow-100 text-accent';
    case 'forum_post': return 'bg-purple-100 text-purple-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export function ActivityTimeline() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Atividade Recente</CardTitle>
          <Button variant="link" className="text-primary hover:text-blue-700">
            Ver tudo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mockActivities.map((activity) => {
            const Icon = getIcon(activity.icon);
            return (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(activity.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{activity.message}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    por {activity.user} • {activity.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

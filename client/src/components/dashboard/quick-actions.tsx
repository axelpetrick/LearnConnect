import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Plus, FileText, MessageSquare } from 'lucide-react';

export function QuickActions() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const canCreate = user?.role === 'tutor' || user?.role === 'admin';

  const actions = [
    {
      title: 'Criar Curso',
      description: 'Adicionar novo curso à plataforma',
      icon: Plus,
      color: 'bg-primary',
      onClick: () => setLocation('/courses/new'),
      visible: canCreate,
    },
    {
      title: 'Nova Anotação',
      description: 'Criar anotação colaborativa',
      icon: FileText,
      color: 'bg-secondary',
      onClick: () => setLocation('/notes/new'),
      visible: canCreate,
    },
    {
      title: 'Iniciar Discussão',
      description: 'Criar tópico no fórum',
      icon: MessageSquare,
      color: 'bg-accent',
      onClick: () => setLocation('/forum/new'),
      visible: true,
    },
  ];

  const visibleActions = actions.filter(action => action.visible);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start p-3 h-auto hover:border-primary hover:shadow-sm"
                onClick={action.onClick}
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

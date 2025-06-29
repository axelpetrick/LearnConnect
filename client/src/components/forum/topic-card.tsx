import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { User, Calendar, Eye, MessageCircle, Pin } from 'lucide-react';
import { ForumTopic } from '@shared/schema';

interface TopicCardProps {
  topic: ForumTopic;
  commentCount?: number;
}

export function TopicCard({ topic, commentCount = 0 }: TopicCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/forum/topics/${topic.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {topic.isPinned && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  Fixado
                </Badge>
              )}
              <CardTitle className="text-xl">{topic.title}</CardTitle>
            </div>
            <CardDescription className="line-clamp-3 text-base">
              {topic.content.replace(/<[^>]*>/g, '').substring(0, 200)}
              {topic.content.length > 200 && '...'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>Autor</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(topic.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{topic.views || 0} visualizações</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              <span>{commentCount} respostas</span>
            </div>
          </div>
        </div>
        {topic.tags && topic.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {topic.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

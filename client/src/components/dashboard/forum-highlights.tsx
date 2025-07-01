import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

interface PopularDiscussion {
  id: number;
  title: string;
  content: string;
  authorName: string;
  commentCount: number;
  likes: number;
  dislikes: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  createdAt: string;
}

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'border-green-500';
    case 'negative':
      return 'border-red-500';
    case 'neutral':
    default:
      return 'border-blue-500';
  }
};

const getSentimentBadge = (sentiment: string, likes: number, dislikes: number) => {
  switch (sentiment) {
    case 'positive':
      return <Badge className="bg-green-100 text-green-700">+{likes} likes</Badge>;
    case 'negative':
      return <Badge className="bg-red-100 text-red-700">-{dislikes} dislikes</Badge>;
    case 'neutral':
    default:
      return <Badge className="bg-blue-100 text-blue-700">neutro</Badge>;
  }
};

export function ForumHighlights() {
  const { data: discussions, isLoading } = useQuery<PopularDiscussion[]>({
    queryKey: ['/api/forum/popular-discussions'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discussões Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
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
        <div className="flex items-center justify-between">
          <CardTitle>Discussões Populares</CardTitle>
          <Link href="/forum">
            <Button variant="link" className="text-primary hover:text-blue-700">
              Ver fórum
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {discussions && discussions.length > 0 ? (
            discussions.map((discussion) => (
              <div key={discussion.id} className={`border-l-4 ${getSentimentColor(discussion.sentiment)} pl-4`}>
                <h4 className="font-medium text-gray-900 mb-1">{discussion.title}</h4>
                <p className="text-sm text-gray-500 mb-2">
                  por {discussion.authorName} • {discussion.commentCount} comentários
                </p>
                <div className="flex items-center space-x-2">
                  {getSentimentBadge(discussion.sentiment, discussion.likes, discussion.dislikes)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">Nenhuma discussão encontrada.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const popularTopics = [
  {
    id: 1,
    title: 'Como otimizar performance em React?',
    author: 'Pedro Silva',
    replies: 23,
    tags: ['React', 'Performance'],
    borderColor: 'border-primary',
  },
  {
    id: 2,
    title: 'Dúvidas sobre TypeScript interfaces',
    author: 'Lucia Rocha',
    replies: 15,
    tags: ['TypeScript'],
    borderColor: 'border-secondary',
  },
  {
    id: 3,
    title: 'Melhores práticas de clean code',
    author: 'Rafael Costa',
    replies: 31,
    tags: ['Clean Code', 'Boas Práticas'],
    borderColor: 'border-accent',
  },
];

const getTagColor = (tag: string) => {
  switch (tag) {
    case 'React':
    case 'Performance':
      return 'bg-blue-100 text-primary';
    case 'TypeScript':
      return 'bg-green-100 text-secondary';
    case 'Clean Code':
    case 'Boas Práticas':
      return 'bg-yellow-100 text-accent';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export function ForumHighlights() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Discussões Populares</CardTitle>
          <Button variant="link" className="text-primary hover:text-blue-700">
            Ver fórum
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {popularTopics.map((topic) => (
            <div key={topic.id} className={`border-l-4 ${topic.borderColor} pl-4`}>
              <h4 className="font-medium text-gray-900 mb-1">{topic.title}</h4>
              <p className="text-sm text-gray-500 mb-2">
                por {topic.author} • {topic.replies} respostas
              </p>
              <div className="flex items-center space-x-2">
                {topic.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

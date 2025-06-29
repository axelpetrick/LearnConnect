import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Database } from 'lucide-react';

const recommendedCourses = [
  {
    id: 1,
    title: 'Vue.js Fundamentos',
    description: 'Baseado no seu interesse em frameworks JavaScript',
    rating: 4.8,
    students: 120,
    icon: Code,
    color: 'from-primary to-blue-600',
  },
  {
    id: 2,  
    title: 'Python para Análise de Dados',
    description: 'Recomendado para tutores de tecnologia',
    rating: 4.9,
    students: 89,
    icon: Database,
    color: 'from-secondary to-green-600',
  },
];

export function RecommendedCourses() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Cursos Recomendados</CardTitle>
          <Button variant="link" className="text-primary hover:text-blue-700">
            Ver mais
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendedCourses.map((course) => {
            const Icon = course.icon;
            return (
              <div 
                key={course.id}
                className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${course.color} rounded-lg flex-shrink-0 flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-500 mb-2">{course.description}</p>
                  <div className="flex items-center text-xs text-gray-400">
                    <span>{course.rating} ⭐ • {course.students} alunos</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { Book, User, Calendar, Users } from 'lucide-react';
import { Course } from '@shared/schema';

interface CourseCardProps {
  course: Course;
  showEnrollButton?: boolean;
  onEnroll?: (courseId: number) => void;
  isEnrolling?: boolean;
}

export function CourseCard({ course, showEnrollButton = false, onEnroll, isEnrolling = false }: CourseCardProps) {
  const [, setLocation] = useLocation();

  const handleCardClick = () => {
    setLocation(`/courses/${course.id}`);
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll?.(course.id);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
      <div onClick={handleCardClick} className="flex-1">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2 line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-3">
                {course.description}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="ml-2 shrink-0">
              {course.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex items-center text-sm text-gray-500 space-x-4 mb-3">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>Tutor</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{new Date(course.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>0 alunos</span>
            </div>
          </div>
          
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {course.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {course.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{course.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {showEnrollButton && (
            <div className="mt-auto pt-4">
              <Button
                onClick={handleEnrollClick}
                disabled={isEnrolling}
                className="w-full"
              >
                {isEnrolling ? 'Matriculando...' : 'Matricular-se'}
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}

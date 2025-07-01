import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { apiRequest } from '@/lib/queryClient';

interface Course {
  id: number;
  title: string;
  authorId: number;
}

interface StudentPerformance {
  studentName: string;
  grade: number;
  progress: number;
  status: 'Cursando' | 'Aprovado' | 'Reprovado';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ProgressChart() {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');

  // Só mostrar para tutores e admins
  if (!user || user.role === 'student') {
    return null;
  }

  // Buscar cursos disponíveis baseado no papel do usuário
  const { data: courses, isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    queryFn: async (): Promise<Course[]> => {
      const res = await apiRequest('GET', '/api/courses');
      const allCourses = await res.json();
      
      // Se for professor, filtrar apenas seus cursos
      if (user.role === 'tutor') {
        return allCourses.filter((course: Course) => course.authorId === user.id);
      }
      
      // Admin vê todos os cursos
      return allCourses;
    },
    enabled: !!(user && (user.role === 'tutor' || user.role === 'admin')),
  });

  // Buscar performance dos estudantes filtrada por curso
  const { data: studentPerformance, isLoading: loadingStudents } = useQuery<StudentPerformance[]>({
    queryKey: ['/api/students/performance-data', selectedCourseId],
    queryFn: async (): Promise<StudentPerformance[]> => {
      const url = selectedCourseId === 'all' 
        ? '/api/students/performance-data' 
        : `/api/students/performance-data?courseId=${selectedCourseId}`;
      const res = await apiRequest('GET', url);
      return res.json();
    },
    enabled: !!(user && (user.role === 'tutor' || user.role === 'admin')),
  });

  if (loadingCourses || loadingStudents) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Progresso dos Cursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-500">Carregando dados...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statusData = studentPerformance?.reduce((acc, student) => {
    const existing = acc.find(item => item.status === student.status);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ status: student.status, count: 1 });
    }
    return acc;
  }, [] as { status: string; count: number }[]) || [];

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progresso dos Cursos</CardTitle>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Selecione um curso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cursos</SelectItem>
              {courses?.map((course) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="performance">Performance dos Alunos</TabsTrigger>
            <TabsTrigger value="status">Status dos Alunos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="performance" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={studentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="studentName" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="grade" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Nota"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Progresso (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

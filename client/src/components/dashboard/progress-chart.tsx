import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { apiRequest } from '@/lib/queryClient';

interface CourseProgressData {
  courseName: string;
  totalStudents: number;
  completedNotes: number;
  averageGrade: number;
  progressPercentage: number;
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

  // Buscar dados de progresso dos cursos
  const { data: courseProgress, isLoading: loadingProgress } = useQuery<CourseProgressData[]>({
    queryKey: ['/api/courses/progress-data'],
    queryFn: async (): Promise<CourseProgressData[]> => {
      const res = await apiRequest('GET', '/api/courses/progress-data');
      return res.json();
    },
    enabled: !!(user && (user.role === 'tutor' || user.role === 'admin')),
  });

  // Buscar performance dos estudantes
  const { data: studentPerformance, isLoading: loadingStudents } = useQuery<StudentPerformance[]>({
    queryKey: ['/api/students/performance-data'],
    queryFn: async (): Promise<StudentPerformance[]> => {
      const res = await apiRequest('GET', '/api/students/performance-data');
      return res.json();
    },
    enabled: !!(user && (user.role === 'tutor' || user.role === 'admin')),
  });

  if (loadingProgress || loadingStudents) {
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
        <CardTitle>Progresso dos Cursos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="status">Status dos Alunos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="courseName" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalStudents" fill="#3b82f6" name="Total de Alunos" />
                  <Bar dataKey="completedNotes" fill="#10b981" name="Atividades Concluídas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
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

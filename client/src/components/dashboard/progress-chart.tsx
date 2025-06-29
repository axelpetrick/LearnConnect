import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', cursos: 12, alunos: 8 },
  { name: 'Fev', cursos: 19, alunos: 12 },
  { name: 'Mar', cursos: 8, alunos: 15 },
  { name: 'Abr', cursos: 15, alunos: 18 },
  { name: 'Mai', cursos: 25, alunos: 20 },
  { name: 'Jun', cursos: 22, alunos: 24 },
];

export function ProgressChart() {
  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Progresso dos Cursos</CardTitle>
          <Select defaultValue="30days">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="thisMonth">Este mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cursos" 
                stroke="hsl(217, 89%, 56%)" 
                strokeWidth={2}
                name="Cursos Concluídos"
              />
              <Line 
                type="monotone" 
                dataKey="alunos" 
                stroke="hsl(156, 68%, 39%)" 
                strokeWidth={2}
                name="Novos Alunos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

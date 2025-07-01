import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { ActivityTimeline } from '@/components/dashboard/activity-timeline';
import { ProgressChart } from '@/components/dashboard/progress-chart';
import { RecommendedCourses } from '@/components/dashboard/recommended-courses';
import { ForumHighlights } from '@/components/dashboard/forum-highlights';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { useAuth } from '@/hooks/use-auth';
import { UserStats } from '@/lib/types';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/users/stats'],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <main className="flex-1 lg:ml-64">
        <Header 
          title="Dashboard" 
          onMenuClick={() => setSidebarOpen(true)} 
        />
        
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo de volta, {user?.firstName}!
            </h2>
            <p className="text-gray-600">
              Aqui está um resumo das suas atividades recentes na plataforma.
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats!} isLoading={isLoading} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <RecentActivity />
              <ProgressChart />
            </div>

            {/* Right Column - Sidebar Content */}
            <div className="space-y-8">
              <RecommendedCourses />
              <ForumHighlights />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

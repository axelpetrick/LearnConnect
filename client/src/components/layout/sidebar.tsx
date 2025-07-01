import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Book,
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  UserCog,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Cursos', href: '/courses', icon: Book },
    { name: 'Fórum', href: '/forum', icon: MessageSquare },
    ...(user?.role === 'admin' ? [
      { name: 'Gerenciar Usuários', href: '/users', icon: UserCog },
    ] : []),
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500';
      case 'tutor': return 'bg-primary';
      case 'student': return 'bg-secondary';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'tutor': return 'Tutor';
      case 'student': return 'Aluno';
      default: return role;
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EduCollab</h1>
              <p className="text-sm text-gray-500">Aprendizado Colaborativo</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-secondary rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge className={`text-xs ${getRoleBadgeColor(user?.role || '')}`}>
                {getRoleLabel(user?.role || '')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div 
                      className={`nav-item flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        isActive 
                          ? 'active text-primary bg-blue-50 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={onClose}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <ul className="space-y-2">
              <li>
                <Link href="/profile">
                  <div className="nav-item flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                    <Settings className="w-5 h-5" />
                    <span>Configurações</span>
                  </div>
                </Link>
              </li>
              <li>
                <Button 
                  variant="ghost" 
                  className="w-full nav-item flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors justify-start"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sair</span>
                </Button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}

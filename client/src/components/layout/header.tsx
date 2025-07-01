import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Menu, LogOut, User } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={onMenuClick}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-900">
              {title}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            {user && (
              <div className="flex items-center space-x-2">
                <div className="hidden md:flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                    <p className="text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

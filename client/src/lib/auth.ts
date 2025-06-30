import { AuthUser } from './types';

const TOKEN_KEY = 'educollab_token';
const USER_KEY = 'educollab_user';

export const auth = {
  getUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getUser();
  },

  hasRole(roles: string[]): boolean {
    const user = this.getUser();
    return user ? roles.includes(user.role) : false;
  },

  canEditCourse(): boolean {
    return this.hasRole(['tutor', 'admin']);
  },

  canEditNote(): boolean {
    return this.hasRole(['tutor', 'admin']);
  },

  isAdmin(): boolean {
    return this.hasRole(['admin']);
  }
};

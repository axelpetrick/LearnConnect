import { AuthUser } from './types';

const TOKEN_KEY = 'educollab_token';
const USER_KEY = 'educollab_user';

export const auth = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getUser(): AuthUser | null {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser(user: AuthUser): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
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

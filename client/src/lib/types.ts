export interface AuthUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'tutor' | 'admin';
  avatar?: string;
  createdAt: Date;
}

export interface UserStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  notesCreated: number;
  forumPosts: number;
}

export interface Activity {
  id: string;
  type: 'course_created' | 'user_enrolled' | 'note_updated' | 'forum_post';
  message: string;
  user: string;
  timestamp: string;
  icon: 'book' | 'users' | 'edit' | 'message-circle';
}

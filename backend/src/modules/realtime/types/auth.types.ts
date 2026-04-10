export interface AuthContext {
  type: 'jwt';
  userId: string;
  email?: string;
  roles?: string[];
  permissions?: string[];
}

export interface NotificationPayload {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

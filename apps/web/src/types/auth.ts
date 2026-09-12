export type UserRole = 'field_officer' | 'district_admin' | 'mdoner_admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  message?: string;
  data?: {
    token: string;
    user: UserProfile;
  };
}

import { api } from './client';
import type { User } from '@/types';

export interface AuthResponse {
  user: User;
  token: string;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  role: 'proprietario' | 'interessado';
}): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', payload);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function me(): Promise<User> {
  const { data } = await api.get<{ data: User }>('/auth/me');
  return data.data;
}
import { api } from './client';
import type { Paginated } from '@/types';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  url: string;
  read: boolean;
  created_at: string;
}

export async function listNotifications(): Promise<Paginated<AppNotification>> {
  const { data } = await api.get<{
    data: AppNotification[];
    meta: Paginated<AppNotification>['meta'];
  }>('/notifications');
  return { data: data.data, meta: data.meta };
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>('/notifications/unread-count');
  return data.count;
}

export async function markRead(id: string): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

export async function markAllRead(): Promise<void> {
  await api.post('/notifications/read-all');
}
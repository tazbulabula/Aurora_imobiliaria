import { api } from './client';
import type { Interest, Paginated } from '@/types';

export async function listMyInterests(): Promise<Paginated<Interest>> {
  const { data } = await api.get<{ data: Interest[]; meta: Paginated<Interest>['meta'] }>(
    '/my/interests'
  );
  return { data: data.data, meta: data.meta };
}

export async function getInterest(publicId: string): Promise<Interest> {
  const { data } = await api.get<{ data: Interest }>(`/interests/${publicId}`);
  return data.data;
}

export async function cancelInterest(publicId: string): Promise<void> {
  await api.post(`/interests/${publicId}/cancel`);
}
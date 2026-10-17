import { api } from './client';
import type { Message, Paginated } from '@/types';

export async function listMessages(interestPublicId: string): Promise<Message[]> {
  const { data } = await api.get<{ data: Message[] }>(
    `/interests/${interestPublicId}/messages`
  );
  return data.data;
}

export async function sendMessage(interestPublicId: string, content: string): Promise<Message> {
  const { data } = await api.post<{ data: Message }>(
    `/interests/${interestPublicId}/messages`,
    { content }
  );
  return data.data;
}
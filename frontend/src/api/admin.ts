import { api } from './client';
import type {
  Interest,
  InterestStatus,
  Paginated,
  Property,
  Transaction,
} from '@/types';

export interface AdminStats {
  properties: { pendentes: number; aprovados: number; rejeitados: number };
  interests: {
    novos: number;
    em_mediacao: number;
    negociacao: number;
    fechados: number;
    cancelados: number;
  };
  transactions: {
    pendentes: number;
    pagas: number;
    concluidas: number;
    comissao_total: number;
  };
  users: { total: number; proprietarios: number; interessados: number };
}

export async function getAdminStats(): Promise<AdminStats> {
  const { data } = await api.get<AdminStats>('/admin/stats');
  return data;
}

export async function listPendingProperties(): Promise<Paginated<Property>> {
  const { data } = await api.get<{ data: Property[]; meta: Paginated<Property>['meta'] }>(
    '/admin/properties/pending'
  );
  return { data: data.data, meta: data.meta };
}

export async function approveProperty(publicId: string): Promise<Property> {
  const { data } = await api.post<{ data: Property }>(
    `/admin/properties/${publicId}/approve`
  );
  return data.data;
}

export async function rejectProperty(
  publicId: string,
  rejectionReason: string
): Promise<Property> {
  const { data } = await api.post<{ data: Property }>(
    `/admin/properties/${publicId}/reject`,
    { rejection_reason: rejectionReason }
  );
  return data.data;
}

export async function listAdminInterests(status?: InterestStatus): Promise<Paginated<Interest>> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const { data } = await api.get<{ data: Interest[]; meta: Paginated<Interest>['meta'] }>(
    `/admin/interests?${params.toString()}`
  );
  return { data: data.data, meta: data.meta };
}

export async function updateInterestStatus(
  publicId: string,
  status: string
): Promise<Interest> {
  const { data } = await api.patch<{ data: Interest }>(
    `/admin/interests/${publicId}/status`,
    { status }
  );
  return data.data;
}

export async function createTransaction(
  interestPublicId: string,
  payload: { amount: number; commission_percentage: number }
): Promise<Transaction> {
  const { data } = await api.post<{ data: Transaction }>(
    `/admin/interests/${interestPublicId}/transactions`,
    payload
  );
  return data.data;
}

export async function confirmPayment(
  transactionPublicId: string,
  paymentReference: string
): Promise<Transaction> {
  const { data } = await api.post<{ data: Transaction }>(
    `/admin/transactions/${transactionPublicId}/confirm-payment`,
    { payment_reference: paymentReference }
  );
  return data.data;
}

export async function confirmTransfer(
  transactionPublicId: string,
  transferReference: string
): Promise<Transaction> {
  const { data } = await api.post<{ data: Transaction }>(
    `/admin/transactions/${transactionPublicId}/confirm-transfer`,
    { transfer_reference: transferReference }
  );
  return data.data;
}

export interface AdminChat {
  interest_public_id: string;
  status: InterestStatus;
  property: { public_id: string; title: string };
  interested: { public_id: string; name: string };
  owner: { public_id: string; name: string };
  messages_count: number;
  last_message: { content: string; created_at: string } | null;
}

export async function listAdminChats(): Promise<Paginated<AdminChat>> {
  const { data } = await api.get<{ data: AdminChat[]; meta: Paginated<AdminChat>['meta'] }>(
    '/admin/chats'
  );
  return { data: data.data, meta: data.meta };
}

export async function listAllProperties(filters: {
  status?: string;
  type?: string;
  search?: string;
} = {}): Promise<Paginated<Property>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.append(k, v);
  });
  const { data } = await api.get<{ data: Property[]; meta: Paginated<Property>['meta'] }>(
    `/admin/properties?${params.toString()}`
  );
  return { data: data.data, meta: data.meta };
}

export async function listAllUsers(filters: {
  role?: string;
  verification_status?: string;
  search?: string;
} = {}): Promise<Paginated<import('@/types').User>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.append(k, v);
  });
  const { data } = await api.get<{
    data: import('@/types').User[];
    meta: Paginated<import('@/types').User>['meta'];
  }>(`/admin/users?${params.toString()}`);
  return { data: data.data, meta: data.meta };
}

export async function updateUser(
  publicId: string,
  payload: { role?: string; verification_status?: string }
): Promise<import('@/types').User> {
  const { data } = await api.patch<{ data: import('@/types').User }>(
    `/admin/users/${publicId}`,
    payload
  );
  return data.data;
}
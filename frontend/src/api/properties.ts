import { api } from './client';
import type { Paginated, Property } from '@/types';

export interface PropertyFilters {
  type?: 'venda' | 'arrendamento';
  province?: string;
  municipality?: string;
  min_price?: number;
  max_price?: number;
  bedrooms?: number;
  page?: number;
}

export async function listProperties(filters: PropertyFilters = {}): Promise<Paginated<Property>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });

  const { data } = await api.get<{ data: Property[]; meta: Paginated<Property>['meta'] }>(
    `/properties?${params.toString()}`
  );

  return { data: data.data, meta: data.meta };
}

export async function getProperty(publicId: string): Promise<Property> {
  const { data } = await api.get<{ data: Property }>(`/properties/${publicId}`);
  return data.data;
}

// ... (manter o que já tens: listProperties, getProperty)

export interface StorePropertyPayload {
  title: string;
  description: string;
  type: 'venda' | 'arrendamento';
  price: number;
  province: string;
  municipality: string;
  neighborhood: string;
  bedrooms: number;
  bathrooms: number;
  area_m2?: number | null;
  media: { type: 'foto' | 'video'; url: string; order: number }[];
  documents: { type: 'escritura' | 'bi' | 'comprovativo'; url: string }[];
}

export async function createProperty(payload: StorePropertyPayload): Promise<Property> {
  const { data } = await api.post<{ data: Property }>('/properties', payload);
  return data.data;
}

export async function listMyProperties(): Promise<Paginated<Property>> {
  const { data } = await api.get<{ data: Property[]; meta: Paginated<Property>['meta'] }>(
    '/my/properties'
  );
  return { data: data.data, meta: data.meta };
}

export async function updateProperty(
  publicId: string,
  payload: Partial<StorePropertyPayload>
): Promise<Property> {
  const { data } = await api.patch<{ data: Property }>(`/properties/${publicId}`, payload);
  return data.data;
}

export async function deleteProperty(publicId: string): Promise<void> {
  await api.delete(`/properties/${publicId}`);
}
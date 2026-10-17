import { api } from './client';

export interface UploadResult {
  url: string;
  path: string;
  type: string;
  size: number;
}

export async function uploadFile(
  file: File,
  category: 'imagem' | 'video' | 'documento'
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  const { data } = await api.post<UploadResult>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}
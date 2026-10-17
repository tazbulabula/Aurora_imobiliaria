import { useState } from 'react';
import { uploadFile } from '@/api/uploads';

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  preview?: string;
}

interface Props {
  label: string;
  category: 'imagem' | 'video' | 'documento';
  accept: string;
  multiple?: boolean;
  maxFiles?: number;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
}

export function FileUploader({
  label,
  category,
  accept,
  multiple = false,
  maxFiles = 10,
  files,
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;

    if (!multiple && selected.length > 1) {
      setError('Só podes enviar um ficheiro de cada vez.');
      return;
    }

    if (files.length + selected.length > maxFiles) {
      setError(`Máximo de ${maxFiles} ficheiros.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploaded: UploadedFile[] = [];
      for (const file of selected) {
        const result = await uploadFile(file, category);
        uploaded.push({
          url: result.url,
          name: file.name,
          size: file.size,
          preview: category === 'imagem' ? result.url : undefined,
        });
      }
      onChange([...files, ...uploaded]);
    } catch {
      setError('Erro ao enviar ficheiro. Tenta novamente.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary-400 transition">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading || files.length >= maxFiles}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-800 hover:file:bg-primary-100 file:cursor-pointer"
        />
        {uploading && <p className="text-xs text-primary-700 mt-2">A enviar...</p>}
      </div>

      {error && <p className="text-danger text-xs mt-2">{error}</p>}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt=""
                  className="w-10 h-10 object-cover rounded-md"
                />
              ) : (
                <div className="w-10 h-10 bg-primary-50 rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-700"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-danger text-sm hover:underline"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
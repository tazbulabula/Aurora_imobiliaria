import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createProperty } from '@/api/properties';
import { Button } from '@/components/ui/Button';
import { FileUploader, type UploadedFile } from '@/components/FileUploader';
import { useToast } from '../ToastContext';

const schema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres').max(255),
  description: z.string().min(20, 'Mínimo 20 caracteres').max(5000),
  type: z.enum(['venda', 'arrendamento']),
  price: z.coerce.number().int().positive('Preço obrigatório'),
  province: z.string().min(1, 'Seleciona a província'),
  municipality: z.string().min(2, 'Município obrigatório'),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().int().min(0).max(50),
  area_m2: z.coerce.number().int().positive().optional(),
});

type FormData = z.infer<typeof schema>;

const provinces = [
  'Luanda', 'Benguela', 'Huíla', 'Huambo',
  'Cabinda', 'Namibe', 'Uíge', 'Malanje',
];

const documentTypes = [
  { value: 'escritura', label: 'Escritura / Título de propriedade' },
  { value: 'bi', label: 'Bilhete de identidade do proprietário' },
  { value: 'comprovativo', label: 'Comprovativo de residência' },
] as const;

export function PublishProperty() {
    const { showToast } = useToast();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [videos, setVideos] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<Record<string, UploadedFile[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'venda', bedrooms: 1, bathrooms: 1 },
  });

  const type = watch('type');

  const mutation = useMutation({
    mutationFn: createProperty,
    onSuccess: (property) => {
        showToast('Imóvel publicado. Fica pendente até verificação.', 'success');
        navigate(`/owner?published=${property.public_id}`);
    },
    onError: () => showToast('Erro ao publicar imóvel.', 'error'),
    });

  function onSubmit(data: FormData) {
    setSubmitError(null);

    if (photos.length === 0) {
      setSubmitError('Adiciona pelo menos 1 foto.');
      return;
    }

    const allDocuments = Object.entries(documents).flatMap(([type, files]) =>
      files.map((f) => ({ type: type as 'escritura' | 'bi' | 'comprovativo', url: f.url }))
    );

    if (allDocuments.length === 0) {
      setSubmitError('Adiciona pelo menos 1 documento.');
      return;
    }

    mutation.mutate({
      ...data,
      area_m2: data.area_m2 ?? null,
      media: [
        ...photos.map((f, i) => ({ type: 'foto' as const, url: f.url, order: i })),
        ...videos.map((f, i) => ({ type: 'video' as const, url: f.url, order: photos.length + i })),
      ],
      documents: allDocuments,
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publicar imóvel</h1>
        <p className="text-sm text-gray-500 mt-1">
          O teu imóvel fica pendente até a equipa verificar os documentos. Só depois fica visível ao público.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Secção 1 — Info básica */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Informação básica</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Título</label>
            <input
              {...register('title')}
              placeholder="Ex: Casa T3 no Kilamba com quintal"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.title && <p className="text-danger text-xs mt-1.5">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="Descreve o imóvel: estado, características, proximidade, etc."
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.description && (
              <p className="text-danger text-xs mt-1.5">{errors.description.message}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
              <select
                {...register('type')}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-surface"
              >
                <option value="venda">Venda</option>
                <option value="arrendamento">Arrendamento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Preço (Kz{type === 'arrendamento' ? '/mês' : ''})
              </label>
              <input
                type="number"
                {...register('price')}
                placeholder="25000000"
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.price && <p className="text-danger text-xs mt-1.5">{errors.price.message}</p>}
            </div>
          </div>
        </section>

        {/* Secção 2 — Localização */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Localização</h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Província</label>
              <select
                {...register('province')}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-surface"
              >
                <option value="">Selecionar</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.province && (
                <p className="text-danger text-xs mt-1.5">{errors.province.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Município</label>
              <input
                {...register('municipality')}
                placeholder="Ex: Belas"
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              {errors.municipality && (
                <p className="text-danger text-xs mt-1.5">{errors.municipality.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Bairro</label>
              <input
                {...register('neighborhood')}
                placeholder="Ex: Kilamba"
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              {errors.neighborhood && (
                <p className="text-danger text-xs mt-1.5">{errors.neighborhood.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Secção 3 — Detalhes */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Detalhes</h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quartos</label>
              <input
                type="number"
                {...register('bedrooms')}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              {errors.bedrooms && (
                <p className="text-danger text-xs mt-1.5">{errors.bedrooms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Casas de banho
              </label>
              <input
                type="number"
                {...register('bathrooms')}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              {errors.bathrooms && (
                <p className="text-danger text-xs mt-1.5">{errors.bathrooms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Área (m²) <span className="text-gray-400">— opcional</span>
              </label>
              <input
                type="number"
                {...register('area_m2')}
                className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>

        {/* Secção 4 — Fotos e vídeos */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Fotos e vídeos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Mínimo 1 foto. As fotos são o que mais atrai interessados.
            </p>
          </div>

          <FileUploader
            label="Fotos (JPG, PNG, WEBP — até 20)"
            category="imagem"
            accept="image/jpeg,image/png,image/webp"
            multiple
            maxFiles={20}
            files={photos}
            onChange={setPhotos}
          />

          <FileUploader
            label="Vídeos (MP4, MOV — até 3)"
            category="video"
            accept="video/mp4,video/quicktime"
            multiple
            maxFiles={3}
            files={videos}
            onChange={setVideos}
          />
        </section>

        {/* Secção 5 — Documentos */}
        <section className="bg-surface rounded-xl border border-border p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
            <p className="text-sm text-gray-500 mt-1">
              Necessários para verificar que o imóvel é teu. Não são mostrados ao público.
            </p>
          </div>

          {documentTypes.map((doc) => (
            <FileUploader
              key={doc.value}
              label={doc.label}
              category="documento"
              accept="application/pdf,image/jpeg,image/png"
              files={documents[doc.value] ?? []}
              onChange={(files) =>
                setDocuments((prev) => ({ ...prev, [doc.value]: files }))
              }
            />
          ))}
        </section>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-danger text-sm px-4 py-3 rounded-lg">
            {submitError}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/owner')}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="flex-1">
            {mutation.isPending ? 'A publicar...' : 'Publicar imóvel'}
          </Button>
        </div>
      </form>
    </div>
  );
}
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMyProperties, deleteProperty } from '@/api/properties';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/EmptyState';
import type { Property } from '@/types';

const formatKz = (value: number) =>
  new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(value) + ' Kz';

export function MyProperties() {
  const [searchParams] = useSearchParams();
  const publishedId = searchParams.get('published');
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<Property | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-properties'],
    queryFn: listMyProperties,
  });

  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => deleteProperty(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-properties'] });
      setConfirmDelete(null);
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {publishedId && (
        <div className="bg-green-50 border border-green-200 text-success text-sm px-4 py-3 rounded-lg mb-6">
          Imóvel publicado com sucesso. Fica pendente até a equipa verificar os documentos.
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus imóveis</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `${data.meta.total} imóve${data.meta.total === 1 ? 'l' : 'is'}` : 'A carregar...'}
          </p>
        </div>
        <Link to="/owner/publish">
          <Button>+ Publicar imóvel</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="Ainda não tens imóveis publicados"
          description="Publica o teu primeiro imóvel. A nossa equipa verifica e fica visível ao público em até 48h."
          action={
            <Link to="/owner/publish">
              <Button>Publicar primeiro imóvel</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((property) => (
            <div
              key={property.public_id}
              className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition"
            >
              <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {property.media?.[0]?.url ? (
                  <img
                    src={property.media[0].url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Sem foto
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                  <Badge status={property.status}>
                    {property.status === 'pendente' && 'Pendente'}
                    {property.status === 'aprovado' && 'Aprovado'}
                    {property.status === 'rejeitado' && 'Rejeitado'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {property.neighborhood}, {property.municipality}
                </p>
                <p className="text-sm font-semibold text-primary-900 mt-1">
                  {formatKz(property.price)}
                  {property.type === 'arrendamento' && (
                    <span className="text-xs font-normal text-gray-500">/mês</span>
                  )}
                </p>

                {property.status === 'rejeitado' && property.rejection_reason && (
                  <div className="mt-2 text-xs text-danger bg-red-50 px-2.5 py-1.5 rounded">
                    <strong>Motivo:</strong> {property.rejection_reason}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {property.status === 'aprovado' && (
                  <Link to={`/properties/${property.public_id}`}>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </Link>
                )}
                {property.status !== 'aprovado' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(property)}
                    className="text-danger"
                  >
                    Eliminar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmação */}
      {confirmDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-surface rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Eliminar imóvel?</h3>
            <p className="text-sm text-gray-600 mt-2">
              Vais eliminar <strong>{confirmDelete.title}</strong>. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => deleteMutation.mutate(confirmDelete.public_id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'A eliminar...' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
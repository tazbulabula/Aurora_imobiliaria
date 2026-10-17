import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPendingProperties, approveProperty, rejectProperty } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import type { Property } from '@/types';
import { useToast } from '../ToastContext';


const formatKz = (value: number) =>
  new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(value) + ' Kz';

export function PendingProperties() {
    const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<Property | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-properties'],
    queryFn: listPendingProperties,
  });

  const approveMutation = useMutation({
    mutationFn: approveProperty,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-pending-properties'] });
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        showToast('Imóvel aprovado.', 'success');
    },
    onError: () => showToast('Erro ao aprovar imóvel.', 'error'),
    });

    const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
        rejectProperty(id, reason),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-pending-properties'] });
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        setRejecting(null);
        setRejectReason('');
        showToast('Imóvel rejeitado.', 'success');
    },
    onError: () => showToast('Erro ao rejeitar imóvel.', 'error'),
    });

  function handleConfirmReject() {
    if (!rejecting || rejectReason.trim().length < 5) return;
    rejectMutation.mutate({ id: rejecting.public_id, reason: rejectReason.trim() });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Imóveis pendentes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Verifica a documentação e aprova ou rejeita. O proprietário é notificado.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="Sem imóveis pendentes"
          description="Não há imóveis a aguardar verificação neste momento."
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((property) => (
            <div key={property.public_id} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex gap-4">
                <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
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
                  <h3 className="font-semibold text-gray-900">{property.title}</h3>
                  <p className="text-sm text-gray-500">
                    {property.neighborhood}, {property.municipality}, {property.province}
                  </p>
                  <p className="text-sm font-semibold text-primary-900 mt-1">
                    {formatKz(property.price)}
                    {property.type === 'arrendamento' && (
                      <span className="text-xs font-normal text-gray-500">/mês</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {property.bedrooms} quartos · {property.bathrooms} WC ·{' '}
                    {property.area_m2 ?? '—'} m²
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Proprietário: {property.owner?.name} ({property.owner?.phone})
                  </p>

                  {property.documents && property.documents.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {property.documents.map((doc, i) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-2.5 py-1 bg-primary-50 text-primary-800 rounded-md hover:bg-primary-100"
                        >
                          {doc.type === 'escritura' && '📄 Escritura'}
                          {doc.type === 'bi' && '🪪 BI'}
                          {doc.type === 'comprovativo' && '📋 Comprovativo'}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <Link to={`/properties/${property.public_id}`}>
                    <Button variant="ghost" size="sm">Ver detalhes</Button>
                  </Link>
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(property.public_id)}
                    disabled={approveMutation.isPending}
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setRejecting(property)}
                  >
                    Rejeitar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejecting && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setRejecting(null)}
        >
          <div
            className="bg-surface rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Rejeitar imóvel</h3>
            <p className="text-sm text-gray-600 mt-1">
              Explica o motivo da rejeição. O proprietário vai ver esta mensagem.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Ex: Documentação incompleta. Falta o comprovativo de residência."
              className="w-full mt-4 px-3.5 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
            {rejectReason.trim().length > 0 && rejectReason.trim().length < 5 && (
              <p className="text-danger text-xs mt-1">Motivo muito curto.</p>
            )}
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={() => setRejecting(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleConfirmReject}
                disabled={rejectReason.trim().length < 5 || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'A rejeitar...' : 'Confirmar rejeição'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
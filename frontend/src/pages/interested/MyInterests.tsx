import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listMyInterests } from '@/api/interests';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import type { InterestStatus } from '@/types';

const statusLabels: Record<InterestStatus, string> = {
  novo: 'Aguarda mediação',
  em_mediacao: 'Em mediação',
  visita_agendada: 'Visita agendada',
  negociacao: 'Em negociação',
  fechado: 'Concluído',
  cancelado: 'Cancelado',
};

const statusToBadge = (status: InterestStatus) => {
  if (status === 'fechado') return 'concluido';
  if (status === 'cancelado') return 'cancelado';
  if (status === 'novo') return 'pendente';
  return 'aprovado';
};

const formatKz = (value: number) =>
  new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(value) + ' Kz';

export function MyInterests() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-interests'],
    queryFn: listMyInterests,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus interesses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Acompanha o estado de cada processo. Toda a comunicação é feita pelo chat interno.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="Ainda não mostraste interesse em nenhum imóvel"
          description="Explora os imóveis disponíveis e clica em 'Tenho interesse' para iniciares um processo."
          action={
            <Link to="/properties">
              <Button>Ver imóveis</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.data.map((interest) => (
            <Link
              key={interest.public_id}
              to={`/my/interests/${interest.public_id}`}
              className="block bg-surface border border-border rounded-xl p-4 hover:shadow-sm hover:border-primary-200 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-24 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {interest.property?.media?.[0]?.url ? (
                    <img
                      src={interest.property.media[0].url}
                      alt={interest.property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      Sem foto
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {interest.property?.title ?? 'Imóvel'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {interest.property?.neighborhood}, {interest.property?.municipality}
                  </p>
                  {interest.property?.price && (
                    <p className="text-sm font-medium text-primary-900 mt-1">
                      {formatKz(interest.property.price)}
                    </p>
                  )}
                </div>

                <Badge status={statusToBadge(interest.status)}>
                  {statusLabels[interest.status]}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
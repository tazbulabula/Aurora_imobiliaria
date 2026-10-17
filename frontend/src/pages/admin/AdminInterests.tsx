import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listAdminInterests } from '@/api/admin';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/EmptyState';
import type { InterestStatus } from '@/types';

const statusLabels: Record<InterestStatus, string> = {
  novo: 'Novo',
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

const filters: { value: InterestStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'novo', label: 'Novos' },
  { value: 'em_mediacao', label: 'Em mediação' },
  { value: 'visita_agendada', label: 'Visitas' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'fechado', label: 'Fechados' },
  { value: 'cancelado', label: 'Cancelados' },
];

export function AdminInterests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = (searchParams.get('status') as InterestStatus | null) ?? undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-interests', activeStatus],
    queryFn: () => listAdminInterests(activeStatus),
  });

  function setFilter(status: string) {
    const next = new URLSearchParams();
    if (status) next.set('status', status);
    setSearchParams(next);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interesses</h1>
        <p className="text-sm text-gray-500 mt-1">
          Todos os processos de mediação. Clica para gerir o chat e a transação.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              (activeStatus ?? '') === f.value
                ? 'bg-primary-800 text-white'
                : 'bg-white border border-border text-gray-700 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Sem interesses neste estado" />
      ) : (
        <div className="space-y-2">
          {data.data.map((interest) => (
            <Link
              key={interest.public_id}
              to={`/admin/interests/${interest.public_id}`}
              className="block bg-surface border border-border rounded-xl p-4 hover:shadow-sm hover:border-primary-200 transition"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {interest.property?.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {interest.property?.neighborhood}, {interest.property?.municipality}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Interessado: {interest.interested?.name}
                    {interest.interested?.phone && ` · ${interest.interested.phone}`}
                  </p>
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
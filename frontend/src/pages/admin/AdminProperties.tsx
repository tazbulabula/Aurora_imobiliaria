import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listAllProperties } from '@/api/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import type { PropertyStatus } from '@/types';

const statusLabels: Record<PropertyStatus, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
};

const statusFilters: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'aprovado', label: 'Aprovados' },
  { value: 'rejeitado', label: 'Rejeitados' },
];

const formatKz = (v: number) =>
  new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(v) + ' Kz';

export function AdminProperties() {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-properties', statusFilter, typeFilter, search],
    queryFn: () =>
      listAllProperties({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined,
      }),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Imóveis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Todos os imóveis da plataforma.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              statusFilter === f.value
                ? 'bg-primary-800 text-white'
                : 'bg-white border border-border text-gray-700 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3.5 py-1.5 rounded-full text-sm border border-border bg-white"
        >
          <option value="">Todos os tipos</option>
          <option value="venda">Venda</option>
          <option value="arrendamento">Arrendamento</option>
        </select>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Procurar por título, província, município, bairro..."
        className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm mb-4 focus:ring-2 focus:ring-primary-500"
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Sem imóveis" />
      ) : (
        <div className="space-y-2">
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
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    Sem foto
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {property.title}
                  </h3>
                  <Badge status={property.status}>
                    {statusLabels[property.status]}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {property.type === 'venda' ? 'Venda' : 'Arrendamento'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {property.neighborhood}, {property.municipality}, {property.province}
                </p>
                <p className="text-sm font-semibold text-primary-900 mt-1">
                  {formatKz(property.price)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Proprietário: {property.owner?.name}
                </p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <Link to={`/properties/${property.public_id}`}>
                  <Button variant="ghost" size="sm">Ver público</Button>
                </Link>
                {property.status === 'pendente' && (
                  <Link to="/admin/properties/pending">
                    <Button size="sm">Ir para fila</Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
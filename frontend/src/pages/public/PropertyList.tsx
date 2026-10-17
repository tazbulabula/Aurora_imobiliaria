import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listProperties, type PropertyFilters } from '@/api/properties';
import { PropertyCard } from '@/components/PropertyCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/Button';

const provinces = [
  'Luanda', 'Benguela', 'Huíla', 'Huambo',
  'Cabinda', 'Namibe', 'Uíge', 'Malanje',
];

export function PropertyList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const filters: PropertyFilters = {
    type: (searchParams.get('type') as PropertyFilters['type']) || undefined,
    province: searchParams.get('province') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () => listProperties(filters),
  });

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }

  function clearFilters() {
    setSearchParams({});
  }

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const hasActiveFilters =
    filters.type || filters.province || filters.min_price || filters.max_price || filters.bedrooms;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Imóveis</h1>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `${data.meta.total} resultado${data.meta.total === 1 ? '' : 's'}` : 'A carregar...'}
          </p>
        </div>

        <Button variant="ghost" onClick={() => setShowFilters((v) => !v)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filtros
        </Button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-surface border border-border rounded-xl p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo</label>
            <select
              value={filters.type ?? ''}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="">Todos</option>
              <option value="venda">Venda</option>
              <option value="arrendamento">Arrendamento</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Província</label>
            <select
              value={filters.province ?? ''}
              onChange={(e) => updateFilter('province', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="">Todas</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Quartos (mín.)</label>
            <select
              value={filters.bedrooms ?? ''}
              onChange={(e) => updateFilter('bedrooms', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            >
              <option value="">Qualquer</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Preço mín. (Kz)</label>
            <input
              type="number"
              value={filters.min_price ?? ''}
              onChange={(e) => updateFilter('min_price', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Preço máx. (Kz)</label>
            <input
              type="number"
              value={filters.max_price ?? ''}
              onChange={(e) => updateFilter('max_price', e.target.value)}
              placeholder="Sem limite"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-2 lg:col-span-5 pt-2 border-t border-border">
              <button
                onClick={clearFilters}
                className="text-sm text-danger hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Resultados */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="Nenhum imóvel encontrado"
          description="Tenta ajustar os filtros ou limpar a pesquisa."
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((property) => (
              <PropertyCard key={property.public_id} property={property} />
            ))}
          </div>

          {/* Paginação */}
          {data.meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="ghost"
                disabled={data.meta.current_page === 1}
                onClick={() => goToPage(data.meta.current_page - 1)}
              >
                ← Anterior
              </Button>
              <span className="text-sm text-gray-600 px-4">
                Página {data.meta.current_page} de {data.meta.last_page}
              </span>
              <Button
                variant="ghost"
                disabled={data.meta.current_page === data.meta.last_page}
                onClick={() => goToPage(data.meta.current_page + 1)}
              >
                Próxima →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
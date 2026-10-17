import { Link } from 'react-router-dom';
import type { Property } from '@/types';

const formatKz = (value: number) =>
  new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(value) + ' Kz';

export function PropertyCard({ property }: { property: Property }) {
  const cover = property.media?.[0]?.url;

  return (
    <Link
      to={`/properties/${property.public_id}`}
      className="group block bg-surface rounded-xl border border-border overflow-hidden hover:shadow-md hover:border-primary-200 transition-all"
    >
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Sem imagem
          </div>
        )}

        <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary-800 text-white text-xs font-medium rounded-md">
          {property.type === 'venda' ? 'Venda' : 'Arrendamento'}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-800 transition-colors">
          {property.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          {property.neighborhood}, {property.municipality}
        </p>

        <div className="flex items-center gap-3 text-sm text-gray-600 mt-3">
          <span>{property.bedrooms} quartos</span>
          <span className="text-gray-300">·</span>
          <span>{property.bathrooms} WC</span>
          {property.area_m2 && (
            <>
              <span className="text-gray-300">·</span>
              <span>{property.area_m2} m²</span>
            </>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-lg font-bold text-primary-900">
            {formatKz(property.price)}
            {property.type === 'arrendamento' && (
              <span className="text-sm font-normal text-gray-500">/mês</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
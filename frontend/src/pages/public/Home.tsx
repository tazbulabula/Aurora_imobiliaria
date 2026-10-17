import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listProperties } from '@/api/properties';
import { PropertyCard } from '@/components/PropertyCard';
import { Button } from '@/components/ui/Button';

export function Home() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'venda' | 'arrendamento'>('venda');
  const [searchProvince, setSearchProvince] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['properties', 'featured'],
    queryFn: () => listProperties({ page: 1 }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ type: searchType });
    if (searchProvince) params.append('province', searchProvince);
    navigate(`/properties?${params.toString()}`);
  }

  const featured = data?.data.slice(0, 6) ?? [];

  return (
    <div>
      {/* HERO */}
      <section className="relative bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Encontra a casa certa,<br />
              com <span className="text-accent-400">segurança total</span>.
            </h1>
            <p className="mt-4 text-lg text-primary-100 max-w-xl">
              Todos os imóveis são verificados pela nossa equipa. Sem intermediários
              duvidosos, sem surpresas. Só a casa que procuras.
            </p>

            {/* Barra de pesquisa */}
            <form
              onSubmit={handleSearch}
              className="mt-8 bg-white rounded-xl p-2 shadow-xl flex flex-col sm:flex-row gap-2"
            >
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'venda' | 'arrendamento')}
                className="px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
              >
                <option value="venda">Comprar</option>
                <option value="arrendamento">Arrendar</option>
              </select>

              <input
                type="text"
                placeholder="Província (ex: Luanda)"
                value={searchProvince}
                onChange={(e) => setSearchProvince(e.target.value)}
                className="flex-1 px-4 py-3 text-sm text-gray-900 bg-gray-50 rounded-lg border-0 focus:ring-2 focus:ring-primary-500"
              />

              <button
                type="submit"
                className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors"
              >
                Procurar
              </button>
            </form>

            <div className="mt-6 flex items-center gap-6 text-sm text-primary-100">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Imóveis verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Pagamento seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Sem comissões escondidas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900">
          Como funciona
        </h2>
        <p className="text-center text-gray-500 mt-2 max-w-xl mx-auto">
          Três passos simples, do primeiro clique às chaves na mão.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              num: '1',
              title: 'Procuras',
              desc: 'Navegas pelos imóveis verificados, filtras por localização e preço.',
            },
            {
              num: '2',
              title: 'Mostras interesse',
              desc: 'Clicas em "Tenho interesse" e a nossa equipa inicia a mediação.',
            },
            {
              num: '3',
              title: 'Fechas negócio',
              desc: 'Pagas em segurança, recebes o contrato e as chaves.',
            },
          ].map((step) => (
            <div
              key={step.num}
              className="bg-surface rounded-xl border border-border p-6 hover:shadow-sm transition"
            >
              <div className="w-10 h-10 rounded-full bg-primary-800 text-white flex items-center justify-center font-bold">
                {step.num}
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* IMÓVEIS EM DESTAQUE */}
      <section className="bg-white py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Imóveis em destaque
              </h2>
              <p className="text-gray-500 mt-1">Os mais recentes, verificados pela equipa.</p>
            </div>
            <Link
              to="/properties"
              className="text-sm font-medium text-primary-800 hover:underline"
            >
              Ver todos →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-xl aspect-[4/3] animate-pulse"
                />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <p className="text-center text-gray-500 py-12">
              Ainda não há imóveis publicados. Volta em breve.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((property) => (
                <PropertyCard key={property.public_id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA PROPRIETÁRIO */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-primary-800 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold">Tens uma casa para vender ou arrendar?</h2>
            <p className="mt-3 text-primary-100 max-w-xl">
              Publica gratuitamente. A nossa equipa verifica e trata de tudo — tu
              só recebes quando o negócio fechar.
            </p>
          </div>
          <Link to="/register">
            <Button variant="primary" size="lg">
              Publicar imóvel
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getProperty } from '@/api/properties';
import { api } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Interest } from '@/types';

const formatKz = (value: number) =>
  new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(value) + ' Kz';

export function PropertyDetail() {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', publicId],
    queryFn: () => getProperty(publicId!),
    enabled: !!publicId,
  });

  const interestMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: Interest }>('/interests', {
        property_public_id: publicId,
      });
      return data.data;
    },
    onSuccess: (interest) => {
      navigate(`/my/interests/${interest.public_id}`);
    },
  });

  function handleInterestClick() {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/properties/${publicId}`);
      return;
    }
    if (user?.role === 'proprietario' && user.public_id === property?.owner?.public_id) {
      return;
    }
    setShowContactModal(true);
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse mb-6" />
        <div className="h-8 bg-gray-100 rounded w-1/2 animate-pulse" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Imóvel não encontrado</h1>
        <p className="text-gray-500 mt-2">Este imóvel pode já não estar disponível.</p>
        <Link to="/properties" className="inline-block mt-6">
          <Button variant="secondary">Voltar aos imóveis</Button>
        </Link>
      </div>
    );
  }

  const photos = property.media?.filter((m) => m.type === 'foto') ?? [];
  const isOwner = user?.public_id === property.owner?.public_id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/properties" className="text-sm text-gray-600 hover:text-primary-800 mb-4 inline-block">
        ← Voltar aos imóveis
      </Link>

      {/* Galeria */}
      <div className="grid md:grid-cols-4 gap-2 mb-8 rounded-xl overflow-hidden">
        <div className="md:col-span-3 aspect-[16/10] bg-gray-100">
          {photos[activeImage] ? (
            <img
              src={photos[activeImage].url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sem imagem
            </div>
          )}
        </div>

        {photos.length > 1 && (
          <div className="grid grid-cols-4 md:grid-cols-1 md:max-h-[500px] gap-2 overflow-y-auto">
            {photos.slice(0, 4).map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition ${
                  activeImage === idx ? 'border-primary-800' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Info principal */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-3 mb-2">
            <span className="px-2.5 py-1 bg-primary-800 text-white text-xs font-medium rounded-md">
              {property.type === 'venda' ? 'Venda' : 'Arrendamento'}
            </span>
            {property.status === 'aprovado' && <Badge status="aprovado">Verificado</Badge>}
          </div>

          <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-500 mt-2">
            {property.neighborhood}, {property.municipality}, {property.province}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-8 py-6 border-y border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
              <p className="text-sm text-gray-500 mt-1">Quartos</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-gray-900">{property.bathrooms}</p>
              <p className="text-sm text-gray-500 mt-1">Casas de banho</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {property.area_m2 ?? '—'}
              </p>
              <p className="text-sm text-gray-500 mt-1">m²</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {property.description}
            </p>
          </div>
        </div>

        {/* Sidebar — preço e CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-surface border border-border rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-500">Preço</p>
            <p className="text-3xl font-bold text-primary-900 mt-1">
              {formatKz(property.price)}
              {property.type === 'arrendamento' && (
                <span className="text-base font-normal text-gray-500">/mês</span>
              )}
            </p>

            {isOwner ? (
              <div className="mt-6 p-3 bg-primary-50 text-primary-800 text-sm rounded-lg text-center">
                Este é o teu imóvel.
              </div>
            ) : (
              <>
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleInterestClick}
                  disabled={interestMutation.isPending}
                >
                  {interestMutation.isPending ? 'A processar...' : 'Tenho interesse'}
                </Button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  A nossa equipa entra em contacto em até 24h para mediar o processo.
                </p>
              </>
            )}

            <div className="mt-6 pt-6 border-t border-border space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Documentação verificada
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Pagamento intermediado
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Comissão máxima de 10%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmação */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-surface rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Confirmar interesse</h3>
            <p className="text-sm text-gray-600 mt-2">
              Ao continuar, a nossa equipa vai iniciar o processo de mediação para o
              imóvel <strong>{property.title}</strong>. Vais poder conversar com o
              mediador no chat interno.
            </p>

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowContactModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => interestMutation.mutate()}
                disabled={interestMutation.isPending}
              >
                {interestMutation.isPending ? 'A enviar...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
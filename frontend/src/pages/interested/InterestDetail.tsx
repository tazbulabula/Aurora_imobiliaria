import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInterest, cancelInterest } from '@/api/interests';
import { listMessages, sendMessage } from '@/api/messages';
import { useAuth } from '@/contexts/AuthContext';
import { useEcho } from '@/hooks/useEcho';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { InterestStatus, Message } from '@/types';
import { InterestChat } from '@/components/InterestChat';

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

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-AO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export function InterestDetail() {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const echo = useEcho();
  const queryClient = useQueryClient();

  const [newMessage, setNewMessage] = useState('');
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const { data: interest, isLoading: loadingInterest } = useQuery({
    queryKey: ['interest', publicId],
    queryFn: () => getInterest(publicId!),
    enabled: !!publicId,
  });

  const { data: initialMessages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', publicId],
    queryFn: () => listMessages(publicId!),
    enabled: !!publicId,
  });

  // Combina mensagens iniciais + mensagens recebidas via WebSocket (sem duplicados)
  const messages = (() => {
    const all = [...(initialMessages ?? []), ...liveMessages];
    const seen = new Set<string>();
    return all.filter((m) => {
      if (seen.has(m.public_id)) return false;
      seen.add(m.public_id);
      return true;
    });
  })();

  // Subscrição ao canal do interesse
  useEffect(() => {
    if (!echo || !publicId) return;

    const channel = echo.private(`interest.${publicId}`);

    channel.listen('.MessageSent', (payload: {
      public_id: string;
      content: string;
      sender: { public_id: string; name: string };
      created_at: string;
    }) => {
      setLiveMessages((prev) => [
        ...prev,
        {
          public_id: payload.public_id,
          content: payload.content,
          sender: {
            public_id: payload.sender.public_id,
            name: payload.sender.name,
          } as Message['sender'],
          created_at: payload.created_at,
        },
      ]);
    });

    return () => {
      echo.leave(`interest.${publicId}`);
    };
  }, [echo, publicId]);

  // Scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(publicId!, content),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', publicId] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelInterest(publicId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest', publicId] });
      setConfirmCancel(false);
    },
  });

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  }

  if (loadingInterest) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500">A carregar...</div>;
  }

  if (!interest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Interesse não encontrado</h1>
        <Link to="/my/interests" className="inline-block mt-6">
          <Button variant="secondary">Voltar</Button>
        </Link>
      </div>
    );
  }

  const isClosed = ['fechado', 'cancelado'].includes(interest.status);
  const canCancel = ['novo', 'em_mediacao'].includes(interest.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/my/interests" className="text-sm text-gray-600 hover:text-primary-800 mb-4 inline-block">
        ← Voltar aos interesses
      </Link>

      {/* Cabeçalho */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {interest.property?.media?.[0]?.url ? (
                <img
                  src={interest.property.media[0].url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {interest.property?.title}
              </h1>
              <p className="text-sm text-gray-500">
                {interest.property?.neighborhood}, {interest.property?.municipality}
              </p>
              <div className="mt-2">
                <Badge status={statusToBadge(interest.status)}>
                  {statusLabels[interest.status]}
                </Badge>
              </div>
            </div>
          </div>

          {canCancel && (
            <Button variant="ghost" size="sm" onClick={() => setConfirmCancel(true)} className="text-danger">
              Cancelar processo
            </Button>
          )}
        </div>
      </div>

      {/* Chat */}
      <InterestChat interestPublicId={interest.public_id} interestStatus={interest.status} />

      {/* Modal cancelar */}
      {confirmCancel && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setConfirmCancel(false)}
        >
          <div
            className="bg-surface rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Cancelar processo?</h3>
            <p className="text-sm text-gray-600 mt-2">
              Vais cancelar o processo para <strong>{interest.property?.title}</strong>. O proprietário será notificado.
            </p>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmCancel(false)}>
                Voltar
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'A cancelar...' : 'Cancelar processo'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
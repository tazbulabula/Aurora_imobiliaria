import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listAdminChats } from '@/api/admin';
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

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function AdminChats() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-chats'],
    queryFn: listAdminChats,
    refetchInterval: 30000,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
        <p className="text-sm text-gray-500 mt-1">
          Conversas ativas. Ordenadas pela última mensagem.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="Sem conversas ativas"
          description="Ainda não há mensagens entre utilizadores nos processos de mediação."
        />
      ) : (
        <div className="space-y-2">
          {data.data.map((chat) => (
            <Link
              key={chat.interest_public_id}
              to={`/admin/interests/${chat.interest_public_id}`}
              className="block bg-surface border border-border rounded-xl p-4 hover:shadow-sm hover:border-primary-200 transition"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {chat.property.title}
                    </h3>
                    <Badge status={statusToBadge(chat.status)}>
                      {statusLabels[chat.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    <strong>{chat.interested.name}</strong> · proprietário:{' '}
                    {chat.owner.name}
                  </p>
                  {chat.last_message && (
                    <p className="text-sm text-gray-700 mt-2 truncate">
                      {chat.last_message.content}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">
                    {chat.last_message && formatRelative(chat.last_message.created_at)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {chat.messages_count} msg
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
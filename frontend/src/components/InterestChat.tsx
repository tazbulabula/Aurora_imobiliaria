import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMessages, sendMessage } from '@/api/messages';
import { useAuth } from '@/contexts/AuthContext';
import { useEcho } from '@/hooks/useEcho';
import { Button } from '@/components/ui/Button';
import type { InterestStatus, Message } from '@/types';

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-AO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

interface Props {
  interestPublicId: string;
  interestStatus: InterestStatus;
}

export function InterestChat({ interestPublicId, interestStatus }: Props) {
  const { user } = useAuth();
  const echo = useEcho();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: initialMessages, isLoading } = useQuery({
    queryKey: ['messages', interestPublicId],
    queryFn: () => listMessages(interestPublicId),
  });

  const messages = (() => {
    const all = [...(initialMessages ?? []), ...liveMessages];
    const seen = new Set<string>();
    return all.filter((m) => {
      if (seen.has(m.public_id)) return false;
      seen.add(m.public_id);
      return true;
    });
  })();

  useEffect(() => {
    if (!echo) return;

    const channel = echo.private(`interest.${interestPublicId}`);
    channel.listen(
      '.MessageSent',
      (payload: {
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
      }
    );

    return () => {
      echo.leave(`interest.${interestPublicId}`);
    };
  }, [echo, interestPublicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(interestPublicId, content),
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages', interestPublicId] });
    },
  });

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  }

  const isClosed = ['fechado', 'cancelado'].includes(interestStatus);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col h-[600px]">
      <div className="px-5 py-3 border-b border-border bg-gray-50">
        <h2 className="font-semibold text-gray-900">Chat mediado</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Todas as mensagens passam por aqui. Nenhum contacto direto.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500 text-center py-8">A carregar...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">
            Ainda não há mensagens neste processo.
          </p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender.public_id === user?.public_id;
            return (
              <div key={msg.public_id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                    isMine ? 'bg-primary-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-xs font-medium opacity-80 mb-0.5">
                    {isMine ? 'Tu' : msg.sender.name}
                  </p>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      isMine ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {isClosed ? (
        <div className="px-5 py-4 border-t border-border bg-gray-50 text-center text-sm text-gray-500">
          Processo encerrado.
        </div>
      ) : (
        <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreve uma mensagem..."
            disabled={sendMutation.isPending}
            className="flex-1 px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <Button type="submit" disabled={!newMessage.trim() || sendMutation.isPending}>
            Enviar
          </Button>
        </form>
      )}
    </div>
  );
}
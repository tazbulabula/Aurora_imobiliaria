import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInterest } from '@/api/interests';
import {
  updateInterestStatus,
  createTransaction,
  confirmPayment,
  confirmTransfer,
} from '@/api/admin';
import { InterestChat } from '@/components/InterestChat';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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

const transitionableStatuses: InterestStatus[] = [
  'em_mediacao',
  'visita_agendada',
  'negociacao',
  'cancelado',
];

const formatKz = (value: number) =>
  new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(value) + ' Kz';

export function AdminInterestDetail() {
  const { publicId } = useParams<{ publicId: string }>();
  const queryClient = useQueryClient();

  const { data: interest, isLoading } = useQuery({
    queryKey: ['interest', publicId],
    queryFn: () => getInterest(publicId!),
    enabled: !!publicId,
  });

  const [newStatus, setNewStatus] = useState<InterestStatus | ''>('');
  const [txAmount, setTxAmount] = useState('');
  const [txPercent, setTxPercent] = useState('5');
  const [paymentRef, setPaymentRef] = useState('');
  const [transferRef, setTransferRef] = useState('');

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateInterestStatus(publicId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest', publicId] });
      queryClient.invalidateQueries({ queryKey: ['admin-interests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setNewStatus('');
    },
  });

  const txMutation = useMutation({
    mutationFn: (payload: { amount: number; commission_percentage: number }) =>
      createTransaction(publicId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest', publicId] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const payMutation = useMutation({
    mutationFn: (ref: string) => confirmPayment(interest!.transaction!.public_id, ref),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest', publicId] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setPaymentRef('');
    },
  });

  const transferMutation = useMutation({
    mutationFn: (ref: string) => confirmTransfer(interest!.transaction!.public_id, ref),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interest', publicId] });
      queryClient.invalidateQueries({ queryKey: ['admin-interests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setTransferRef('');
    },
  });

  if (isLoading || !interest) {
    return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">A carregar...</div>;
  }

  const tx = interest.transaction;
  const canCreateTx =
    !tx &&
    ['em_mediacao', 'visita_agendada', 'negociacao'].includes(interest.status);
  const commissionPreview = (() => {
    const amt = Number(txAmount);
    const pct = Number(txPercent);
    if (!amt || !pct) return null;
    const commission = Math.round((amt * pct) / 100);
    return { commission, owner: amt - commission };
  })();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/admin/interests"
        className="text-sm text-gray-600 hover:text-primary-800 mb-4 inline-block"
      >
        ← Voltar aos interesses
      </Link>

      {/* Cabeçalho */}
      <div className="bg-surface border border-border rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                {interest.property?.title}
              </h1>
              <Badge status={statusToBadge(interest.status)}>
                {statusLabels[interest.status]}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {interest.property?.neighborhood}, {interest.property?.municipality}
            </p>
            <p className="text-sm font-semibold text-primary-900 mt-1">
              {interest.property?.price && formatKz(interest.property.price)}
            </p>
          </div>
          <Link to={`/properties/${interest.property?.public_id}`}>
            <Button variant="ghost" size="sm">Ver imóvel</Button>
          </Link>
        </div>

        <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Interessado</p>
            <p className="font-medium text-gray-900">{interest.interested?.name}</p>
            <p className="text-gray-600">{interest.interested?.email}</p>
            <p className="text-gray-600">{interest.interested?.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Proprietário</p>
            <p className="font-medium text-gray-900">{interest.property?.owner?.name}</p>
            <p className="text-gray-600">{interest.property?.owner?.email}</p>
            <p className="text-gray-600">{interest.property?.owner?.phone}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coluna esquerda — ações */}
        <div className="lg:col-span-1 space-y-4">
          {/* Mudar estado */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Estado do processo</h2>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as InterestStatus)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface"
            >
              <option value="">Selecionar novo estado...</option>
              {transitionableStatuses
                .filter((s) => s !== interest.status)
                .map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
            </select>
            <Button
              className="w-full mt-3"
              size="sm"
              disabled={!newStatus || statusMutation.isPending}
              onClick={() => newStatus && statusMutation.mutate(newStatus)}
            >
              {statusMutation.isPending ? 'A guardar...' : 'Atualizar estado'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              "Concluído" só é possível após confirmares a transferência ao proprietário.
            </p>
          </div>

          {/* Transação */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Transação</h2>

            {!tx && canCreateTx && (
              <>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Valor total (Kz)
                </label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="25000000"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-3"
                />
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Comissão (%)
                </label>
                <input
                  type="number"
                  value={txPercent}
                  onChange={(e) => setTxPercent(e.target.value)}
                  min="0"
                  max="10"
                  step="0.5"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-3"
                />
                {commissionPreview && (
                  <div className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between">
                      <span>Comissão:</span>
                      <span className="font-medium">{formatKz(commissionPreview.commission)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proprietário:</span>
                      <span className="font-medium">{formatKz(commissionPreview.owner)}</span>
                    </div>
                  </div>
                )}
                <Button
                  className="w-full"
                  size="sm"
                  disabled={!txAmount || !txPercent || txMutation.isPending}
                  onClick={() =>
                    txMutation.mutate({
                      amount: Number(txAmount),
                      commission_percentage: Number(txPercent),
                    })
                  }
                >
                  {txMutation.isPending ? 'A criar...' : 'Criar transação'}
                </Button>
              </>
            )}

            {!tx && !canCreateTx && (
              <p className="text-sm text-gray-500">
                {interest.status === 'novo'
                  ? 'Muda o estado para "Em mediação" para criar a transação.'
                  : 'Não é possível criar transação neste estado.'}
              </p>
            )}

            {tx && (
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Valor total:</span>
                    <span className="font-medium">{formatKz(tx.amount)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">Comissão:</span>
                    <span className="font-medium text-success">
                      {formatKz(tx.commission_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-border mt-1 pt-2">
                    <span className="text-gray-500">Proprietário:</span>
                    <span className="font-medium">{formatKz(tx.owner_amount)}</span>
                  </div>
                </div>

                <Badge status={tx.payment_status === 'pendente' ? 'pendente' : tx.payment_status === 'pago' ? 'pago' : 'concluido'}>
                  {tx.payment_status === 'pendente' && 'Aguarda pagamento'}
                  {tx.payment_status === 'pago' && 'Pago — falta transferir'}
                  {tx.payment_status === 'transferido' && 'Transferido'}
                  {tx.payment_status === 'concluido' && 'Concluído'}
                  {tx.payment_status === 'cancelado' && 'Cancelado'}
                </Badge>

                {tx.payment_status === 'pendente' && (
                  <>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="Referência Multicaixa"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={!paymentRef || payMutation.isPending}
                      onClick={() => payMutation.mutate(paymentRef)}
                    >
                      {payMutation.isPending ? 'A confirmar...' : 'Confirmar pagamento'}
                    </Button>
                  </>
                )}

                {tx.payment_status === 'pago' && (
                  <>
                    <input
                      type="text"
                      value={transferRef}
                      onChange={(e) => setTransferRef(e.target.value)}
                      placeholder="Referência da transferência"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    />
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={!transferRef || transferMutation.isPending}
                      onClick={() => transferMutation.mutate(transferRef)}
                    >
                      {transferMutation.isPending
                        ? 'A confirmar...'
                        : 'Confirmar transferência ao proprietário'}
                    </Button>
                  </>
                )}

                {tx.payment_status === 'concluido' && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    Transação concluída em{' '}
                    {tx.transferred_at &&
                      new Date(tx.transferred_at).toLocaleDateString('pt-AO')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita — chat */}
        <div className="lg:col-span-2">
          <InterestChat
            interestPublicId={interest.public_id}
            interestStatus={interest.status}
          />
        </div>
      </div>
    </div>
  );
}
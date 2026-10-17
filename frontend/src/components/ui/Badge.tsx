import type { ReactNode } from 'react';

type Status = 'pendente' | 'aprovado' | 'rejeitado' | 'pago' | 'concluido' | 'cancelado';

const styles: Record<Status, string> = {
  pendente:  'bg-amber-50 text-warning border-amber-200',
  aprovado:  'bg-green-50 text-success border-green-200',
  rejeitado: 'bg-red-50 text-danger border-red-200',
  pago:      'bg-green-50 text-success border-green-200',
  concluido: 'bg-cyan-50 text-info border-cyan-200',
  cancelado: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function Badge({ status, children }: { status: Status; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {children}
    </span>
  );
}
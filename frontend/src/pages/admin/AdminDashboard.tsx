import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminStats } from '@/api/admin';
import { Button } from '@/components/ui/Button';

const formatKz = (value: number) =>
  new Intl.NumberFormat('pt-AO', { maximumFractionDigits: 0 }).format(value) + ' Kz';

function StatCard({
  label,
  value,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  variant?: 'default' | 'warning' | 'success';
}) {
  const colors = {
    default: 'bg-primary-50 text-primary-900 border-primary-100',
    warning: 'bg-amber-50 text-amber-900 border-amber-100',
    success: 'bg-green-50 text-green-900 border-green-100',
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[variant]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
    refetchInterval: 30000,
  });

  if (isLoading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Painel de administração</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visão geral da plataforma. Atualiza a cada 30s.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Imóveis pendentes"
          value={data.properties.pendentes}
          variant={data.properties.pendentes > 0 ? 'warning' : 'default'}
        />
        <StatCard label="Imóveis aprovados" value={data.properties.aprovados} variant="success" />
        <StatCard
          label="Interesses em mediação"
          value={data.interests.em_mediacao + data.interests.negociacao}
        />
        <StatCard
          label="Transações pendentes"
          value={data.transactions.pendentes}
          variant={data.transactions.pendentes > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Receita de comissões</h2>
          <p className="text-3xl font-bold text-primary-900">
            {formatKz(data.transactions.comissao_total)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total recebido em transações concluídas.
          </p>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Pendentes</p>
              <p className="font-semibold text-gray-900">{data.transactions.pendentes}</p>
            </div>
            <div>
              <p className="text-gray-500">Pagas</p>
              <p className="font-semibold text-gray-900">{data.transactions.pagas}</p>
            </div>
            <div>
              <p className="text-gray-500">Concluídas</p>
              <p className="font-semibold text-gray-900">{data.transactions.concluidas}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Utilizadores</h2>
          <p className="text-3xl font-bold text-primary-900">{data.users.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total registado.</p>
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Proprietários</p>
              <p className="font-semibold text-gray-900">{data.users.proprietarios}</p>
            </div>
            <div>
              <p className="text-gray-500">Interessados</p>
              <p className="font-semibold text-gray-900">{data.users.interessados}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/admin/properties/pending" className="bg-surface border border-border rounded-xl p-5 hover:shadow-sm hover:border-primary-200 transition">
            <h3 className="font-semibold text-gray-900">Aprovar imóveis</h3>
            <p className="text-sm text-gray-500 mt-1">{data.properties.pendentes} aguardam</p>
        </Link>

        <Link to="/admin/interests" className="bg-surface border border-border rounded-xl p-5 hover:shadow-sm hover:border-primary-200 transition">
            <h3 className="font-semibold text-gray-900">Interesses</h3>
            <p className="text-sm text-gray-500 mt-1">{data.interests.novos} novos</p>
        </Link>

        <Link to="/admin/chats" className="bg-surface border border-border rounded-xl p-5 hover:shadow-sm hover:border-primary-200 transition">
            <h3 className="font-semibold text-gray-900">Chats</h3>
            <p className="text-sm text-gray-500 mt-1">Ver conversas ativas</p>
        </Link>

        <Link to="/admin/users" className="bg-surface border border-border rounded-xl p-5 hover:shadow-sm hover:border-primary-200 transition">
            <h3 className="font-semibold text-gray-900">Utilizadores</h3>
            <p className="text-sm text-gray-500 mt-1">{data.users.total} registados</p>
        </Link>
        </div>
    </div>
  );
}
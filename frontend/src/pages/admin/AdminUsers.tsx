import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAllUsers, updateUser } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/EmptyState';
import type { Role, User, VerificationStatus } from '@/types';
import { useToast } from '../ToastContext';

const roleLabels: Record<Role, string> = {
  proprietario: 'Proprietário',
  interessado: 'Interessado',
  admin: 'Administrador',
};

const verificationLabels: Record<VerificationStatus, string> = {
  pendente: 'Pendente',
  verificado: 'Verificado',
  rejeitado: 'Rejeitado',
};

const roleFilters: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'proprietario', label: 'Proprietários' },
  { value: 'interessado', label: 'Interessados' },
  { value: 'admin', label: 'Admins' },
];

export function AdminUsers() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, search],
    queryFn: () => listAllUsers({ role: roleFilter || undefined, search: search || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { role?: string; verification_status?: string } }) =>
      updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      showToast('Utilizador atualizado.', 'success');
      setEditing(null);
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message ?? 'Erro ao atualizar.', 'error');
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilizadores</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerir roles e estados de verificação.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {roleFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setRoleFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition ${
              roleFilter === f.value
                ? 'bg-primary-800 text-white'
                : 'bg-white border border-border text-gray-700 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Procurar por nome, email ou telefone..."
        className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm mb-4 focus:ring-2 focus:ring-primary-500"
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Sem utilizadores" />
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-border">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Verificação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((user) => (
                <tr key={user.public_id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{user.email}</div>
                    <div className="text-xs text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-800">
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        user.verification_status === 'verificado'
                          ? 'bg-green-50 text-success'
                          : user.verification_status === 'rejeitado'
                          ? 'bg-red-50 text-danger'
                          : 'bg-amber-50 text-warning'
                      }`}
                    >
                      {verificationLabels[user.verification_status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(user)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edição */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-surface rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">Editar utilizador</h3>
            <p className="text-sm text-gray-500 mt-1">{editing.name}</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                <select
                  defaultValue={editing.role}
                  onChange={(e) =>
                    setEditing({ ...editing, role: e.target.value as Role })
                  }
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-surface"
                >
                  <option value="interessado">Interessado</option>
                  <option value="proprietario">Proprietário</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Estado de verificação
                </label>
                <select
                  defaultValue={editing.verification_status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      verification_status: e.target.value as VerificationStatus,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm bg-surface"
                >
                  <option value="pendente">Pendente</option>
                  <option value="verificado">Verificado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="ghost" className="flex-1" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  updateMutation.mutate({
                    id: editing.public_id,
                    payload: {
                      role: editing.role,
                      verification_status: editing.verification_status,
                    },
                  })
                }
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'A guardar...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
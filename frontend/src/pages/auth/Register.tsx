import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const schema = z
  .object({
    name: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('Email inválido'),
    phone: z.string().regex(/^9\d{8}$/, 'Telefone: 9 dígitos, começa por 9'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string(),
    role: z.enum(['proprietario', 'interessado']),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords não coincidem',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

export function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'interessado' },
  });

  async function onSubmit(data: FormData) {
    try {
      setError(null);
      const user = await signUp(data);
      if (user.role === 'proprietario') navigate('/owner');
      else navigate('/my/interests');
    } catch {
      setError('Erro ao registar. Verifica os dados.');
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Criar conta</h1>
        <p className="text-sm text-gray-500 mb-6">
          Junta-te à plataforma e começa em minutos.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome
            </label>
            <input
              {...register('name')}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
            {errors.name && (
              <p className="text-danger text-xs mt-1.5">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
            {errors.email && (
              <p className="text-danger text-xs mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Telefone
            </label>
            <input
              {...register('phone')}
              placeholder="923456789"
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
            {errors.phone && (
              <p className="text-danger text-xs mt-1.5">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
            {errors.password && (
              <p className="text-danger text-xs mt-1.5">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar password
            </label>
            <input
              type="password"
              {...register('password_confirmation')}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
            />
            {errors.password_confirmation && (
              <p className="text-danger text-xs mt-1.5">
                {errors.password_confirmation.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Sou
            </label>
            <select
              {...register('role')}
              className="w-full px-3.5 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition bg-surface"
            >
              <option value="interessado">Interessado (procuro imóvel)</option>
              <option value="proprietario">Proprietário (tenho imóvel)</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-danger text-sm px-3.5 py-2.5 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? 'A criar...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-600">
          Já tens conta?{' '}
          <Link
            to="/login"
            className="text-primary-800 font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
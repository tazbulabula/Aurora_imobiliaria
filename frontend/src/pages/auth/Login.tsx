import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useToast } from '../ToastContext';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Password obrigatória'),
});

type FormData = z.infer<typeof schema>;

export function Login() {
    
    const { showToast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      setError(null);
      const user = await signIn(data.email, data.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'proprietario') navigate('/owner');
      else navigate('/my/interests');
    } catch {
      setError('Credenciais inválidas.');
      showToast('Credenciais inválidas.', 'error');
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Entrar</h1>
        <p className="text-sm text-gray-500 mb-6">
          Acede à tua conta para gerir imóveis e interesses.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {isSubmitting ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <p className="text-sm text-center mt-6 text-gray-600">
          Não tens conta?{' '}
          <Link
            to="/register"
            className="text-primary-800 font-medium hover:underline"
          >
            Registar
          </Link>
        </p>
      </div>
    </div>
  );
}
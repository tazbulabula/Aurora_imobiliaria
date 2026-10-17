import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <p className="text-7xl font-bold text-primary-800">404</p>
      <h1 className="text-2xl font-semibold text-gray-900 mt-4">Página não encontrada</h1>
      <p className="text-gray-500 mt-2">
        O endereço que tentaste abrir não existe ou foi movido.
      </p>
      <Link to="/" className="inline-block mt-8">
        <Button>Voltar ao início</Button>
      </Link>
    </div>
  );
}
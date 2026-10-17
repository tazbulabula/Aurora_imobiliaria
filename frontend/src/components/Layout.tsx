import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationBell';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o menu ao mudar de rota
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await signOut();
    navigate('/login');
  }

  const links = (
    <>
      <Link to="/properties" className="text-gray-600 hover:text-primary-800 transition-colors">
        Imóveis
      </Link>
      {user?.role === 'proprietario' && (
        <Link to="/owner" className="text-gray-600 hover:text-primary-800 transition-colors">
          Meus Imóveis
        </Link>
      )}
      {user?.role === 'interessado' && (
        <Link to="/my/interests" className="text-gray-600 hover:text-primary-800 transition-colors">
          Meus Interesses
        </Link>
      )}
      {user?.role === 'admin' && (
        <Link to="/admin" className="text-gray-600 hover:text-primary-800 transition-colors">
          Admin
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-surface border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-800 text-white flex items-center justify-center font-bold">
              I
            </span>
            <span className="text-lg font-semibold text-primary-900">Imobiliária</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-5 text-sm">
            {links}
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <span className="text-gray-700 font-medium">{user.name}</span>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-gray-700">Olá, <strong>{user.name}</strong></span>
                    <NotificationBell />
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-gray-600 hover:text-danger hover:bg-red-50 rounded-md transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-800 transition-colors">
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-md transition-colors shadow-sm"
                >
                  Registar
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 text-gray-600 hover:text-primary-800"
            aria-label="Abrir menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-3 text-sm">
            {links}
            {user ? (
              <>
                <div className="pt-3 border-t border-border text-gray-700">
                  Olá, <strong>{user.name}</strong>
                </div>
                <div className="flex items-center gap-3 pl-3 border-l border-border">
                <NotificationBell />
                <span className="text-gray-700 font-medium">{user.name}</span>
                <button onClick={handleLogout} className="...">Sair</button>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-left text-danger hover:underline"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600">
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-accent-500 text-white font-medium rounded-md text-center"
                >
                  Registar
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-surface border-t border-border py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Imobiliária Angola · Intermediação segura
        </div>
      </footer>
    </div>
  );
}
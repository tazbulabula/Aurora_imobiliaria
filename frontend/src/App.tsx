import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { Home } from '@/pages/public/Home';
import { PropertyList } from '@/pages/public/PropertyList';
import { PropertyDetail } from '@/pages/public/PropertyDetail';
import { MyProperties } from '@/pages/owner/MyProperties';
import { PublishProperty } from '@/pages/owner/PublishProperty';
import { MyInterests } from '@/pages/interested/MyInterests';
import { InterestDetail } from '@/pages/interested/InterestDetail';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { PendingProperties } from '@/pages/admin/PendingProperties';
import { AdminInterests } from '@/pages/admin/AdminInterests';
import { AdminInterestDetail } from '@/pages/admin/AdminInterestDetail';
import { NotFound } from '@/pages/NotFound';
import { ErrorBoundary } from './pages/ErrorBoundary';
import { ToastProvider } from './pages/ToastContext';
import { AdminProperties } from './pages/admin/AdminProperties';
import { AdminChats } from './pages/admin/AdminChats';
import { AdminUsers } from './pages/admin/AdminUsers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/properties" element={<PropertyList />} />
                  <Route path="/properties/:publicId" element={<PropertyDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route element={<ProtectedRoute roles={['proprietario', 'admin']} />}>
                    <Route path="/owner" element={<MyProperties />} />
                    <Route path="/owner/publish" element={<PublishProperty />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['interessado', 'admin']} />}>
                    <Route path="/my/interests" element={<MyInterests />} />
                    <Route path="/my/interests/:publicId" element={<InterestDetail />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['admin']} />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/properties/pending" element={<PendingProperties />} />
                    <Route path="/admin/interests" element={<AdminInterests />} />
                    <Route path="/admin/interests/:publicId" element={<AdminInterestDetail />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/properties" element={<AdminProperties />} />
                    <Route path="/admin/properties/pending" element={<PendingProperties />} />
                    <Route path="/admin/interests" element={<AdminInterests />} />
                    <Route path="/admin/interests/:publicId" element={<AdminInterestDetail />} />
                    <Route path="/admin/chats" element={<AdminChats />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
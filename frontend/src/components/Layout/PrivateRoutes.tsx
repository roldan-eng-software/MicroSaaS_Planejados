// frontend/src/components/Layout/PrivateRoutes.tsx
import { ReactNode } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from './MainLayout';

export function PrivateRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>; // Ou um spinner/esqueleto
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

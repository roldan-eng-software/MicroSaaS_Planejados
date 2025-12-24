// frontend/src/routes/index.tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import ClientesPage from '@/pages/clientes/ClientesPage';
import { PrivateRoutes } from '@/components/Layout/PrivateRoutes';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <PrivateRoutes />,
    children: [
      {
        index: true, // Rota padrão quando acessa '/' dentro de PrivateRoutes
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'clientes',
        element: <ClientesPage />,
      },
      // Outras rotas protegidas virão aqui
    ],
  },
  // Rota de fallback para 404 - opcional
  {
    path: '*',
    element: <div>404 Not Found</div>,
  },
]);

export default router;

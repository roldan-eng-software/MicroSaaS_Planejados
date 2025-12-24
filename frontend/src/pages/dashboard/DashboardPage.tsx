// frontend/src/pages/dashboard/DashboardPage.tsx
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">Bem-vindo!</p>
      {user && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>User ID: {user.id}</p>
          <p>Tenant ID: {user.tenant_id}</p>
        </div>
      )}
      <button
        onClick={logout}
        className="px-4 py-2 mt-6 font-bold text-white bg-red-500 rounded hover:bg-red-700"
      >
        Sair
      </button>
    </div>
  );
}

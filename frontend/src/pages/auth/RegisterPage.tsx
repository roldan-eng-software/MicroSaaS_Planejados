// frontend/src/pages/auth/RegisterPage.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await api.post('/auth/register', {
        email: data.email,
        password: data.password,
      });
      // Redireciona para o login após o sucesso
      navigate('/login');
    } catch (error: any) {
      if (error.response && error.response.data.detail) {
        setError('root', {
          type: 'manual',
          message: error.response.data.detail,
        });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Ocorreu um erro ao registrar.',
        });
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-8 bg-white rounded shadow-md w-96"
      >
        <h2 className="mb-6 text-2xl font-bold text-center">Registrar</h2>
        {errors.root && (
          <p className="mb-4 text-red-500">{errors.root.message}</p>
        )}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold">Email</label>
          <input
            {...register('email')}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-sm font-bold">Senha</label>
          <input
            type="password"
            {...register('password')}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-bold">Confirmar Senha</label>
          <input
            type="password"
            {...register('confirmPassword')}
            className="w-full px-3 py-2 border rounded"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
        >
          {isSubmitting ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCriarCliente } from '@/hooks/useClientes';

const clienteSchema = z.object({
    nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    tipo: z.enum(['PF', 'PJ']),
    cpf_cnpj: z.string().regex(/^\d+$/, 'Apenas números'),
    email: z.string().email('Email inválido'),
    telefone_ddd: z.string(),
});

export function ClienteForm() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(clienteSchema),
    });

    const { mutate: criarCliente, isPending } = useCriarCliente();

    const onSubmit = (data) => {
        criarCliente(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
                {...register('nome')}
                placeholder="Nome"
                className="w-full border rounded px-3 py-2"
            />
            {errors.nome && <span className="text-red-500">{errors.nome.message}</span>}

            <select {...register('tipo')} className="w-full border rounded px-3 py-2">
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
            </select>

            <input
                {...register('cpf_cnpj')}
                placeholder="CPF/CNPJ"
                className="w-full border rounded px-3 py-2"
            />
            {errors.cpf_cnpj && <span className="text-red-500">{errors.cpf_cnpj.message}</span>}

            <input
                {...register('email')}
                type="email"
                placeholder="Email"
                className="w-full border rounded px-3 py-2"
            />
            {errors.email && <span className="text-red-500">{errors.email.message}</span>}

            <input
                {...register('telefone_ddd')}
                placeholder="Telefone"
                className="w-full border rounded px-3 py-2"
            />

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
                {isPending ? 'Salvando...' : 'Criar Cliente'}
            </button>
        </form>
    );
}

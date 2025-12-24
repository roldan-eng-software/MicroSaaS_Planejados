import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCriarCliente, useAtualizarCliente } from '@/hooks/useClientes';
import { ClienteRead, TipoCliente } from '@/types/cliente';

const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  tipo: z.nativeEnum(TipoCliente),
  cpf_cnpj: z.string().regex(/^\d+$/, 'Apenas números'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone_ddd: z.string().optional(),
  endereco: z.string().optional(),
  cep: z.string().optional(),
  cidade: z.string().optional(),
  uf: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface ClienteFormProps {
    cliente?: ClienteRead;
    onSuccess: () => void;
}

export function ClienteForm({ cliente, onSuccess }: ClienteFormProps) {
    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
    });

    const { mutate: criarCliente, isPending: isCreating } = useCriarCliente();
    const { mutate: atualizarCliente, isPending: isUpdating } = useAtualizarCliente();

    const isEditMode = !!cliente;
    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (isEditMode) {
            reset(cliente);
        } else {
            reset({
                nome: '',
                tipo: TipoCliente.PessoaFisica,
                cpf_cnpj: '',
                email: '',
                telefone_ddd: '',
            });
        }
    }, [cliente, isEditMode, reset]);

    const onSubmit = (data: ClienteFormData) => {
        if (isEditMode) {
            if (isDirty) { // Só submete se houver mudanças
                atualizarCliente({ id: cliente.id, data }, { onSuccess });
            } else {
                onSuccess(); // Se não houver mudanças, apenas fecha o form/modal
            }
        } else {
            criarCliente(data, { onSuccess });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Campos do formulário */}
            <div>
                <label>Nome</label>
                <input {...register('nome')} className="w-full border rounded px-3 py-2" />
                {errors.nome && <span className="text-red-500 text-sm">{errors.nome.message}</span>}
            </div>
            <div>
                <label>Tipo</label>
                <select {...register('tipo')} className="w-full border rounded px-3 py-2">
                    <option value={TipoCliente.PessoaFisica}>Pessoa Física</option>
                    <option value={TipoCliente.PessoaJuridica}>Pessoa Jurídica</option>
                </select>
            </div>
            <div>
                <label>CPF/CNPJ</label>
                <input {...register('cpf_cnpj')} className="w-full border rounded px-3 py-2" />
                {errors.cpf_cnpj && <span className="text-red-500 text-sm">{errors.cpf_cnpj.message}</span>}
            </div>
            <div>
                <label>Email</label>
                <input type="email" {...register('email')} className="w-full border rounded px-3 py-2" />
                {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
            </div>
            <div>
                <label>Telefone</label>
                <input {...register('telefone_ddd')} className="w-full border rounded px-3 py-2" />
            </div>
            
            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isPending ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Cliente')}
            </button>
        </form>
    );
}

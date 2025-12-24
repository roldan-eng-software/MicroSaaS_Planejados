// frontend/src/components/pagamentos/ParcelaForm.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ParcelaRead, ParcelaUpdate, StatusParcela } from '@/types/parcela';
import { useAtualizarParcela } from '@/hooks/usePagamentos';
import { format } from 'date-fns';

const parcelaSchema = z.object({
  data_pagamento: z.string().optional(),
  status: z.nativeEnum(StatusParcela),
});

type ParcelaFormData = z.infer<typeof parcelaSchema>;

interface ParcelaFormProps {
    parcela: ParcelaRead; // Parcela é obrigatória para este formulário de edição
    onSuccess: () => void;
}

export function ParcelaForm({ parcela, onSuccess }: ParcelaFormProps) {
    const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<ParcelaFormData>({
        resolver: zodResolver(parcelaSchema),
        defaultValues: {
            data_pagamento: parcela.data_pagamento ? format(new Date(parcela.data_pagamento), 'yyyy-MM-dd') : undefined,
            status: parcela.status,
        },
    });

    const { mutate: atualizarParcela, isPending: isUpdating } = useAtualizarParcela();

    useEffect(() => {
        reset({
            data_pagamento: parcela.data_pagamento ? format(new Date(parcela.data_pagamento), 'yyyy-MM-dd') : undefined,
            status: parcela.status,
        });
    }, [parcela, reset]);

    const onSubmit = (data: ParcelaFormData) => {
        if (isDirty) {
            atualizarParcela({ id: parcela.id, data }, { onSuccess });
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white shadow rounded-lg">
            <h2 className="text-xl font-bold mb-4">Editar Parcela {parcela.numero_parcela}</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700">Valor da Parcela</label>
                <p className="mt-1 text-lg font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela.valor_parcela)}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                <p className="mt-1 text-lg font-semibold">{format(new Date(parcela.data_vencimento), 'dd/MM/yyyy')}</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Data de Pagamento</label>
                <input 
                    type="date" 
                    {...register('data_pagamento')} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                    {...register('status')} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                    {Object.values(StatusParcela).map((statusValue) => (
                        <option key={statusValue} value={statusValue}>{statusValue}</option>
                    ))}
                </select>
            </div>
            {errors.status && <span className="text-red-500 text-sm">{errors.status.message}</span>}
            
            <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </form>
    );
}

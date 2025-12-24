import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCriarCompromisso } from '../../hooks/useCompromissos';
import { CompromissoCreate } from '../../types/compromisso';

const schema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  tipo: z.string().min(1, 'Selecione um tipo'),
  status: z.string().default('Agendado'),
  data_hora_inicio: z.string().min(1, 'Data de início obrigatória'),
  data_hora_fim: z.string().min(1, 'Data de fim obrigatória'),
  local: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
}).refine((data) => {
    if (!data.data_hora_inicio || !data.data_hora_fim) return true;
    return new Date(data.data_hora_fim) > new Date(data.data_hora_inicio);
}, {
  message: "Data fim deve ser maior que data início",
  path: ["data_hora_fim"],
});

type FormData = z.infer<typeof schema>;

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CompromissoForm({ onSuccess, onCancel }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
        status: 'Agendado',
        tipo: 'Visita'
    }
  });
  
  const { mutate: criarCompromisso, isPending } = useCriarCompromisso();

  const onSubmit = (data: FormData) => {
    const payload: CompromissoCreate = {
        ...data,
        data_hora_inicio: new Date(data.data_hora_inicio).toISOString(),
        data_hora_fim: new Date(data.data_hora_fim).toISOString(),
    };

    criarCompromisso(payload, {
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          {...register('titulo')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          placeholder="Ex: Visita técnica"
        />
        {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
            {...register('tipo')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            >
            <option value="Visita">Visita</option>
            <option value="Instalação">Instalação</option>
            <option value="Medição">Medição</option>
            <option value="Outro">Outro</option>
            </select>
            {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo.message}</p>}
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
            {...register('status')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            >
            <option value="Agendado">Agendado</option>
            <option value="Concluído">Concluído</option>
            <option value="Cancelado">Cancelado</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Início</label>
            <input
            type="datetime-local"
            {...register('data_hora_inicio')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
            {errors.data_hora_inicio && <p className="text-red-500 text-sm mt-1">{errors.data_hora_inicio.message}</p>}
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Fim</label>
            <input
            type="datetime-local"
            {...register('data_hora_fim')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            />
            {errors.data_hora_fim && <p className="text-red-500 text-sm mt-1">{errors.data_hora_fim.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Local / Endereço</label>
        <input
          {...register('local')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          placeholder="Ex: Residência do cliente"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          {...register('descricao')}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : 'Salvar Compromisso'}
        </button>
      </div>
    </form>
  );
}
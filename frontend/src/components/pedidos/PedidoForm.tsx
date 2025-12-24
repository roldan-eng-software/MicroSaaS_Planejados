// frontend/src/components/pedidos/PedidoForm.tsx
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCriarPedido, useAtualizarPedido } from '@/hooks/usePedidos';
import { PedidoRead, PedidoStatus, ItemPedidoCreate, ItemPedidoUpdate } from '@/types/pedido';
import { v4 as uuidv4 } from 'uuid'; // Para gerar IDs temporários para itens novos

// Esquema de validação para um item do pedido
const itemPedidoSchema = z.object({
  id: z.string().optional(), // ID opcional para itens existentes
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, 'Quantidade deve ser maior que zero')
  ),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  preco_unitario: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0.01, 'Preço unitário deve ser maior que zero')
  ),
  observacoes: z.string().optional(),
});

// Esquema de validação para o pedido completo
const pedidoSchema = z.object({
  cliente_id: z.string().uuid('ID do cliente inválido'), // Assumindo UUID string
  numero: z.string().min(1, 'Número do pedido é obrigatório'),
  status: z.nativeEnum(PedidoStatus).default(PedidoStatus.AguardandoAprovacao),
  referencia: z.string().optional(),
  validade_orcamento_dias: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().min(1, 'Validade deve ser pelo menos 1 dia').optional()
  ),
  prazo_execucao_dias: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().min(0, 'Prazo de execução não pode ser negativo').optional()
  ),
  data_inicio: z.string().optional(), // Formato 'YYYY-MM-DD'
  data_fim_prevista: z.string().optional(),
  data_fim_real: z.string().optional(),
  valor_desconto: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, 'Desconto não pode ser negativo').optional()
  ),
  itens: z.array(itemPedidoSchema).min(1, 'Deve haver pelo menos um item no pedido'),
});

type PedidoFormData = z.infer<typeof pedidoSchema>;

interface PedidoFormProps {
    pedido?: PedidoRead;
    onSuccess: () => void;
}

export function PedidoForm({ pedido, onSuccess }: PedidoFormProps) {
    const { 
        register, 
        handleSubmit, 
        control, 
        formState: { errors, isDirty }, 
        reset, 
        watch,
        setValue,
    } = useForm<PedidoFormData>({
        resolver: zodResolver(pedidoSchema),
        defaultValues: {
            status: PedidoStatus.AguardandoAprovacao,
            validade_orcamento_dias: 30,
            valor_desconto: 0,
            itens: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'itens',
    });

    const { mutate: criarPedido, isPending: isCreating } = useCriarPedido();
    const { mutate: atualizarPedido, isPending: isUpdating } = useAtualizarPedido();

    const isEditMode = !!pedido;
    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (isEditMode && pedido) {
            reset({
                ...pedido,
                data_inicio: pedido.data_inicio ? new Date(pedido.data_inicio).toISOString().split('T')[0] : undefined,
                data_fim_prevista: pedido.data_fim_prevista ? new Date(pedido.data_fim_prevista).toISOString().split('T')[0] : undefined,
                data_fim_real: pedido.data_fim_real ? new Date(pedido.data_fim_real).toISOString().split('T')[0] : undefined,
                itens: pedido.itens.map(item => ({ ...item })), // Clonar itens para evitar mutação direta
            });
        } else {
            reset({
                status: PedidoStatus.AguardandoAprovacao,
                validade_orcamento_dias: 30,
                valor_desconto: 0,
                itens: [{ 
                    id: uuidv4(), // ID temporário para novo item
                    descricao: '', quantidade: 1, unidade: 'un', preco_unitario: 0, observacoes: '' 
                }],
            });
        }
    }, [pedido, isEditMode, reset]);

    const watchedItems = watch('itens');
    const watchedDesconto = watch('valor_desconto');

    // Calcular valores totais dinamicamente
    useEffect(() => {
        let subtotal = 0;
        watchedItems.forEach(item => {
            subtotal += item.quantidade * item.preco_unitario;
        });

        const total = subtotal - (watchedDesconto || 0);

        setValue('valor_subtotal', subtotal);
        setValue('valor_total', total < 0 ? 0 : total); // Evita valor total negativo
    }, [watchedItems, watchedDesconto, setValue]);


    const onSubmit = (data: PedidoFormData) => {
        const payload: PedidoCreate | PedidoUpdate = {
            ...data,
            // Ajustar o formato das datas se necessário antes de enviar para o backend
            itens: data.itens.map(item => {
                const { id, ...rest } = item; // Remover IDs temporários ou não enviar IDs para criação
                return rest as ItemPedidoCreate | ItemPedidoUpdate;
            }),
        };

        if (isEditMode) {
            if (isDirty) {
                atualizarPedido({ id: pedido.id, data: payload }, { onSuccess });
            } else {
                onSuccess();
            }
        } else {
            criarPedido(payload as PedidoCreate, { onSuccess });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{isEditMode ? 'Editar Pedido' : 'Novo Pedido'}</h2>

            {/* Campos do Pedido */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Cliente ID</label>
                <input 
                    {...register('cliente_id')} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.cliente_id && <span className="text-red-500 text-sm">{errors.cliente_id.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Número do Pedido</label>
                <input 
                    {...register('numero')} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.numero && <span className="text-red-500 text-sm">{errors.numero.message}</span>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                    {...register('status')} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                    {Object.values(PedidoStatus).map((statusValue) => (
                        <option key={statusValue} value={statusValue}>{statusValue}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data Início</label>
                    <input type="date" {...register('data_inicio')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Data Fim Prevista</label>
                    <input type="date" {...register('data_fim_prevista')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Desconto</label>
                <input 
                    type="number" 
                    step="0.01" 
                    {...register('valor_desconto')} 
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.valor_desconto && <span className="text-red-500 text-sm">{errors.valor_desconto.message}</span>}
            </div>

            {/* Itens do Pedido */}
            <h3 className="text-xl font-bold mt-6 mb-4">Itens do Pedido</h3>
            {fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded-md space-y-3 relative">
                    <button
                        type="button"
                        onClick={() => remove(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                        Remover
                    </button>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Descrição</label>
                        <input 
                            {...register(`itens.${index}.descricao`)} 
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                        {errors.itens?.[index]?.descricao && <span className="text-red-500 text-sm">{errors.itens[index]?.descricao?.message}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                {...register(`itens.${index}.quantidade`)} 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.itens?.[index]?.quantidade && <span className="text-red-500 text-sm">{errors.itens[index]?.quantidade?.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Unidade</label>
                            <input 
                                {...register(`itens.${index}.unidade`)} 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.itens?.[index]?.unidade && <span className="text-red-500 text-sm">{errors.itens[index]?.unidade?.message}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Preço Unitário</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                {...register(`itens.${index}.preco_unitario`)} 
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            />
                            {errors.itens?.[index]?.preco_unitario && <span className="text-red-500 text-sm">{errors.itens[index]?.preco_unitario?.message}</span>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Observações</label>
                        <textarea 
                            {...register(`itens.${index}.observacoes`)} 
                            rows={2}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={() => append({ 
                    id: uuidv4(), 
                    descricao: '', quantidade: 1, unidade: 'un', preco_unitario: 0, observacoes: '' 
                })}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mt-4"
            >
                Adicionar Item
            </button>

            {/* Resumo de Valores */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-lg font-medium">
                    <span>Subtotal:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(watch('valor_subtotal') || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium">
                    <span>Desconto:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(watch('valor_desconto') || 0)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(watch('valor_total') || 0)}</span>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-blue-600 text-white py-3 rounded-md shadow-md hover:bg-blue-700 disabled:bg-gray-400 mt-6"
            >
                {isPending ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Pedido')}
            </button>
            {errors.itens && <span className="text-red-500 text-sm">{errors.itens.message}</span>}

        </form>
    );
}

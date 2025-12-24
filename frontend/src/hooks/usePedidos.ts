// frontend/src/hooks/usePedidos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pedidoService from '@/services/pedido.service';
import { PedidoCreate, PedidoUpdate } from '@/types/pedido';
import { AxiosError } from 'axios';

// Hook para listar todos os pedidos
export function usePedidos() {
    return useQuery({
        queryKey: ['pedidos'],
        queryFn: () => pedidoService.listar(),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

// Hook para buscar um único pedido pelo ID
export function usePedidoPorId(id: string) {
    return useQuery({
        queryKey: ['pedidos', id],
        queryFn: () => pedidoService.obterPorId(id),
        enabled: !!id, // Só executa a query se o ID existir
    });
}

// Hook (mutation) para criar um novo pedido
export function useCriarPedido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PedidoCreate) => pedidoService.criar(data),
        onSuccess: () => {
            // Invalida o cache de 'pedidos' para forçar um refetch da lista
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao criar pedido:', error.response?.data);
            alert(`Erro ao criar pedido: ${error.response?.data || error.message}`);
        },
    });
}

// Hook (mutation) para atualizar um pedido
export function useAtualizarPedido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: PedidoUpdate }) => pedidoService.atualizar(id, data),
        onSuccess: (data) => {
            // Invalida a lista e a query específica deste pedido
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
            queryClient.setQueryData(['pedidos', data.id], data);
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao atualizar pedido:', error.response?.data);
            alert(`Erro ao atualizar pedido: ${error.response?.data || error.message}`);
        },
    });
}

// Hook (mutation) para deletar um pedido
export function useDeletarPedido() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pedidoService.deletar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pedidos'] });
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao deletar pedido:', error.response?.data);
            alert(`Erro ao deletar pedido: ${error.response?.data || error.message}`);
        },
    });
}

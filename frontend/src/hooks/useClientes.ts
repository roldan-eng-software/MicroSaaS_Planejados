import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clienteService from '@/services/cliente.service';
import { ClienteCreate, ClienteUpdate } from '@/types/cliente';
import { AxiosError } from 'axios';

// Hook para listar todos os clientes
export function useClientes() {
    return useQuery({
        queryKey: ['clientes'],
        queryFn: () => clienteService.listar(),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

// Hook para buscar um único cliente pelo ID
export function useClientePorId(id: string) {
    return useQuery({
        queryKey: ['clientes', id],
        queryFn: () => clienteService.obterPorId(id),
        enabled: !!id, // Só executa a query se o ID existir
    });
}

// Hook (mutation) para criar um novo cliente
export function useCriarCliente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: ClienteCreate) => clienteService.criar(data),
        onSuccess: () => {
            // Invalida o cache de 'clientes' para forçar um refetch da lista
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
        onError: (error: AxiosError) => {
            // Em um app real, usaríamos um sistema de notificação (toast)
            console.error('Erro ao criar cliente:', error.response?.data);
            alert(`Erro ao criar cliente: ${error.response?.data || error.message}`);
        },
    });
}

// Hook (mutation) para atualizar um cliente
export function useAtualizarCliente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: ClienteUpdate }) => clienteService.atualizar(id, data),
        onSuccess: (data) => {
            // Invalida a lista e a query específica deste cliente
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
            queryClient.setQueryData(['clientes', data.id], data);
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao atualizar cliente:', error.response?.data);
            alert(`Erro ao atualizar cliente: ${error.response?.data || error.message}`);
        },
    });
}

// Hook (mutation) para deletar um cliente
export function useDeletarCliente() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => clienteService.deletar(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao deletar cliente:', error.response?.data);
            alert(`Erro ao deletar cliente: ${error.response?.data || error.message}`);
        },
    });
}

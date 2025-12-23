import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/services/cliente.service';
import { ClienteCreate, ClienteRead } from '@/types/cliente';
import { AxiosError } from 'axios';

export function useClientes() {
    return useQuery({
        queryKey: ['clientes'],
        queryFn: () => clienteService.listar(),
        staleTime: 1000 * 60 * 5, // 5 minutos
        retry: 2,
    });
}

export function useCriarCliente() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ClienteCreate) => clienteService.criar(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao criar cliente:', error.response?.data);
        },
    });
}

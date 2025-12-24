// frontend/src/hooks/usePagamentos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pagamentoService from '@/services/pagamento.service';
import { PagamentoCreate, PagamentoUpdate, ParcelaUpdate } from '@/types/pagamento';
import { ParcelaRead } from '@/types/parcela';
import { AxiosError } from 'axios';

// --- Pagamento Hooks ---

// Hook para listar todos os pagamentos (opcionalmente por pedido)
export function usePagamentos(pedido_id?: string) {
    return useQuery({
        queryKey: ['pagamentos', pedido_id],
        queryFn: () => pagamentoService.listarPagamentos(pedido_id),
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}

// Hook para buscar um único pagamento pelo ID
export function usePagamentoPorId(id: string) {
    return useQuery({
        queryKey: ['pagamentos', id],
        queryFn: () => pagamentoService.obterPagamentoPorId(id),
        enabled: !!id,
    });
}

// Hook (mutation) para criar um novo pagamento
export function useCriarPagamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PagamentoCreate) => pagamentoService.criarPagamento(data),
        onSuccess: (newPagamento) => {
            queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
            queryClient.invalidateQueries({ queryKey: ['parcelas', newPagamento.pedido_id] });
            // Adicionar lógica para notificar o usuário
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao criar pagamento:', error.response?.data);
            alert(`Erro ao criar pagamento: ${error.response?.data || error.message}`);
        },
    });
}

// Hook (mutation) para atualizar um pagamento
export function useAtualizarPagamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: PagamentoUpdate }) => pagamentoService.atualizarPagamento(id, data),
        onSuccess: (updatedPagamento) => {
            queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
            queryClient.invalidateQueries({ queryKey: ['parcelas', updatedPagamento.pedido_id] });
            queryClient.setQueryData(['pagamentos', updatedPagamento.id], updatedPagamento);
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao atualizar pagamento:', error.response?.data);
            alert(`Erro ao atualizar pagamento: ${error.response?.data || error.message}`);
        },
    });
}

// Hook (mutation) para deletar um pagamento
export function useDeletarPagamento() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagamentoService.deletarPagamento(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao deletar pagamento:', error.response?.data);
            alert(`Erro ao deletar pagamento: ${error.response?.data || error.message}`);
        },
    });
}

// --- Parcela Hooks ---

// Hook para gerar parcelas para um pedido
export function useGerarParcelas() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ pedido_id, valor_total, num_parcelas, data_primeiro_vencimento }: { pedido_id: string; valor_total: number; num_parcelas: number; data_primeiro_vencimento: string; }) =>
            pagamentoService.gerarParcelasParaPedido(pedido_id, valor_total, num_parcelas, data_primeiro_vencimento),
        onSuccess: (newParcelas, variables) => {
            queryClient.invalidateQueries({ queryKey: ['parcelas', variables.pedido_id] });
            queryClient.invalidateQueries({ queryKey: ['pagamentos', variables.pedido_id] }); // Pode impactar o resumo de pagamentos
            // Adicionar lógica para notificar o usuário
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao gerar parcelas:', error.response?.data);
            alert(`Erro ao gerar parcelas: ${error.response?.data || error.message}`);
        },
    });
}

// Hook para listar parcelas de um pedido específico
export function useParcelasPorPedido(pedido_id: string) {
    return useQuery({
        queryKey: ['parcelas', pedido_id],
        queryFn: () => pagamentoService.listarParcelasPorPedido(pedido_id),
        enabled: !!pedido_id,
        staleTime: 1000 * 60 * 5,
    });
}

// Hook para buscar uma única parcela pelo ID
export function useParcelaPorId(id: string) {
    return useQuery({
        queryKey: ['parcelas', id],
        queryFn: () => pagamentoService.obterParcelaPorId(id),
        enabled: !!id,
    });
}

// Hook (mutation) para atualizar uma parcela
export function useAtualizarParcela() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: ParcelaUpdate }) => pagamentoService.atualizarParcela(id, data),
        onSuccess: (updatedParcela) => {
            queryClient.invalidateQueries({ queryKey: ['parcelas', updatedParcela.pedido_id] });
            queryClient.setQueryData(['parcelas', updatedParcela.id], updatedParcela);
            // Adicionar lógica para notificar o usuário
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao atualizar parcela:', error.response?.data);
            alert(`Erro ao atualizar parcela: ${error.response?.data || error.message}`);
        },
    });
}

// Hook (mutation) para marcar parcela como paga
export function useMarcarParcelaComoPaga() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagamentoService.marcarParcelaComoPaga(id),
        onSuccess: (updatedParcela) => {
            queryClient.invalidateQueries({ queryKey: ['parcelas', updatedParcela.pedido_id] });
            queryClient.setQueryData(['parcelas', updatedParcela.id], updatedParcela);
            // Adicionar lógica para notificar o usuário
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao marcar parcela como paga:', error.response?.data);
            alert(`Erro ao marcar parcela como paga: ${error.response?.data || error.message}`);
        },
    });
}

// Hook (mutation) para deletar uma parcela
export function useDeletarParcela() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => pagamentoService.deletarParcela(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
            // Invalida também a lista de parcelas de todos os pedidos, pois não sabemos qual pedido foi
            queryClient.invalidateQueries({ queryKey: ['parcelas'] }); 
            // Adicionar lógica para notificar o usuário
        },
        onError: (error: AxiosError) => {
            console.error('Erro ao deletar parcela:', error.response?.data);
            alert(`Erro ao deletar parcela: ${error.response?.data || error.message}`);
        },
    });
}

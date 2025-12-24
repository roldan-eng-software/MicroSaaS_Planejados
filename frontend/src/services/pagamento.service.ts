// frontend/src/services/pagamento.service.ts
import api from './api';
import { PagamentoRead, PagamentoCreate, PagamentoUpdate } from '@/types/pagamento'; // Criaremos este tipo
import { ParcelaRead, ParcelaUpdate } from '@/types/parcela'; // Criaremos este tipo
import { PaginatedResponse } from '@/types/api';

const pagamentoService = {
  // --- Métodos para Pagamento ---
  listarPagamentos: async (pedido_id?: string, skip: number = 0, limit: number = 10): Promise<PaginatedResponse<PagamentoRead>> => {
    const params = new URLSearchParams();
    if (pedido_id) params.append('pedido_id', pedido_id);
    params.append('skip', String(skip));
    params.append('limit', String(limit));
    const response = await api.get(`/pagamentos?${params.toString()}`);
    return {
      items: response.data,
      total: response.data.length, // Adaptação, o backend não envia total ainda
    };
  },

  obterPagamentoPorId: async (id: string): Promise<PagamentoRead> => {
    const response = await api.get(`/pagamentos/${id}`);
    return response.data;
  },

  criarPagamento: async (data: PagamentoCreate): Promise<PagamentoRead> => {
    const response = await api.post('/pagamentos', data);
    return response.data;
  },

  atualizarPagamento: async (id: string, data: PagamentoUpdate): Promise<PagamentoRead> => {
    const response = await api.put(`/pagamentos/${id}`, data);
    return response.data;
  },

  deletarPagamento: async (id: string): Promise<void> => {
    await api.delete(`/pagamentos/${id}`);
  },

  // --- Métodos para Parcela ---
  gerarParcelasParaPedido: async (pedido_id: string, valor_total: number, num_parcelas: number, data_primeiro_vencimento: string): Promise<ParcelaRead[]> => {
    const params = new URLSearchParams();
    params.append('valor_total', String(valor_total));
    params.append('num_parcelas', String(num_parcelas));
    params.append('data_primeiro_vencimento', data_primeiro_vencimento);
    const response = await api.post(`/pedidos/${pedido_id}/parcelas/gerar?${params.toString()}`);
    return response.data;
  },

  listarParcelasPorPedido: async (pedido_id: string, skip: number = 0, limit: number = 10): Promise<PaginatedResponse<ParcelaRead>> => {
    const params = new URLSearchParams();
    params.append('skip', String(skip));
    params.append('limit', String(limit));
    const response = await api.get(`/pedidos/${pedido_id}/parcelas?${params.toString()}`);
    return {
      items: response.data,
      total: response.data.length, // Adaptação
    };
  },

  obterParcelaPorId: async (id: string): Promise<ParcelaRead> => {
    const response = await api.get(`/parcelas/${id}`);
    return response.data;
  },

  atualizarParcela: async (id: string, data: ParcelaUpdate): Promise<ParcelaRead> => {
    const response = await api.put(`/parcelas/${id}`, data);
    return response.data;
  },

  marcarParcelaComoPaga: async (id: string): Promise<ParcelaRead> => {
    const response = await api.put(`/parcelas/${id}/marcar-paga`);
    return response.data;
  },

  deletarParcela: async (id: string): Promise<void> => {
    await api.delete(`/parcelas/${id}`);
  },
};

export default pagamentoService;

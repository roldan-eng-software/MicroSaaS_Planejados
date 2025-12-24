// frontend/src/services/pedido.service.ts
import api from './api';
import { PedidoRead, PedidoCreate, PedidoUpdate } from '@/types/pedido'; // Criaremos este tipo
import { PaginatedResponse } from '@/types/api';

const pedidoService = {
  listar: async (skip: number = 0, limit: number = 10): Promise<PaginatedResponse<PedidoRead>> => {
    const response = await api.get(`/pedidos?skip=${skip}&limit=${limit}`);
    return {
      items: response.data,
      total: response.data.length,
    };
  },

  obterPorId: async (id: string): Promise<PedidoRead> => {
    const response = await api.get(`/pedidos/${id}`);
    return response.data;
  },

  criar: async (data: PedidoCreate): Promise<PedidoRead> => {
    const response = await api.post('/pedidos', data);
    return response.data;
  },

  atualizar: async (id: string, data: PedidoUpdate): Promise<PedidoRead> => {
    const response = await api.put(`/pedidos/${id}`, data);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/pedidos/${id}`);
  },
};

export default pedidoService;

// frontend/src/services/cliente.service.ts
import api from './api';
import { ClienteRead, ClienteCreate, ClienteUpdate } from '@/types/cliente'; // Criaremos este tipo
import { PaginatedResponse } from '@/types/api';

const clienteService = {
  listar: async (skip: number = 0, limit: number = 10): Promise<PaginatedResponse<ClienteRead>> => {
    const response = await api.get(`/clientes?skip=${skip}&limit=${limit}`);
    // A API que implementei não retorna um objeto paginado, mas uma lista simples.
    // Vamos adaptar por enquanto e assumir que o total é o tamanho da lista retornada.
    return {
      items: response.data,
      total: response.data.length, // Isso precisaria ser melhorado no backend
    };
  },

  obterPorId: async (id: string): Promise<ClienteRead> => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  criar: async (data: ClienteCreate): Promise<ClienteRead> => {
    const response = await api.post('/clientes', data);
    return response.data;
  },

  atualizar: async (id: string, data: ClienteUpdate): Promise<ClienteRead> => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};

export default clienteService;

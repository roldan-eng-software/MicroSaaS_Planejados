import api from '@/services/api';
import { ClienteCreate, ClienteRead } from '@/types/cliente';

export const clienteService = {
    async listar(): Promise<ClienteRead[]> {
        const { data } = await api.get('/clientes');
        return data;
    },

    async obterPorId(id: string): Promise<ClienteRead> {
        const { data } = await api.get(`/clientes/${id}`);
        return data;
    },

    async criar(payload: ClienteCreate): Promise<ClienteRead> {
        const { data } = await api.post('/clientes', payload);
        return data;
    },

    async atualizar(id: string, payload: Partial<ClienteCreate>): Promise<ClienteRead> {
        const { data } = await api.put(`/clientes/${id}`, payload);
        return data;
    },

    async deletar(id: string): Promise<void> {
        await api.delete(`/clientes/${id}`);
    },
};

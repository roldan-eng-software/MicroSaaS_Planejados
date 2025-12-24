import api from './api';
import { CompromissoCreate, CompromissoUpdate, CompromissoRead } from '../types/compromisso';

export const compromissoService = {
  async listar(params?: any): Promise<CompromissoRead[]> {
    const { data } = await api.get('/compromissos', { params });
    return data;
  },

  async listarPorPeriodo(data_inicio: string, data_fim: string): Promise<CompromissoRead[]> {
    const { data } = await api.get('/compromissos/periodo', {
      params: { data_inicio, data_fim }
    });
    return data;
  },

  async obterPorId(id: string): Promise<CompromissoRead> {
    const { data } = await api.get(`/compromissos/${id}`);
    return data;
  },

  async criar(payload: CompromissoCreate): Promise<CompromissoRead> {
    const { data } = await api.post('/compromissos', payload);
    return data;
  },

  async atualizar(id: string, payload: CompromissoUpdate): Promise<CompromissoRead> {
    const { data } = await api.put(`/compromissos/${id}`, payload);
    return data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/compromissos/${id}`);
  },
};
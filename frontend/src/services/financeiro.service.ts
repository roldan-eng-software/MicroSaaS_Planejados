import api from './api';
import { DashboardData } from '../types/financeiro';

export const financeiroService = {
    async getDashboard(): Promise<DashboardData> {
        const { data } = await api.get('/financeiro/dashboard');
        return data;
    }
};
import { useQuery } from '@tanstack/react-query';
import { financeiroService } from '../services/financeiro.service';

export function useDashboardFinanceiro() {
    return useQuery({
        queryKey: ['financeiro-dashboard'],
        queryFn: financeiroService.getDashboard,
        staleTime: 1000 * 60 * 10, // Cache de 10 minutos
    });
}
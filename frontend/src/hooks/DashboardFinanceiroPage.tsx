import { useDashboardFinanceiro } from '../../hooks/useFinanceiro';
import { ResumoCards } from '../../components/Financeiro/ResumoCards';
import { GraficoReceita } from '../../components/Financeiro/GraficoReceita';

export function DashboardFinanceiroPage() {
    const { data, isLoading, error } = useDashboardFinanceiro();

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Carregando dashboard...</div>;
    }

    if (error || !data) {
        return <div className="p-8 text-center text-red-500">Erro ao carregar dados financeiros.</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard Financeiro</h1>
            
            <ResumoCards 
                totalVendas={data.resumo.total_vendas}
                qtdPedidos={data.resumo.qtd_pedidos}
                ticketMedio={data.resumo.ticket_medio}
            />

            <GraficoReceita data={data.grafico} />
        </div>
    );
}
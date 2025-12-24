export interface DashboardData {
    resumo: {
        total_vendas: number;
        qtd_pedidos: number;
        ticket_medio: number;
    };
    grafico: {
        mes: string;
        total: number;
    }[];
}
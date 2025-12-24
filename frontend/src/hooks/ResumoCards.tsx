interface Props {
    totalVendas: number;
    qtdPedidos: number;
    ticketMedio: number;
}

export function ResumoCards({ totalVendas, qtdPedidos, ticketMedio }: Props) {
    const formatCurrency = (value: number) => 
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="text-gray-500 text-sm font-medium uppercase">Total de Vendas</div>
                <div className="mt-2 text-3xl font-bold text-gray-800">
                    {formatCurrency(totalVendas)}
                </div>
                <div className="mt-1 text-sm text-green-600">
                    Receita acumulada
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="text-gray-500 text-sm font-medium uppercase">Pedidos Realizados</div>
                <div className="mt-2 text-3xl font-bold text-gray-800">
                    {qtdPedidos}
                </div>
                <div className="mt-1 text-sm text-blue-600">
                    Volume total
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="text-gray-500 text-sm font-medium uppercase">Ticket Médio</div>
                <div className="mt-2 text-3xl font-bold text-gray-800">
                    {formatCurrency(ticketMedio)}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                    Por pedido
                </div>
            </div>
        </div>
    );
}
// frontend/src/components/pedidos/PedidoList.tsx
import { useMemo, useState } from 'react';
import { usePedidos, useDeletarPedido } from '@/hooks/usePedidos';
import { 
    useReactTable, 
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';
import { PedidoRead, PedidoStatus } from '@/types/pedido';

export function PedidoList({ onEdit }: { onEdit: (pedido: PedidoRead) => void }) {
    const { data: response, isLoading, error } = usePedidos();
    const { mutate: deletarPedido } = useDeletarPedido();
    const [filterStatus, setFilterStatus] = useState<PedidoStatus | 'all'>('all');

    const filteredPedidos = useMemo(() => {
        if (filterStatus === 'all') {
            return response?.items || [];
        }
        return (response?.items || []).filter(pedido => pedido.status === filterStatus);
    }, [response, filterStatus]);

    const columns = useMemo<ColumnDef<PedidoRead>[]>(() => [
        {
            accessorKey: 'numero',
            header: 'Número',
        },
        {
            accessorKey: 'cliente_id', // Poderia ser 'cliente.nome' se o cliente fosse carregado junto
            header: 'Cliente ID',
        },
        {
            accessorKey: 'status',
            header: 'Status',
        },
        {
            accessorKey: 'valor_total',
            header: 'Valor Total',
            cell: info => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(info.getValue() as number),
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <div className="space-x-2">
                    <button 
                        onClick={() => onEdit(row.original)}
                        className="text-blue-600 hover:text-blue-900"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={() => {
                            if (window.confirm(`Tem certeza que deseja deletar o pedido ${row.original.numero}?`)) {
                                deletarPedido(row.original.id);
                            }
                        }}
                        className="text-red-600 hover:text-red-900"
                    >
                        Deletar
                    </button>
                </div>
            ),
        },
    ], [deletarPedido, onEdit]);

    const table = useReactTable({
        data: filteredPedidos,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) return <div>Carregando pedidos...</div>;
    if (error) return <div>Ocorreu um erro ao buscar os pedidos.</div>;

    return (
        <div className="overflow-x-auto">
            <div className="mb-4">
                <label htmlFor="statusFilter" className="mr-2">Filtrar por Status:</label>
                <select 
                    id="statusFilter"
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value as PedidoStatus | 'all')}
                    className="p-2 border rounded"
                >
                    <option value="all">Todos</option>
                    {Object.values(PedidoStatus).map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
            <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

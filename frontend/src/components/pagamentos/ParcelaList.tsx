// frontend/src/components/pagamentos/ParcelaList.tsx
import { useMemo } from 'react';
import { useParcelasPorPedido, useMarcarParcelaComoPaga, useDeletarParcela } from '@/hooks/usePagamentos';
import { 
    useReactTable, 
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';
import { ParcelaRead, StatusParcela } from '@/types/parcela';
import { format } from 'date-fns';

interface ParcelaListProps {
    pedidoId: string;
    onEditParcela: (parcela: ParcelaRead) => void;
}

export function ParcelaList({ pedidoId, onEditParcela }: ParcelaListProps) {
    const { data: response, isLoading, error } = useParcelasPorPedido(pedidoId);
    const { mutate: marcarComoPaga } = useMarcarParcelaComoPaga();
    const { mutate: deletarParcela } = useDeletarParcela();

    const parcelas = response?.items || [];

    const columns = useMemo<ColumnDef<ParcelaRead>[]>(() => [
        {
            accessorKey: 'numero_parcela',
            header: 'Nº',
            size: 50,
        },
        {
            accessorKey: 'valor_parcela',
            header: 'Valor',
            cell: info => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(info.getValue() as number),
        },
        {
            accessorKey: 'data_vencimento',
            header: 'Vencimento',
            cell: info => format(new Date(info.getValue() as string), 'dd/MM/yyyy'),
        },
        {
            accessorKey: 'data_pagamento',
            header: 'Data Pgto.',
            cell: info => info.getValue() ? format(new Date(info.getValue() as string), 'dd/MM/yyyy') : 'N/A',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: info => {
                const status = info.getValue() as StatusParcela;
                let colorClass = '';
                switch (status) {
                    case StatusParcela.Paga:
                        colorClass = 'bg-green-100 text-green-800';
                        break;
                    case StatusParcela.Pendente:
                        colorClass = 'bg-yellow-100 text-yellow-800';
                        break;
                    case StatusParcela.Atrasada:
                        colorClass = 'bg-red-100 text-red-800';
                        break;
                    case StatusParcela.Cancelada:
                        colorClass = 'bg-gray-100 text-gray-800';
                        break;
                }
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (
                <div className="space-x-2 flex">
                    {row.original.status === StatusParcela.Pendente && (
                        <button
                            onClick={() => marcarComoPaga(row.original.id)}
                            className="text-green-600 hover:text-green-900 text-sm"
                            title="Marcar como Paga"
                        >
                            Pagar
                        </button>
                    )}
                    <button 
                        onClick={() => onEditParcela(row.original)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                        title="Editar Parcela"
                    >
                        Editar
                    </button>
                    <button 
                        onClick={() => {
                            if (window.confirm(`Tem certeza que deseja deletar a parcela ${row.original.numero_parcela}?`)) {
                                deletarParcela(row.original.id);
                            }
                        }}
                        className="text-red-600 hover:text-red-900 text-sm"
                        title="Deletar Parcela"
                    >
                        Deletar
                    </button>
                </div>
            ),
        },
    ], [marcarComoPaga, deletarParcela, onEditParcela]);

    const table = useReactTable({
        data: parcelas,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) return <div>Carregando parcelas...</div>;
    if (error) return <div>Ocorreu um erro ao buscar as parcelas.</div>;

    return (
        <div className="overflow-x-auto">
            {parcelas.length === 0 ? (
                <p>Nenhuma parcela encontrada para este pedido.</p>
            ) : (
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
            )}
        </div>
    );
}

import { useMemo } from 'react';
import { useClientes, useDeletarCliente } from '@/hooks/useClientes';
import { 
    useReactTable, 
    getCoreRowModel,
    flexRender,
    ColumnDef,
} from '@tanstack/react-table';
import { ClienteRead } from '@/types/cliente';

export function ClienteList({ onEdit }: { onEdit: (cliente: ClienteRead) => void }) {
    const { data: response, isLoading, error } = useClientes();
    const { mutate: deletarCliente } = useDeletarCliente();

    const columns = useMemo<ColumnDef<ClienteRead>[]>(() => [
        {
            accessorKey: 'nome',
            header: 'Nome',
        },
        {
            accessorKey: 'tipo',
            header: 'Tipo',
        },
        {
            accessorKey: 'cpf_cnpj',
            header: 'Documento',
        },
        {
            accessorKey: 'email',
            header: 'Email',
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
                            if (window.confirm(`Tem certeza que deseja deletar ${row.original.nome}?`)) {
                                deletarCliente(row.original.id);
                            }
                        }}
                        className="text-red-600 hover:text-red-900"
                    >
                        Deletar
                    </button>
                </div>
            ),
        },
    ], [deletarCliente, onEdit]);

    const table = useReactTable({
        data: response?.items ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) return <div>Carregando clientes...</div>;
    if (error) return <div>Ocorreu um erro ao buscar os clientes.</div>;

    return (
        <div className="overflow-x-auto">
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

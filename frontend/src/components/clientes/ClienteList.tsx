import React from 'react';
import { useClientes } from '@/hooks/useClientes';
import { ClienteCard } from './ClienteCard';

export function ClienteList() {
    const { data: clientes, isLoading, error } = useClientes();

    if (isLoading) return <div>Carregando...</div>;
    if (error) return <div>Erro ao carregar clientes</div>;

    return (
        <div className="grid grid-cols-1 gap-4">
            {clientes?.map((cliente) => (
                <ClienteCard key={cliente.id} cliente={cliente} />
            ))}
        </div>
    );
}

// frontend/src/pages/pedidos/PedidosPage.tsx
import { useState } from 'react';
import { PedidoList } from '@/components/pedidos/PedidoList';
import { PedidoForm } from '@/components/pedidos/PedidoForm';
import { PedidoRead } from '@/types/pedido';

export default function PedidosPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingPedido, setEditingPedido] = useState<PedidoRead | undefined>(undefined);

    const handleSuccess = () => {
        setShowForm(false);
        setEditingPedido(undefined);
    };

    const handleEdit = (pedido: PedidoRead) => {
        setEditingPedido(pedido);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingPedido(undefined);
        setShowForm(true);
    }

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    {showForm ? (editingPedido ? 'Editar Pedido' : 'Novo Pedido') : 'Meus Pedidos'}
                </h1>
                {showForm ? (
                    <button
                        onClick={() => setShowForm(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Voltar para a Lista
                    </button>
                ) : (
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        + Novo Pedido
                    </button>
                )}
            </header>
            
            <main>
                {showForm ? (
                    <div className="max-w-3xl mx-auto">
                      <PedidoForm pedido={editingPedido} onSuccess={handleSuccess} />
                    </div>
                ) : (
                    <PedidoList onEdit={handleEdit} />
                )}
            </main>
        </div>
    );
}

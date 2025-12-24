// frontend/src/pages/clientes/ClientesPage.tsx
import { useState } from 'react';
import { ClienteList } from '@/components/clientes/ClienteList';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { ClienteRead } from '@/types/cliente';

export default function ClientesPage() {
    const [showForm, setShowForm] = useState(false);
    const [editingCliente, setEditingCliente] = useState<ClienteRead | undefined>(undefined);

    const handleSuccess = () => {
        setShowForm(false);
        setEditingCliente(undefined);
    };

    const handleEdit = (cliente: ClienteRead) => {
        setEditingCliente(cliente);
        setShowForm(true);
    };

    const handleAddNew = () => {
        setEditingCliente(undefined);
        setShowForm(true);
    }

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">
                    {showForm ? (editingCliente ? 'Editar Cliente' : 'Novo Cliente') : 'Meus Clientes'}
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
                        + Novo Cliente
                    </button>
                )}
            </header>
            
            <main>
                {showForm ? (
                    <div className="max-w-lg mx-auto">
                      <ClienteForm cliente={editingCliente} onSuccess={handleSuccess} />
                    </div>
                ) : (
                    <ClienteList onEdit={handleEdit} />
                )}
            </main>
        </div>
    );
}

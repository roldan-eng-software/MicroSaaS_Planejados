import { useState } from 'react';
import { AgendaCalendar } from '../../components/Compromissos/AgendaCalendar';
import { CompromissoForm } from '../../components/Compromissos/CompromissoForm';

export function AgendaPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
          <p className="text-gray-500">Visualize e gerencie seus compromissos</p>
        </div>
        <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
            Novo Compromisso
        </button>
      </div>
      
      <AgendaCalendar />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Novo Compromisso</h2>
                <CompromissoForm 
                    onSuccess={() => setIsModalOpen(false)}
                    onCancel={() => setIsModalOpen(false)}
                />
            </div>
        </div>
      )}
    </div>
  );
}
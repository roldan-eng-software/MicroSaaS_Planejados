// frontend/src/pages/pedidos/PedidoDetailPage.tsx
import { useParams } from 'react-router-dom';
import { usePedidoPorId } from '@/hooks/usePedidos';
import { useClientePorId } from '@/hooks/useClientes'; // Para buscar os dados do cliente

export default function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>(); // Pega o ID do pedido da URL

  const { data: pedido, isLoading, error } = usePedidoPorId(id || '');
  
  // Buscar o cliente associado, se o pedido for carregado
  const { data: cliente } = useClientePorId(pedido?.cliente_id || '');

  if (isLoading) return <div>Carregando detalhes do pedido...</div>;
  if (error) return <div>Erro ao carregar detalhes do pedido.</div>;
  if (!pedido) return <div>Pedido não encontrado.</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Detalhes do Pedido #{pedido.numero}</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Informações do Pedido</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Detalhes gerais do pedido e do cliente.</p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Cliente</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {cliente ? cliente.nome : pedido.cliente_id}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Número</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pedido.numero}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{pedido.status}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Valor Total</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor_total || 0)}
              </dd>
            </div>
            {/* Outros campos do pedido */}
          </dl>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Itens do Pedido</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {pedido.itens.map((item, index) => (
            <li key={item.id || index} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate">{item.descricao}</p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {item.quantidade} {item.unidade} @{' '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco_unitario)}
                  </p>
                </div>
              </div>
              {item.observacoes && (
                <div className="mt-2 text-sm text-gray-500">
                  <p>{item.observacoes}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Tabs para Financeiro, Agenda etc. seriam adicionadas aqui */}
      {/* Exemplo de estrutura para Tabs: */}
      {/* 
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Seções Adicionais</h2>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <a href="#" className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Financeiro</a>
            <a href="#" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">Agenda</a>
            // ...
          </nav>
        </div>
        // Conteúdo das abas
      </div>
      */}

    </div>
  );
}

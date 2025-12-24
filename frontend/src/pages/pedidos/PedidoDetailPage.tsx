import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api'; // Fallback se usePedido não estiver exportado
import { DownloadPedidoButton } from '../../components/Documentos/DownloadPedidoButton';
import { EnviarEmailButton } from '../../components/Documentos/EnviarEmailButton';

// Definindo interface localmente caso não esteja global
interface PedidoDetalhado {
  id: string;
  numero: string;
  status: string;
  valor_total: number;
  cliente: {
    nome: string;
    email: string;
    telefone_ddd: string;
  };
  itens: Array<{
    id: string;
    titulo: string;
    valor: number;
  }>;
}

export function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch do pedido (simulando hook usePedido se não existir)
  const { data: pedido, isLoading, error } = useQuery({
    queryKey: ['pedidos', id],
    queryFn: async () => {
      const { data } = await api.get<PedidoDetalhado>(`/pedidos/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8">Carregando detalhes do pedido...</div>;
  if (error || !pedido) return <div className="p-8 text-red-500">Erro ao carregar pedido.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate('/pedidos')}
                className="text-gray-500 hover:text-gray-700"
            >
                ← Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Pedido #{pedido.numero}</h1>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {pedido.status}
            </span>
          </div>
          <p className="text-gray-500 mt-1">Cliente: {pedido.cliente.nome}</p>
        </div>

        <div className="flex gap-2">
          <DownloadPedidoButton 
            pedidoId={pedido.id} 
            numeroPedido={pedido.numero} 
          />
          <EnviarEmailButton 
            pedidoId={pedido.id} 
            emailCliente={pedido.cliente.email} 
          />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Itens */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Itens do Pedido</h2>
            <ul className="divide-y divide-gray-100">
                {pedido.itens?.map((item) => (
                    <li key={item.id} className="py-3 flex justify-between">
                        <span>{item.titulo}</span>
                        <span className="font-medium">R$ {Number(item.valor).toFixed(2)}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {Number(pedido.valor_total).toFixed(2)}</span>
            </div>
        </div>

        {/* Coluna Direita: Info Adicional */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-fit">
            <h2 className="text-lg font-semibold mb-4">Informações</h2>
            <div className="space-y-3 text-sm">
                <div>
                    <span className="text-gray-500 block">Email</span>
                    <span>{pedido.cliente.email || '-'}</span>
                </div>
                <div>
                    <span className="text-gray-500 block">Telefone</span>
                    <span>{pedido.cliente.telefone_ddd || '-'}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
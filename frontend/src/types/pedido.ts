// frontend/src/types/pedido.ts
//import { Decimal } from 'decimal.js'; // Não é necessário importar decimal.js para tipos simples
import { ClienteRead } from './cliente';

export enum PedidoStatus {
  AguardandoAprovacao = 'Aguardando Aprovação',
  Aprovado = 'Aprovado',
  EmAndamento = 'Em Andamento',
  AguardandoPagamento = 'Aguardando Pagamento',
  Concluido = 'Concluido',
  Cancelado = 'Cancelado',
}

export interface ItemPedidoBase {
  descricao: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
  observacoes?: string;
}

export interface ItemPedidoCreate extends ItemPedidoBase {}

export interface ItemPedidoUpdate extends ItemPedidoBase {
  id?: string; // ID opcional para atualização de itens existentes
}

export interface ItemPedidoRead extends ItemPedidoBase {
  id: string;
  pedido_id: string;
  created_at: string;
  updated_at: string;
}

export interface PedidoBase {
  cliente_id: string;
  numero: string;
  status?: PedidoStatus;
  referencia?: string;
  validade_orcamento_dias?: number;
  prazo_execucao_dias?: number;
  data_inicio?: string; // Date em backend, string no frontend (ISO 8601)
  data_fim_prevista?: string;
  data_fim_real?: string;
  valor_subtotal?: number;
  valor_desconto?: number;
  valor_total?: number;
}

export interface PedidoCreate extends PedidoBase {
  itens?: ItemPedidoCreate[];
}

export interface PedidoUpdate extends PedidoBase {
  itens?: ItemPedidoUpdate[];
}

export interface PedidoRead extends PedidoBase {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  itens: ItemPedidoRead[];
  cliente?: ClienteRead; // Incluído para completar a estrutura, como comentado
}

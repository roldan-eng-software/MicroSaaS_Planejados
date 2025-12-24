// frontend/src/types/pagamento.ts

export enum MetodoPagamento {
  CartaoCredito = "Cartão de Crédito",
  Boleto = "Boleto",
  PIX = "PIX",
  TransferenciaBancaria = "Transferência Bancária",
  Dinheiro = "Dinheiro",
}

export enum StatusPagamento {
  Pendente = "Pendente",
  Pago = "Pago",
  Cancelado = "Cancelado",
  Estornado = "Estornado",
}

export interface PagamentoBase {
  pedido_id: string;
  valor: number;
  data_pagamento?: string; // ISO 8601 string
  metodo: MetodoPagamento;
  status?: StatusPagamento;
  comprovante_url?: string;
}

export interface PagamentoCreate extends PagamentoBase {}

export interface PagamentoUpdate extends Partial<PagamentoBase> {}

export interface PagamentoRead extends PagamentoBase {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

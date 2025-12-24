// frontend/src/types/parcela.ts

export enum StatusParcela {
  Pendente = "Pendente",
  Paga = "Paga",
  Atrasada = "Atrasada",
  Cancelada = "Cancelada",
}

export interface ParcelaBase {
  pedido_id: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string; // ISO 8601 string
  data_pagamento?: string; // ISO 8601 string
  status?: StatusParcela;
}

export interface ParcelaCreate extends ParcelaBase {}

export interface ParcelaUpdate extends Partial<ParcelaBase> {}

export interface ParcelaRead extends ParcelaBase {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

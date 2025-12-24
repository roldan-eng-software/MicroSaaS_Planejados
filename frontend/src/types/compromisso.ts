export interface CompromissoBase {
  titulo: string;
  descricao?: string;
  tipo: string; // 'Visita', 'Instalação', 'Medição'
  status: string; // 'Agendado', 'Concluído', 'Cancelado'
  data_hora_inicio: string; // ISO string
  data_hora_fim: string; // ISO string
  local?: string;
  endereco?: string;
  observacoes?: string;
  cliente_id?: string;
  pedido_id?: string;
}

export interface CompromissoCreate extends CompromissoBase {}

export interface CompromissoUpdate extends Partial<CompromissoBase> {}

export interface CompromissoRead extends CompromissoBase {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  // Futuramente podemos adicionar objetos aninhados de Cliente e Pedido aqui se o backend retornar
}
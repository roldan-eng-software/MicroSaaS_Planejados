// frontend/src/types/cliente.ts

export enum TipoCliente {
  PessoaFisica = 'PF',
  PessoaJuridica = 'PJ',
}

export interface ClienteBase {
  nome: string;
  tipo: TipoCliente;
  cpf_cnpj: string;
  email?: string;
  telefone_ddd?: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  uf?: string;
}

export interface ClienteCreate extends ClienteBase {}

export interface ClienteUpdate extends Partial<ClienteBase> {}

export interface ClienteRead extends ClienteBase {
  id: string; // UUID é string em TS
  tenant_id: string;
  ativo: boolean;
  created_at: string; // Datas são strings na serialização JSON
  updated_at: string;
}

// frontend/src/types/auth.ts

export interface User {
  id: string;
  tenant_id: string;
  // Adicione outros campos do usuário que você precisa
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

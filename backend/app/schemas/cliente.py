from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class ClienteBase(BaseModel):
    nome: str
    tipo: str  # 'PF' ou 'PJ'
    cpf_cnpj: str
    email: Optional[EmailStr] = None
    telefone_ddd: Optional[str] = None
    endereco: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(ClienteBase):
    pass

class ClienteRead(ClienteBase):
    id: UUID
    tenant_id: UUID
    ativo: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

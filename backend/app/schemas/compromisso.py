from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class CompromissoBase(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=255)
    descricao: Optional[str] = None
    tipo: str = Field(..., description="Tipo do compromisso: Visita, Instalação, Medição, etc")
    status: str = Field(default="Agendado")
    data_hora_inicio: datetime
    data_hora_fim: datetime
    local: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None
    cliente_id: Optional[UUID] = None
    pedido_id: Optional[UUID] = None

class CompromissoCreate(CompromissoBase):
    pass

class CompromissoUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=3, max_length=255)
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    status: Optional[str] = None
    data_hora_inicio: Optional[datetime] = None
    data_hora_fim: Optional[datetime] = None
    local: Optional[str] = None
    endereco: Optional[str] = None
    observacoes: Optional[str] = None
    cliente_id: Optional[UUID] = None
    pedido_id: Optional[UUID] = None

class CompromissoRead(CompromissoBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
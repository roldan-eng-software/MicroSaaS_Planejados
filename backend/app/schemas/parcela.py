# backend/app/schemas/parcela.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date
from decimal import Decimal
from app.models.parcela import StatusParcela # Importar o Enum do modelo

class ParcelaBase(BaseModel):
    pedido_id: UUID
    numero_parcela: int
    valor_parcela: Decimal
    data_vencimento: date
    data_pagamento: Optional[date] = None
    status: Optional[StatusParcela] = StatusParcela.pendente

class ParcelaCreate(ParcelaBase):
    pass

class ParcelaUpdate(ParcelaBase):
    pass

class ParcelaRead(ParcelaBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# backend/app/schemas/pagamento.py
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from app.models.pagamento import MetodoPagamento, StatusPagamento # Importar os Enums do modelo

class PagamentoBase(BaseModel):
    pedido_id: UUID
    valor: Decimal
    data_pagamento: Optional[datetime] = None # Pode ser definido automaticamente no backend
    metodo: MetodoPagamento
    status: Optional[StatusPagamento] = StatusPagamento.pago
    comprovante_url: Optional[str] = None

class PagamentoCreate(PagamentoBase):
    pass

class PagamentoUpdate(PagamentoBase):
    pass

class PagamentoRead(PagamentoBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

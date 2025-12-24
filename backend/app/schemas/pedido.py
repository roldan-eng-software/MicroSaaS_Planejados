# backend/app/schemas/pedido.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime, date
from decimal import Decimal
from enum import Enum

class PedidoStatus(str, Enum):
    aguardando_aprovacao = 'Aguardando Aprovação'
    aprovado = 'Aprovado'
    em_andamento = 'Em Andamento'
    aguardando_pagamento = 'Aguardando Pagamento'
    concluido = 'Concluido'
    cancelado = 'Cancelado'

class ItemPedidoBase(BaseModel):
    descricao: str
    quantidade: Decimal
    unidade: str
    preco_unitario: Decimal
    observacoes: Optional[str] = None

class ItemPedidoCreate(ItemPedidoBase):
    pass

class ItemPedidoUpdate(ItemPedidoBase):
    pass

class ItemPedidoRead(ItemPedidoBase):
    id: UUID
    pedido_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PedidoBase(BaseModel):
    cliente_id: UUID
    numero: str
    status: Optional[PedidoStatus] = PedidoStatus.aguardando_aprovacao
    referencia: Optional[str] = None
    validade_orcamento_dias: Optional[int] = 30
    prazo_execucao_dias: Optional[int] = None
    data_inicio: Optional[date] = None
    data_fim_prevista: Optional[date] = None
    data_fim_real: Optional[date] = None
    valor_subtotal: Optional[Decimal] = 0
    valor_desconto: Optional[Decimal] = 0
    valor_total: Optional[Decimal] = 0

class PedidoCreate(PedidoBase):
    itens: List[ItemPedidoCreate] = []

class PedidoUpdate(PedidoBase):
    itens: Optional[List[ItemPedidoUpdate]] = None # Para permitir atualizar itens separadamente

class PedidoRead(PedidoBase):
    id: UUID
    tenant_id: UUID
    created_at: datetime
    updated_at: datetime
    itens: List[ItemPedidoRead] = []

    class Config:
        from_attributes = True

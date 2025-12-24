# backend/app/models/parcela.py
from sqlalchemy import Column, String, Enum, Date, Numeric, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from uuid import UUID
from datetime import date

class StatusParcela(str, Enum):
    pendente = "Pendente"
    paga = "Paga"
    atrasada = "Atrasada"
    cancelada = "Cancelada"

class Parcela(BaseModel):
    """Representa uma parcela de pagamento de um pedido."""
    __tablename__ = "parcelas"

    pedido_id = Column(UUID(as_uuid=True), ForeignKey('pedidos.id'), nullable=False)
    numero_parcela = Column(Integer, nullable=False)
    valor_parcela = Column(Numeric(12, 2), nullable=False)
    data_vencimento = Column(Date, nullable=False)
    data_pagamento = Column(Date, nullable=True) # Data em que a parcela foi realmente paga
    status = Column(Enum(StatusParcela), default=StatusParcela.pendente, nullable=False)
    
    pedido = relationship("Pedido", back_populates="parcelas")

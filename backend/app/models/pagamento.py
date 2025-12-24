# backend/app/models/pagamento.py
from sqlalchemy import Column, String, Enum, DateTime, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from uuid import UUID
from datetime import datetime

class MetodoPagamento(str, Enum):
    cartao_credito = "Cartão de Crédito"
    boleto = "Boleto"
    pix = "PIX"
    transferencia = "Transferência Bancária"
    dinheiro = "Dinheiro"

class StatusPagamento(str, Enum):
    pendente = "Pendente"
    pago = "Pago"
    cancelado = "Cancelado"
    estornado = "Estornado"

class Pagamento(BaseModel):
    """Representa um pagamento realizado para um pedido."""
    __tablename__ = "pagamentos"

    pedido_id = Column(UUID(as_uuid=True), ForeignKey('pedidos.id'), nullable=False)
    valor = Column(Numeric(12, 2), nullable=False)
    data_pagamento = Column(DateTime, default=datetime.utcnow, nullable=False)
    metodo = Column(Enum(MetodoPagamento), nullable=False)
    status = Column(Enum(StatusPagamento), default=StatusPagamento.pago, nullable=False)
    comprovante_url = Column(String, nullable=True) # URL do comprovante em S3, por exemplo

    pedido = relationship("Pedido", back_populates="pagamentos")

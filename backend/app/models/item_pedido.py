# backend/app/models/item_pedido.py
from sqlalchemy import Column, String, DECIMAL, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from uuid import UUID

class ItemPedido(BaseModel):
    __tablename__ = "itens_pedido"

    pedido_id = Column(UUID(as_uuid=True), ForeignKey('pedidos.id'), nullable=False)
    descricao = Column(String, nullable=False)
    quantidade = Column(DECIMAL(10, 2), nullable=False)
    unidade = Column(String(20), nullable=False) # Ex: "m²", "un", "kg"
    preco_unitario = Column(DECIMAL(12, 2), nullable=False)
    observacoes = Column(String, nullable=True)

    pedido = relationship("Pedido", back_populates="itens")

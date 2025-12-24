from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel

class Compromisso(BaseModel):
    """Compromissos da agenda (Visitas, Instalações, Medições)"""
    __tablename__ = "compromissos"

    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    tipo = Column(String(50), nullable=False)  # Ex: 'Visita', 'Instalação', 'Medição'
    status = Column(String(50), default='Agendado')  # Ex: 'Agendado', 'Concluído', 'Cancelado'
    data_hora_inicio = Column(DateTime, nullable=False)
    data_hora_fim = Column(DateTime, nullable=False)
    
    local = Column(String(255))
    endereco = Column(String(500))
    observacoes = Column(Text)

    # Foreign Keys
    cliente_id = Column(UUID(as_uuid=True), ForeignKey("clientes.id"), nullable=True)
    pedido_id = Column(UUID(as_uuid=True), ForeignKey("pedidos.id"), nullable=True)

    # Relationships
    cliente = relationship("Cliente", backref="compromissos")
    pedido = relationship("Pedido", backref="compromissos")
from sqlalchemy import Column, String, Enum, Date, DateTime, Numeric, ForeignKey, Integer, UUID
from .base import BaseModel

class Pedido(BaseModel):
    """Pedido/Ordem de trabalho"""
    __tablename__ = "pedidos"
    
    cliente_id = Column(UUID(as_uuid=True), ForeignKey('clientes.id'), nullable=False)
    numero = Column(String(50), nullable=False, index=True)  # "021-2025"
    status = Column(Enum(
        'Aguardando Aprovação',
        'Aprovado',
        'Em Andamento',
        'Aguardando Pagamento',
        'Concluído',
        'Cancelado'
    ), default='Aguardando Aprovação')
    referencia = Column(String(255))
    validade_orcamento_dias = Column(Integer, default=30)
    prazo_execucao_dias = Column(Integer)
    data_inicio = Column(Date)
    data_fim_prevista = Column(Date)
    data_fim_real = Column(Date)
    valor_subtotal = Column(Numeric(12, 2), default=0)
    valor_desconto = Column(Numeric(12, 2), default=0)
    valor_total = Column(Numeric(12, 2), default=0)

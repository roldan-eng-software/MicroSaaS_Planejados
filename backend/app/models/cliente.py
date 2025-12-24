from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum
from .base import BaseModel

class Cliente(BaseModel):
    """Cliente do marceneiro"""
    __tablename__ = "clientes"
    
    nome = Column(String(255), nullable=False)
    tipo = Column(Enum('PF', 'PJ'), nullable=False)
    cpf_cnpj = Column(String(20), nullable=False)
    email = Column(String(255))
    telefone_ddd = Column(String(20))
    endereco = Column(String(500))
    cep = Column(String(10))
    cidade = Column(String(100))
    uf = Column(String(2))
    ativo = Column(Boolean, default=True)


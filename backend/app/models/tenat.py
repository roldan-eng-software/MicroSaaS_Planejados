from sqlalchemy import Column, String, Enum, DateTime, Boolean
from .base import BaseModel

class Tenant(BaseModel):
    """Empresa cliente do SaaS"""
    __tablename__ = "tenants"
    
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(20), unique=True, nullable=False, index=True)
    email_suporte = Column(String(255), nullable=False)
    telefone = Column(String(20))
    endereco = Column(String(500))
    plano = Column(Enum('Starter', 'Pro', 'Enterprise'), default='Starter')
    ativo = Column(Boolean, default=True)
    data_expiracao_plano = Column(DateTime)

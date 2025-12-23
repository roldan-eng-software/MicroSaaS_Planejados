from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate
from uuid import UUID

class ClienteRepository:
    def __init__(self, db: Session):
        self.db = db
    
    async def criar(self, tenant_id: UUID, schema: ClienteCreate) -> Cliente:
        db_cliente = Cliente(
            tenant_id=tenant_id,
            **schema.dict()
        )
        self.db.add(db_cliente)
        self.db.commit()
        self.db.refresh(db_cliente)
        return db_cliente
    
    async def listar(self, tenant_id: UUID, skip: int = 0, limit: int = 10) -> list[Cliente]:
        return self.db.query(Cliente).filter(
            Cliente.tenant_id == tenant_id
        ).offset(skip).limit(limit).all()
    
    async def obter_por_id(self, tenant_id: UUID, cliente_id: UUID) -> Cliente:
        return self.db.query(Cliente).filter(
            Cliente.tenant_id == tenant_id,
            Cliente.id == cliente_id
        ).first()
    
    async def atualizar(self, tenant_id: UUID, cliente_id: UUID, schema: ClienteUpdate) -> Cliente:
        db_cliente = await self.obter_por_id(tenant_id, cliente_id)
        if not db_cliente:
            return None
        
        for key, value in schema.dict(exclude_unset=True).items():
            setattr(db_cliente, key, value)
        
        self.db.commit()
        self.db.refresh(db_cliente)
        return db_cliente
    
    async def deletar(self, tenant_id: UUID, cliente_id: UUID) -> bool:
        db_cliente = await self.obter_por_id(tenant_id, cliente_id)
        if not db_cliente:
            return False
        
        self.db.delete(db_cliente)
        self.db.commit()
        return True

from sqlalchemy.orm import Session
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate
from uuid import UUID

class ClienteRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def criar(self, tenant_id: UUID, schema: ClienteCreate) -> Cliente:
        db_cliente = Cliente(
            tenant_id=tenant_id,
            **schema.model_dump()
        )
        self.db.add(db_cliente)
        self.db.commit()
        self.db.refresh(db_cliente)
        return db_cliente
    
    def listar(self, tenant_id: UUID, skip: int = 0, limit: int = 10) -> list[Cliente]:
        return self.db.query(Cliente).filter(
            Cliente.tenant_id == tenant_id
        ).offset(skip).limit(limit).all()
    
    def obter_por_id(self, tenant_id: UUID, cliente_id: UUID) -> Cliente | None:
        return self.db.query(Cliente).filter(
            Cliente.tenant_id == tenant_id,
            Cliente.id == cliente_id
        ).first()
    
    def atualizar(self, tenant_id: UUID, cliente_id: UUID, schema: ClienteUpdate) -> Cliente | None:
        db_cliente = self.obter_por_id(tenant_id, cliente_id)
        if not db_cliente:
            return None
        
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_cliente, key, value)
        
        self.db.commit()
        self.db.refresh(db_cliente)
        return db_cliente
    
    def deletar(self, tenant_id: UUID, cliente_id: UUID) -> bool:
        db_cliente = self.obter_por_id(tenant_id, cliente_id)
        if not db_cliente:
            return False
        
        self.db.delete(db_cliente)
        self.db.commit()
        return True

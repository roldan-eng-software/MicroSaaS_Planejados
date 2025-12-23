from app.repos.cliente_repo import ClienteRepository
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteRead
from uuid import UUID

class ClienteService:
    def __init__(self, repo: ClienteRepository):
        self.repo = repo
    
    async def criar_cliente(self, tenant_id: UUID, schema: ClienteCreate) -> ClienteRead:
        # Validações de negócio
        if schema.tipo == 'PF' and len(schema.cpf_cnpj) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        
        if schema.tipo == 'PJ' and len(schema.cpf_cnpj) != 14:
            raise ValueError("CNPJ deve ter 14 dígitos")
        
        db_cliente = await self.repo.criar(tenant_id, schema)
        return ClienteRead.from_orm(db_cliente)
    
    async def listar_clientes(self, tenant_id: UUID, skip: int = 0, limit: int = 10):
        clientes = await self.repo.listar(tenant_id, skip, limit)
        return [ClienteRead.from_orm(c) for c in clientes]

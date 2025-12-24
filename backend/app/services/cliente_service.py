from fastapi import HTTPException, status
from app.repos.cliente_repo import ClienteRepository
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteRead
from uuid import UUID

class ClienteService:
    def __init__(self, repo: ClienteRepository):
        self.repo = repo
    
    def criar_cliente(self, tenant_id: UUID, schema: ClienteCreate) -> ClienteRead:
        # Validações de negócio
        if schema.tipo == 'PF' and len(schema.cpf_cnpj) != 11:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CPF deve ter 11 dígitos")
        
        if schema.tipo == 'PJ' and len(schema.cpf_cnpj) != 14:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CNPJ deve ter 14 dígitos")
        
        # Poderia verificar duplicidade de CPF/CNPJ aqui
        
        db_cliente = self.repo.criar(tenant_id, schema)
        return ClienteRead.from_attributes(db_cliente)
    
    def listar_clientes(self, tenant_id: UUID, skip: int = 0, limit: int = 10) -> list[ClienteRead]:
        clientes = self.repo.listar(tenant_id, skip, limit)
        return [ClienteRead.from_attributes(c) for c in clientes]

    def obter_cliente(self, tenant_id: UUID, cliente_id: UUID) -> ClienteRead:
        db_cliente = self.repo.obter_por_id(tenant_id, cliente_id)
        if not db_cliente:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
        return ClienteRead.from_attributes(db_cliente)

    def atualizar_cliente(self, tenant_id: UUID, cliente_id: UUID, schema: ClienteUpdate) -> ClienteRead:
        # Validações de negócio podem ser adicionadas aqui
        db_cliente = self.repo.atualizar(tenant_id, cliente_id, schema)
        if not db_cliente:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
        return ClienteRead.from_attributes(db_cliente)

    def deletar_cliente(self, tenant_id: UUID, cliente_id: UUID):
        success = self.repo.deletar(tenant_id, cliente_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
        return {"detail": "Cliente deletado com sucesso"}

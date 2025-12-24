from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteRead
from app.services.cliente_service import ClienteService
from app.repos.cliente_repo import ClienteRepository
from app.core.database import get_db
from app.dependencies import get_current_tenant_id

router = APIRouter(prefix="/clientes", tags=["Clientes"])

# Dependency para injetar o serviço
def get_cliente_service(db: Session = Depends(get_db)) -> ClienteService:
    repo = ClienteRepository(db)
    return ClienteService(repo)

@router.post("/", response_model=ClienteRead, status_code=status.HTTP_201_CREATED)
def criar_cliente(
    schema: ClienteCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: ClienteService = Depends(get_cliente_service)
):
    """Cria um novo cliente para o tenant logado."""
    return service.criar_cliente(tenant_id, schema)

@router.get("/", response_model=List[ClienteRead])
def listar_clientes(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: ClienteService = Depends(get_cliente_service),
    skip: int = 0,
    limit: int = 100
):
    """Lista os clientes do tenant logado."""
    return service.listar_clientes(tenant_id, skip, limit)

@router.get("/{cliente_id}", response_model=ClienteRead)
def obter_cliente(
    cliente_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: ClienteService = Depends(get_cliente_service)
):
    """Obtém um cliente específico pelo ID."""
    return service.obter_cliente(tenant_id, cliente_id)

@router.put("/{cliente_id}", response_model=ClienteRead)
def atualizar_cliente(
    cliente_id: UUID,
    schema: ClienteUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: ClienteService = Depends(get_cliente_service)
):
    """Atualiza um cliente específico."""
    return service.atualizar_cliente(tenant_id, cliente_id, schema)

@router.delete("/{cliente_id}", status_code=status.HTTP_200_OK)
def deletar_cliente(
    cliente_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: ClienteService = Depends(get_cliente_service)
):
    """Deleta um cliente específico."""
    return service.deletar_cliente(tenant_id, cliente_id)

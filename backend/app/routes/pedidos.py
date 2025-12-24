# backend/app/routes/pedidos.py
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.schemas.pedido import PedidoCreate, PedidoUpdate, PedidoRead
from app.services.pedido_service import PedidoService
from app.repos.pedido_repo import PedidoRepository
from app.core.database import get_db
from app.dependencies import get_current_tenant_id

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

# Dependency para injetar o serviço
def get_pedido_service(db: Session = Depends(get_db)) -> PedidoService:
    repo = PedidoRepository(db)
    return PedidoService(repo)

@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def criar_pedido(
    schema: PedidoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PedidoService = Depends(get_pedido_service)
):
    """Cria um novo pedido para o tenant logado."""
    return service.criar_pedido(tenant_id, schema)

@router.get("/", response_model=List[PedidoRead])
def listar_pedidos(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PedidoService = Depends(get_pedido_service),
    skip: int = 0,
    limit: int = 100
):
    """Lista os pedidos do tenant logado."""
    return service.listar_pedidos(tenant_id, skip, limit)

@router.get("/{pedido_id}", response_model=PedidoRead)
def obter_pedido(
    pedido_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PedidoService = Depends(get_pedido_service)
):
    """Obtém um pedido específico pelo ID."""
    return service.obter_pedido(tenant_id, pedido_id)

@router.put("/{pedido_id}", response_model=PedidoRead)
def atualizar_pedido(
    pedido_id: UUID,
    schema: PedidoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PedidoService = Depends(get_pedido_service)
):
    """Atualiza um pedido específico."""
    return service.atualizar_pedido(tenant_id, pedido_id, schema)

@router.delete("/{pedido_id}", status_code=status.HTTP_200_OK)
def deletar_pedido(
    pedido_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PedidoService = Depends(get_pedido_service)
):
    """Deleta um pedido específico."""
    return service.deletar_pedido(tenant_id, pedido_id)

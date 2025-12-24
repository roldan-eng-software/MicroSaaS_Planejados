from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from datetime import datetime

from app.schemas.compromisso import CompromissoCreate, CompromissoUpdate, CompromissoRead
from app.services.compromisso_service import CompromissoService
from app.repos.compromisso_repo import CompromissoRepository
from app.core.database import get_db
from app.dependencies import get_current_tenant_id

router = APIRouter(prefix="/compromissos", tags=["Compromissos"])

# Dependency para injetar o serviço
def get_compromisso_service(db: Session = Depends(get_db)) -> CompromissoService:
    repo = CompromissoRepository(db)
    return CompromissoService(repo)

@router.post("/", response_model=CompromissoRead, status_code=status.HTTP_201_CREATED)
def criar_compromisso(
    schema: CompromissoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CompromissoService = Depends(get_compromisso_service)
):
    """Cria um novo compromisso para o tenant logado."""
    return service.criar_compromisso(tenant_id, schema)

@router.get("/", response_model=List[CompromissoRead])
def listar_compromissos(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CompromissoService = Depends(get_compromisso_service),
    skip: int = 0,
    limit: int = 100,
    cliente_id: Optional[UUID] = None,
    pedido_id: Optional[UUID] = None,
    status: Optional[str] = None,
    tipo: Optional[str] = None,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None
):
    """Lista os compromissos do tenant logado com filtros opcionais."""
    return service.listar_compromissos(
        tenant_id, skip, limit, cliente_id, pedido_id,
        status, tipo, data_inicio, data_fim
    )

@router.get("/periodo", response_model=List[CompromissoRead])
def listar_compromissos_por_periodo(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CompromissoService = Depends(get_compromisso_service),
    data_inicio: datetime = Query(..., description="Data/hora de início do período"),
    data_fim: datetime = Query(..., description="Data/hora de fim do período")
):
    """Lista compromissos que ocorrem dentro do período especificado (útil para calendário)."""
    return service.listar_por_periodo(tenant_id, data_inicio, data_fim)

@router.get("/{compromisso_id}", response_model=CompromissoRead)
def obter_compromisso(
    compromisso_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CompromissoService = Depends(get_compromisso_service)
):
    """Obtém um compromisso específico pelo ID."""
    return service.obter_compromisso(tenant_id, compromisso_id)

@router.put("/{compromisso_id}", response_model=CompromissoRead)
def atualizar_compromisso(
    compromisso_id: UUID,
    schema: CompromissoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CompromissoService = Depends(get_compromisso_service)
):
    """Atualiza um compromisso específico."""
    return service.atualizar_compromisso(tenant_id, compromisso_id, schema)

@router.delete("/{compromisso_id}", status_code=status.HTTP_200_OK)
def deletar_compromisso(
    compromisso_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: CompromissoService = Depends(get_compromisso_service)
):
    """Deleta um compromisso específico."""
    return service.deletar_compromisso(tenant_id, compromisso_id)

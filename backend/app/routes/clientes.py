from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteRead
from app.services.cliente_service import ClienteService
from app.repos.cliente_repo import ClienteRepository
from app.core.database import get_db
from app.dependencies import get_current_tenant_id

router = APIRouter(prefix="/clientes", tags=["clientes"])

@router.post("/", response_model=ClienteRead, status_code=201)
async def criar_cliente(
    schema: ClienteCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    service = ClienteService(repo)
    return await service.criar_cliente(tenant_id, schema)

@router.get("/", response_model=list[ClienteRead])
async def listar_clientes(
    skip: int = 0,
    limit: int = 10,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    service = ClienteService(repo)
    return await service.listar_clientes(tenant_id, skip, limit)

@router.get("/{cliente_id}", response_model=ClienteRead)
async def obter_cliente(
    cliente_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    cliente = await repo.obter_por_id(tenant_id, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return ClienteRead.from_orm(cliente)

@router.put("/{cliente_id}", response_model=ClienteRead)
async def atualizar_cliente(
    cliente_id: UUID,
    schema: ClienteUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    cliente = await repo.atualizar(tenant_id, cliente_id, schema)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return ClienteRead.from_orm(cliente)

@router.delete("/{cliente_id}", status_code=204)
async def deletar_cliente(
    cliente_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    sucesso = await repo.deletar(tenant_id, cliente_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return None

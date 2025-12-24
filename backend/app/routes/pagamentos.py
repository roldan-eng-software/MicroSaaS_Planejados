# backend/app/routes/pagamentos.py
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from datetime import date

from app.schemas.pagamento import PagamentoCreate, PagamentoUpdate, PagamentoRead
from app.schemas.parcela import ParcelaCreate, ParcelaUpdate, ParcelaRead
from app.services.pagamento_service import PagamentoService
from app.repos.pagamento_repo import PagamentoRepository
from app.core.database import get_db
from app.dependencies import get_current_tenant_id

router = APIRouter(prefix="", tags=["Pagamentos e Parcelas"]) # Prefixo vazio para permitir rotas aninhadas e diretas

# Dependency para injetar o serviço
def get_pagamento_service(db: Session = Depends(get_db)) -> PagamentoService:
    repo = PagamentoRepository(db)
    return PagamentoService(repo)

# --- Rotas para Pagamento ---
@router.post("/pagamentos", response_model=PagamentoRead, status_code=status.HTTP_201_CREATED)
def criar_pagamento(
    schema: PagamentoCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Cria um novo pagamento."""
    return service.criar_pagamento(tenant_id, schema)

@router.get("/pagamentos", response_model=List[PagamentoRead])
def listar_pagamentos(
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service),
    pedido_id: Optional[UUID] = Query(None, description="Filtrar pagamentos por ID do Pedido"),
    skip: int = 0,
    limit: int = 100
):
    """Lista os pagamentos."""
    return service.listar_pagamentos(tenant_id, pedido_id, skip, limit)

@router.get("/pagamentos/{pagamento_id}", response_model=PagamentoRead)
def obter_pagamento(
    pagamento_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Obtém um pagamento específico pelo ID."""
    return service.obter_pagamento(tenant_id, pagamento_id)

@router.put("/pagamentos/{pagamento_id}", response_model=PagamentoRead)
def atualizar_pagamento(
    pagamento_id: UUID,
    schema: PagamentoUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Atualiza um pagamento específico."""
    return service.atualizar_pagamento(tenant_id, pagamento_id, schema)

@router.delete("/pagamentos/{pagamento_id}", status_code=status.HTTP_200_OK)
def deletar_pagamento(
    pagamento_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Deleta um pagamento específico."""
    return service.deletar_pagamento(tenant_id, pagamento_id)

# --- Rotas para Parcela ---
@router.post("/pedidos/{pedido_id}/parcelas/gerar", response_model=List[ParcelaRead], status_code=status.HTTP_201_CREATED)
def gerar_parcelas_para_pedido_route(
    pedido_id: UUID,
    valor_total: Decimal = Query(..., description="Valor total para gerar as parcelas"),
    num_parcelas: int = Query(..., description="Número de parcelas"),
    data_primeiro_vencimento: date = Query(..., description="Data do primeiro vencimento (YYYY-MM-DD)"),
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Gera um conjunto de parcelas para um pedido."""
    return service.gerar_parcelas_para_pedido(tenant_id, pedido_id, valor_total, num_parcelas, data_primeiro_vencimento)

@router.get("/pedidos/{pedido_id}/parcelas", response_model=List[ParcelaRead])
def listar_parcelas_por_pedido_route(
    pedido_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service),
    skip: int = 0,
    limit: int = 100
):
    """Lista as parcelas de um pedido específico."""
    return service.listar_parcelas_por_pedido(tenant_id, pedido_id, skip, limit)

@router.get("/parcelas/{parcela_id}", response_model=ParcelaRead)
def obter_parcela(
    parcela_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Obtém uma parcela específica pelo ID."""
    return service.obter_parcela(tenant_id, parcela_id)

@router.put("/parcelas/{parcela_id}", response_model=ParcelaRead)
def atualizar_parcela(
    parcela_id: UUID,
    schema: ParcelaUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Atualiza uma parcela específica."""
    return service.atualizar_parcela(tenant_id, parcela_id, schema)

@router.put("/parcelas/{parcela_id}/marcar-paga", response_model=ParcelaRead)
def marcar_parcela_como_paga_route(
    parcela_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Marca uma parcela específica como paga."""
    return service.marcar_parcela_como_paga(tenant_id, parcela_id)

@router.delete("/parcelas/{parcela_id}", status_code=status.HTTP_200_OK)
def deletar_parcela(
    parcela_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    service: PagamentoService = Depends(get_pagamento_service)
):
    """Deleta uma parcela específica."""
    return service.deletar_parcela(tenant_id, parcela_id)

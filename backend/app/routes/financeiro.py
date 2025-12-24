from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, timedelta

from app.core.database import get_db
from app.dependencies import get_current_tenant_id
from app.models.pedido import Pedido

router = APIRouter(prefix="/financeiro", tags=["Financeiro"])

@router.get("/dashboard")
def get_dashboard_data(
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Retorna dados agregados para o dashboard financeiro.
    """
    # 1. Resumo Geral (KPIs)
    # Consideramos apenas pedidos não cancelados
    query_base = db.query(Pedido).filter(
        Pedido.tenant_id == tenant_id,
        Pedido.status != 'Cancelado'
    )

    total_vendas = query_base.with_entities(func.sum(Pedido.valor_total)).scalar() or 0
    qtd_pedidos = query_base.count()
    ticket_medio = total_vendas / qtd_pedidos if qtd_pedidos > 0 else 0

    # 2. Gráfico: Evolução últimos 6 meses
    hoje = datetime.now()
    seis_meses_atras = hoje - timedelta(days=180)
    
    # Agrupamento por mês (PostgreSQL specific: to_char)
    vendas_por_mes = db.query(
        func.to_char(Pedido.created_at, 'YYYY-MM').label('mes'),
        func.sum(Pedido.valor_total).label('total')
    ).filter(
        Pedido.tenant_id == tenant_id,
        Pedido.created_at >= seis_meses_atras,
        Pedido.status != 'Cancelado'
    ).group_by('mes').order_by('mes').all()

    return {
        "resumo": {
            "total_vendas": float(total_vendas),
            "qtd_pedidos": qtd_pedidos,
            "ticket_medio": float(ticket_medio)
        },
        "grafico": [{"mes": v.mes, "total": float(v.total)} for v in vendas_por_mes]
    }
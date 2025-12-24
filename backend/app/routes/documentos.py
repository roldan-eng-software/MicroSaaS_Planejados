from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel, EmailStr

from app.services.documento_service import DocumentoService
from app.repos.pedido_repo import PedidoRepository
from app.core.database import get_db
from app.dependencies import get_current_tenant_id
from app.tasks.email import enviar_pedido_email_task

router = APIRouter(prefix="/documentos", tags=["Documentos"])

@router.get("/pedidos/{pedido_id}/pdf")
def download_pedido_pdf(
    pedido_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Gera e retorna o PDF de um pedido/orçamento.
    """
    # Busca o pedido (garantindo isolamento por tenant)
    pedido_repo = PedidoRepository(db)
    pedido = pedido_repo.obter_por_id(tenant_id, pedido_id)
    
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado"
        )

    # Gera o PDF
    service = DocumentoService()
    pdf_bytes = service.gerar_pdf_pedido(pedido)

    # Retorna como arquivo para download
    filename = f"pedido_{pedido.numero}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

class EmailRequest(BaseModel):
    email: EmailStr

@router.post("/pedidos/{pedido_id}/email", status_code=status.HTTP_202_ACCEPTED)
def enviar_pedido_por_email(
    pedido_id: UUID,
    request: EmailRequest,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Dispara o envio do PDF do pedido por e-mail em background.
    """
    # Verifica se o pedido existe antes de enfileirar a task
    pedido_repo = PedidoRepository(db)
    pedido = pedido_repo.obter_por_id(tenant_id, pedido_id)
    
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado"
        )

    # Enfileira a task no Celery
    enviar_pedido_email_task.delay(str(tenant_id), str(pedido_id), request.email)
    
    return {"message": "Envio de e-mail iniciado com sucesso"}
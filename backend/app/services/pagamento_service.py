# backend/app/services/pagamento_service.py
from fastapi import HTTPException, status
from app.repos.pagamento_repo import PagamentoRepository
from app.schemas.pagamento import PagamentoCreate, PagamentoUpdate, PagamentoRead
from app.schemas.parcela import ParcelaCreate, ParcelaUpdate, ParcelaRead, StatusParcela
from uuid import UUID
from typing import List, Optional
from datetime import date, timedelta
from decimal import Decimal

class PagamentoService:
    def __init__(self, repo: PagamentoRepository):
        self.repo = repo
    
    # --- Métodos para Pagamento ---
    def criar_pagamento(self, tenant_id: UUID, schema: PagamentoCreate) -> PagamentoRead:
        db_pagamento = self.repo.criar_pagamento(tenant_id, schema)
        return PagamentoRead.from_attributes(db_pagamento)
    
    def listar_pagamentos(self, tenant_id: UUID, pedido_id: Optional[UUID] = None, skip: int = 0, limit: int = 10) -> List[PagamentoRead]:
        pagamentos = self.repo.listar_pagamentos(tenant_id, pedido_id, skip, limit)
        return [PagamentoRead.from_attributes(p) for p in pagamentos]

    def obter_pagamento(self, tenant_id: UUID, pagamento_id: UUID) -> PagamentoRead:
        db_pagamento = self.repo.obter_pagamento_por_id(tenant_id, pagamento_id)
        if not db_pagamento:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pagamento não encontrado")
        return PagamentoRead.from_attributes(db_pagamento)

    def atualizar_pagamento(self, tenant_id: UUID, pagamento_id: UUID, schema: PagamentoUpdate) -> PagamentoRead:
        db_pagamento = self.repo.atualizar_pagamento(tenant_id, pagamento_id, schema)
        if not db_pagamento:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pagamento não encontrado")
        return PagamentoRead.from_attributes(db_pagamento)

    def deletar_pagamento(self, tenant_id: UUID, pagamento_id: UUID):
        success = self.repo.deletar_pagamento(tenant_id, pagamento_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pagamento não encontrado")
        return {"detail": "Pagamento deletado com sucesso"}
    
    # --- Métodos para Parcela ---
    def gerar_parcelas_para_pedido(
        self, 
        tenant_id: UUID, 
        pedido_id: UUID, 
        valor_total: Decimal, 
        num_parcelas: int, 
        data_primeiro_vencimento: date
    ) -> List[ParcelaRead]:
        if num_parcelas <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Número de parcelas deve ser maior que zero")
        if valor_total <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Valor total deve ser maior que zero")

        valor_por_parcela = (valor_total / Decimal(num_parcelas)).quantize(Decimal('0.01'))
        parcelas_schemas: List[ParcelaCreate] = []

        for i in range(num_parcelas):
            data_vencimento = data_primeiro_vencimento + timedelta(days=30 * i) # Intervalo de 30 dias
            parcelas_schemas.append(ParcelaCreate(
                pedido_id=pedido_id,
                numero_parcela=i + 1,
                valor_parcela=valor_por_parcela,
                data_vencimento=data_vencimento,
                status=StatusParcela.pendente # Novas parcelas são sempre pendentes
            ))
        
        db_parcelas = self.repo.criar_parcelas_em_lote(tenant_id, pedido_id, parcelas_schemas)
        return [ParcelaRead.from_attributes(p) for p in db_parcelas]

    def listar_parcelas_por_pedido(self, tenant_id: UUID, pedido_id: UUID, skip: int = 0, limit: int = 10) -> List[ParcelaRead]:
        parcelas = self.repo.listar_parcelas_por_pedido(tenant_id, pedido_id, skip, limit)
        return [ParcelaRead.from_attributes(p) for p in parcelas]

    def obter_parcela(self, tenant_id: UUID, parcela_id: UUID) -> ParcelaRead:
        db_parcela = self.repo.obter_parcela_por_id(tenant_id, parcela_id)
        if not db_parcela:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcela não encontrada")
        return ParcelaRead.from_attributes(db_parcela)
    
    def atualizar_parcela(self, tenant_id: UUID, parcela_id: UUID, schema: ParcelaUpdate) -> ParcelaRead:
        db_parcela = self.repo.atualizar_parcela(tenant_id, parcela_id, schema)
        if not db_parcela:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcela não encontrada")
        return ParcelaRead.from_attributes(db_parcela)

    def marcar_parcela_como_paga(self, tenant_id: UUID, parcela_id: UUID) -> ParcelaRead:
        db_parcela = self.repo.obter_parcela_por_id(tenant_id, parcela_id)
        if not db_parcela:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcela não encontrada")
        
        # Lógica para marcar como paga
        db_parcela.status = StatusParcela.paga
        db_parcela.data_pagamento = date.today() # Define a data de pagamento como hoje
        self.repo.db.commit()
        self.repo.db.refresh(db_parcela)
        return ParcelaRead.from_attributes(db_parcela)

    def deletar_parcela(self, tenant_id: UUID, parcela_id: UUID):
        success = self.repo.deletar_parcela(tenant_id, parcela_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parcela não encontrada")
        return {"detail": "Parcela deletada com sucesso"}

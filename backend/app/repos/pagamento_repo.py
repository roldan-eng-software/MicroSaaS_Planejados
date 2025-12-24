# backend/app/repos/pagamento_repo.py
from sqlalchemy.orm import Session
from app.models.pagamento import Pagamento
from app.models.parcela import Parcela
from app.schemas.pagamento import PagamentoCreate, PagamentoUpdate
from app.schemas.parcela import ParcelaCreate, ParcelaUpdate
from uuid import UUID
from typing import List, Optional

class PagamentoRepository:
    def __init__(self, db: Session):
        self.db = db
    
    # --- Métodos para Pagamento ---
    def criar_pagamento(self, tenant_id: UUID, schema: PagamentoCreate) -> Pagamento:
        db_pagamento = Pagamento(
            tenant_id=tenant_id,
            **schema.model_dump()
        )
        self.db.add(db_pagamento)
        self.db.commit()
        self.db.refresh(db_pagamento)
        return db_pagamento
    
    def listar_pagamentos(self, tenant_id: UUID, pedido_id: Optional[UUID] = None, skip: int = 0, limit: int = 10) -> List[Pagamento]:
        query = self.db.query(Pagamento).filter(Pagamento.tenant_id == tenant_id)
        if pedido_id:
            query = query.filter(Pagamento.pedido_id == pedido_id)
        return query.offset(skip).limit(limit).all()
    
    def obter_pagamento_por_id(self, tenant_id: UUID, pagamento_id: UUID) -> Pagamento | None:
        return self.db.query(Pagamento).filter(
            Pagamento.tenant_id == tenant_id,
            Pagamento.id == pagamento_id
        ).first()
    
    def atualizar_pagamento(self, tenant_id: UUID, pagamento_id: UUID, schema: PagamentoUpdate) -> Pagamento | None:
        db_pagamento = self.obter_pagamento_por_id(tenant_id, pagamento_id)
        if not db_pagamento:
            return None
        
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_pagamento, key, value)
        
        self.db.commit()
        self.db.refresh(db_pagamento)
        return db_pagamento
    
    def deletar_pagamento(self, tenant_id: UUID, pagamento_id: UUID) -> bool:
        db_pagamento = self.obter_pagamento_por_id(tenant_id, pagamento_id)
        if not db_pagamento:
            return False
        
        self.db.delete(db_pagamento)
        self.db.commit()
        return True
    
    # --- Métodos para Parcela ---
    def criar_parcelas_em_lote(self, tenant_id: UUID, pedido_id: UUID, schemas: List[ParcelaCreate]) -> List[Parcela]:
        db_parcelas = []
        for schema in schemas:
            db_parcela = Parcela(
                tenant_id=tenant_id,
                pedido_id=pedido_id,
                **schema.model_dump()
            )
            self.db.add(db_parcela)
            db_parcelas.append(db_parcela)
        self.db.commit()
        for parcela in db_parcelas: # Refresh para obter IDs e outros campos padrão
            self.db.refresh(parcela)
        return db_parcelas
    
    def listar_parcelas_por_pedido(self, tenant_id: UUID, pedido_id: UUID, skip: int = 0, limit: int = 10) -> List[Parcela]:
        return self.db.query(Parcela).filter(
            Parcela.tenant_id == tenant_id,
            Parcela.pedido_id == pedido_id
        ).offset(skip).limit(limit).all()

    def obter_parcela_por_id(self, tenant_id: UUID, parcela_id: UUID) -> Parcela | None:
        return self.db.query(Parcela).filter(
            Parcela.tenant_id == tenant_id,
            Parcela.id == parcela_id
        ).first()
    
    def atualizar_parcela(self, tenant_id: UUID, parcela_id: UUID, schema: ParcelaUpdate) -> Parcela | None:
        db_parcela = self.obter_parcela_por_id(tenant_id, parcela_id)
        if not db_parcela:
            return None
        
        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_parcela, key, value)
        
        self.db.commit()
        self.db.refresh(db_parcela)
        return db_parcela

    def deletar_parcela(self, tenant_id: UUID, parcela_id: UUID) -> bool:
        db_parcela = self.obter_parcela_por_id(tenant_id, parcela_id)
        if not db_parcela:
            return False
        
        self.db.delete(db_parcela)
        self.db.commit()
        return True

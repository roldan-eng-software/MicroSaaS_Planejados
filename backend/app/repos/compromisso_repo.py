from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, between
from app.models.compromisso import Compromisso
from app.schemas.compromisso import CompromissoCreate, CompromissoUpdate
from uuid import UUID
from typing import List, Optional
from datetime import datetime

class CompromissoRepository:
    def __init__(self, db: Session):
        self.db = db

    def criar(self, tenant_id: UUID, schema: CompromissoCreate) -> Compromisso:
        db_compromisso = Compromisso(
            tenant_id=tenant_id,
            titulo=schema.titulo,
            descricao=schema.descricao,
            tipo=schema.tipo,
            status=schema.status,
            data_hora_inicio=schema.data_hora_inicio,
            data_hora_fim=schema.data_hora_fim,
            cliente_id=schema.cliente_id,
            pedido_id=schema.pedido_id,
            local=schema.local,
            endereco=schema.endereco,
            observacoes=schema.observacoes,
        )
        self.db.add(db_compromisso)
        self.db.commit()
        self.db.refresh(db_compromisso)
        return db_compromisso

    def listar(
        self,
        tenant_id: UUID,
        skip: int = 0,
        limit: int = 10,
        cliente_id: Optional[UUID] = None,
        pedido_id: Optional[UUID] = None,
        status: Optional[str] = None,
        tipo: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None
    ) -> List[Compromisso]:
        query = self.db.query(Compromisso).options(
            joinedload(Compromisso.cliente),
            joinedload(Compromisso.pedido)
        ).filter(Compromisso.tenant_id == tenant_id)

        if cliente_id:
            query = query.filter(Compromisso.cliente_id == cliente_id)

        if pedido_id:
            query = query.filter(Compromisso.pedido_id == pedido_id)

        if status:
            query = query.filter(Compromisso.status == status)

        if tipo:
            query = query.filter(Compromisso.tipo == tipo)

        if data_inicio and data_fim:
            query = query.filter(
                and_(
                    Compromisso.data_hora_inicio >= data_inicio,
                    Compromisso.data_hora_inicio <= data_fim
                )
            )

        return query.offset(skip).limit(limit).all()

    def obter_por_id(self, tenant_id: UUID, compromisso_id: UUID) -> Optional[Compromisso]:
        return self.db.query(Compromisso).options(
            joinedload(Compromisso.cliente),
            joinedload(Compromisso.pedido)
        ).filter(
            Compromisso.tenant_id == tenant_id,
            Compromisso.id == compromisso_id
        ).first()

    def atualizar(self, tenant_id: UUID, compromisso_id: UUID, schema: CompromissoUpdate) -> Optional[Compromisso]:
        db_compromisso = self.obter_por_id(tenant_id, compromisso_id)
        if not db_compromisso:
            return None

        update_data = schema.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_compromisso, key, value)

        self.db.commit()
        self.db.refresh(db_compromisso)
        return db_compromisso

    def deletar(self, tenant_id: UUID, compromisso_id: UUID) -> bool:
        db_compromisso = self.obter_por_id(tenant_id, compromisso_id)
        if not db_compromisso:
            return False

        self.db.delete(db_compromisso)
        self.db.commit()
        return True

    def listar_por_periodo(self, tenant_id: UUID, data_inicio: datetime, data_fim: datetime) -> List[Compromisso]:
        """Retorna compromissos que ocorrem dentro do período especificado"""
        return self.db.query(Compromisso).options(
            joinedload(Compromisso.cliente),
            joinedload(Compromisso.pedido)
        ).filter(
            Compromisso.tenant_id == tenant_id,
            or_(
                # Compromissos que começam dentro do período
                and_(
                    Compromisso.data_hora_inicio >= data_inicio,
                    Compromisso.data_hora_inicio <= data_fim
                ),
                # Compromissos que terminam dentro do período
                and_(
                    Compromisso.data_hora_fim >= data_inicio,
                    Compromisso.data_hora_fim <= data_fim
                ),
                # Compromissos que abrangem todo o período
                and_(
                    Compromisso.data_hora_inicio <= data_inicio,
                    Compromisso.data_hora_fim >= data_fim
                )
            )
        ).all()

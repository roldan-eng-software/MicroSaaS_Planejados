from fastapi import HTTPException, status
from app.repos.compromisso_repo import CompromissoRepository
from app.schemas.compromisso import CompromissoCreate, CompromissoUpdate, CompromissoRead
from uuid import UUID
from typing import List, Optional
from datetime import datetime

class CompromissoService:
    def __init__(self, repo: CompromissoRepository):
        self.repo = repo

    def _validar_datas(self, data_inicio: datetime, data_fim: datetime):
        """Valida se a data de fim é posterior à data de início"""
        if data_fim <= data_inicio:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Data/hora de fim deve ser posterior à data/hora de início"
            )

    def criar_compromisso(self, tenant_id: UUID, schema: CompromissoCreate) -> CompromissoRead:
        # Validações de negócio
        self._validar_datas(schema.data_hora_inicio, schema.data_hora_fim)

        # TODO: Adicionar validação de conflitos de horário no futuro
        # self._verificar_conflitos_horario(tenant_id, schema.data_hora_inicio, schema.data_hora_fim)

        db_compromisso = self.repo.criar(tenant_id, schema)
        return CompromissoRead.from_attributes(db_compromisso)

    def listar_compromissos(
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
    ) -> List[CompromissoRead]:
        compromissos = self.repo.listar(
            tenant_id, skip, limit, cliente_id, pedido_id,
            status, tipo, data_inicio, data_fim
        )
        return [CompromissoRead.from_attributes(c) for c in compromissos]

    def obter_compromisso(self, tenant_id: UUID, compromisso_id: UUID) -> CompromissoRead:
        db_compromisso = self.repo.obter_por_id(tenant_id, compromisso_id)
        if not db_compromisso:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Compromisso não encontrado"
            )
        return CompromissoRead.from_attributes(db_compromisso)

    def atualizar_compromisso(self, tenant_id: UUID, compromisso_id: UUID, schema: CompromissoUpdate) -> CompromissoRead:
        # Busca compromisso existente para validação
        db_compromisso = self.repo.obter_por_id(tenant_id, compromisso_id)
        if not db_compromisso:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Compromisso não encontrado"
            )

        # Valida datas se foram fornecidas
        data_inicio = schema.data_hora_inicio or db_compromisso.data_hora_inicio
        data_fim = schema.data_hora_fim or db_compromisso.data_hora_fim
        self._validar_datas(data_inicio, data_fim)

        # TODO: Adicionar validação de conflitos de horário no futuro
        # if schema.data_hora_inicio or schema.data_hora_fim:
        #     self._verificar_conflitos_horario(tenant_id, data_inicio, data_fim, compromisso_id)

        db_compromisso = self.repo.atualizar(tenant_id, compromisso_id, schema)
        return CompromissoRead.from_attributes(db_compromisso)

    def deletar_compromisso(self, tenant_id: UUID, compromisso_id: UUID):
        success = self.repo.deletar(tenant_id, compromisso_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Compromisso não encontrado"
            )
        return {"detail": "Compromisso deletado com sucesso"}

    def listar_por_periodo(self, tenant_id: UUID, data_inicio: datetime, data_fim: datetime) -> List[CompromissoRead]:
        """Retorna compromissos que ocorrem dentro do período especificado"""
        compromissos = self.repo.listar_por_periodo(tenant_id, data_inicio, data_fim)
        return [CompromissoRead.from_attributes(c) for c in compromissos]

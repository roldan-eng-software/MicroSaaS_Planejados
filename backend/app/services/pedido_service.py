# backend/app/services/pedido_service.py
from fastapi import HTTPException, status
from app.repos.pedido_repo import PedidoRepository
from app.schemas.pedido import PedidoCreate, PedidoUpdate, PedidoRead
from uuid import UUID
from typing import List, Optional

class PedidoService:
    def __init__(self, repo: PedidoRepository):
        self.repo = repo
    
    def _calcular_valores_pedido(self, schema: PedidoCreate | PedidoUpdate):
        """Calcula subtotal, desconto e total do pedido com base nos itens."""
        subtotal = sum(item.quantidade * item.preco_unitario for item in schema.itens if item.quantidade and item.preco_unitario)
        
        # Desconto pode ser um valor fixo ou percentual, aqui assumimos fixo por simplicidade
        # Lógica mais complexa para cálculo de impostos, frete, etc., pode ser adicionada aqui
        
        schema.valor_subtotal = subtotal
        schema.valor_total = subtotal - (schema.valor_desconto if schema.valor_desconto else 0)
        if schema.valor_total < 0:
            schema.valor_total = 0 # Evitar valor total negativo

    def criar_pedido(self, tenant_id: UUID, schema: PedidoCreate) -> PedidoRead:
        self._calcular_valores_pedido(schema) # Calcula valores antes de criar
        db_pedido = self.repo.criar(tenant_id, schema)
        return PedidoRead.from_attributes(db_pedido)
    
    def listar_pedidos(self, tenant_id: UUID, skip: int = 0, limit: int = 10) -> List[PedidoRead]:
        pedidos = self.repo.listar(tenant_id, skip, limit)
        return [PedidoRead.from_attributes(p) for p in pedidos]

    def obter_pedido(self, tenant_id: UUID, pedido_id: UUID) -> PedidoRead:
        db_pedido = self.repo.obter_por_id(tenant_id, pedido_id)
        if not db_pedido:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
        return PedidoRead.from_attributes(db_pedido)

    def atualizar_pedido(self, tenant_id: UUID, pedido_id: UUID, schema: PedidoUpdate) -> PedidoRead:
        # Recalcula valores se os itens forem atualizados ou outros campos relevantes
        if schema.itens is not None:
            self._calcular_valores_pedido(schema)
        
        db_pedido = self.repo.atualizar(tenant_id, pedido_id, schema)
        if not db_pedido:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
        return PedidoRead.from_attributes(db_pedido)

    def deletar_pedido(self, tenant_id: UUID, pedido_id: UUID):
        success = self.repo.deletar(tenant_id, pedido_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")
        return {"detail": "Pedido deletado com sucesso"}

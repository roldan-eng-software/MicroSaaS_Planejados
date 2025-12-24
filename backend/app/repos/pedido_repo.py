# backend/app/repos/pedido_repo.py
from sqlalchemy.orm import Session, joinedload
from app.models.pedido import Pedido
from app.models.item_pedido import ItemPedido
from app.schemas.pedido import PedidoCreate, PedidoUpdate, ItemPedidoCreate, ItemPedidoUpdate
from uuid import UUID
from typing import List, Optional

class PedidoRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def criar(self, tenant_id: UUID, schema: PedidoCreate) -> Pedido:
        db_pedido = Pedido(
            tenant_id=tenant_id,
            cliente_id=schema.cliente_id,
            numero=schema.numero,
            status=schema.status,
            referencia=schema.referencia,
            validade_orcamento_dias=schema.validade_orcamento_dias,
            prazo_execucao_dias=schema.prazo_execucao_dias,
            data_inicio=schema.data_inicio,
            data_fim_prevista=schema.data_fim_prevista,
            data_fim_real=schema.data_fim_real,
            valor_subtotal=schema.valor_subtotal,
            valor_desconto=schema.valor_desconto,
            valor_total=schema.valor_total,
        )
        self.db.add(db_pedido)
        self.db.flush() # Para que o db_pedido tenha um ID antes de criar os itens

        for item_data in schema.itens:
            db_item = ItemPedido(
                tenant_id=tenant_id,
                pedido_id=db_pedido.id,
                descricao=item_data.descricao,
                quantidade=item_data.quantidade,
                unidade=item_data.unidade,
                preco_unitario=item_data.preco_unitario,
                observacoes=item_data.observacoes,
            )
            self.db.add(db_item)
        
        self.db.commit()
        self.db.refresh(db_pedido) # Para carregar os itens recém-criados
        return db_pedido
    
    def listar(self, tenant_id: UUID, skip: int = 0, limit: int = 10) -> List[Pedido]:
        return self.db.query(Pedido).options(joinedload(Pedido.itens)).filter(
            Pedido.tenant_id == tenant_id
        ).offset(skip).limit(limit).all()
    
    def obter_por_id(self, tenant_id: UUID, pedido_id: UUID) -> Pedido | None:
        return self.db.query(Pedido).options(joinedload(Pedido.itens)).filter(
            Pedido.tenant_id == tenant_id,
            Pedido.id == pedido_id
        ).first()
    
    def atualizar(self, tenant_id: UUID, pedido_id: UUID, schema: PedidoUpdate) -> Pedido | None:
        db_pedido = self.obter_por_id(tenant_id, pedido_id)
        if not db_pedido:
            return None
        
        update_data = schema.model_dump(exclude_unset=True, exclude={'itens'})
        for key, value in update_data.items():
            setattr(db_pedido, key, value)

        # Atualiza ou cria itens
        if schema.itens is not None:
            # Simple approach: delete all existing items and recreate.
            # More robust: compare and update existing items, delete missing, create new.
            # For now, let's keep it simple.
            for existing_item in db_pedido.itens:
                self.db.delete(existing_item)
            self.db.flush()

            for item_data in schema.itens:
                db_item = ItemPedido(
                    tenant_id=tenant_id,
                    pedido_id=db_pedido.id,
                    descricao=item_data.descricao,
                    quantidade=item_data.quantidade,
                    unidade=item_data.unidade,
                    preco_unitario=item_data.preco_unitario,
                    observacoes=item_data.observacoes,
                )
                self.db.add(db_item)
        
        self.db.commit()
        self.db.refresh(db_pedido)
        return db_pedido
    
    def deletar(self, tenant_id: UUID, pedido_id: UUID) -> bool:
        db_pedido = self.obter_por_id(tenant_id, pedido_id)
        if not db_pedido:
            return False
        
        self.db.delete(db_pedido) # A cascata "all, delete-orphan" no modelo Pedido cuidará dos itens.
        self.db.commit()
        return True

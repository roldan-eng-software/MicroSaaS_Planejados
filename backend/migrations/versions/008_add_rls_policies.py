"""Add RLS policies

Revision ID: 008_add_rls_policies
Revises: f92b8725f1a4
Create Date: 2025-12-23 15:08:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '008_add_rls_policies'
down_revision: Union[str, Sequence[str], None] = 'f92b8725f1a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
        -- Habilitar RLS na tabela pedidos
        ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

        -- Criar policy
        CREATE POLICY tenant_isolation_pedidos ON pedidos
        USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
        WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("""
        DROP POLICY tenant_isolation_pedidos ON pedidos;
        ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
    """)

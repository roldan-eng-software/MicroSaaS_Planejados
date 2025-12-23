def upgrade():
    op.execute("""
        -- Habilitar RLS na tabela pedidos
        ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
        
        -- Criar policy
        CREATE POLICY tenant_isolation_pedidos ON pedidos
        USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
        WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);
    """)

def downgrade():
    op.execute("""
        DROP POLICY tenant_isolation_pedidos ON pedidos;
        ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
    """)

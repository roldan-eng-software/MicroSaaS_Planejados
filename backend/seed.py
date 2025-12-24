import sys
import os
from datetime import datetime, timedelta
from uuid import uuid4

# Adiciona o diretório atual ao path para importar os módulos da app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.tenant import Tenant
from app.models.user import User
from app.models.cliente import Cliente
from app.models.pedido import Pedido
from app.models.compromisso import Compromisso

def seed():
    db = SessionLocal()
    try:
        print("🌱 Iniciando seed do banco de dados...")

        # ---------------------------------------------------------
        # 1. Criar Tenant (Empresa)
        # ---------------------------------------------------------
        tenant_email = "demo@marcenaria.com"
        tenant = db.query(Tenant).filter(Tenant.email_suporte == tenant_email).first()
        
        if not tenant:
            tenant_id = uuid4()
            tenant = Tenant(
                id=tenant_id,
                tenant_id=tenant_id, # Self-reference para o tenant root
                nome="Marcenaria Demo",
                cnpj="00.000.000/0001-00",
                email_suporte=tenant_email,
                telefone="11999999999",
                plano="Pro",
                ativo=True
            )
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
            print(f"✅ Tenant criado: {tenant.nome}")
        else:
            print(f"ℹ️ Tenant já existe: {tenant.nome}")

        # ---------------------------------------------------------
        # 2. Criar Usuário Admin
        # ---------------------------------------------------------
        admin_email = "admin@marcenaria.com"
        user = db.query(User).filter(User.email == admin_email).first()
        
        if not user:
            user = User(
                id=uuid4(),
                tenant_id=tenant.id,
                nome="Admin Demo",
                email=admin_email,
                hashed_password=get_password_hash("123456"), # Senha padrão
                role="admin",
                ativo=True
            )
            db.add(user)
            db.commit()
            print(f"✅ Usuário criado: {user.email} (Senha: 123456)")
        else:
            print(f"ℹ️ Usuário já existe: {user.email}")

        # ---------------------------------------------------------
        # 3. Criar Clientes
        # ---------------------------------------------------------
        clientes_data = [
            {"nome": "João Silva", "tipo": "PF", "cpf_cnpj": "12345678900", "email": "joao@cliente.com", "telefone_ddd": "11 99999-9999"},
            {"nome": "Maria Oliveira", "tipo": "PF", "cpf_cnpj": "98765432100", "email": "maria@cliente.com", "telefone_ddd": "11 98888-8888"},
            {"nome": "Construtora XYZ", "tipo": "PJ", "cpf_cnpj": "12345678000199", "email": "contato@xyz.com", "telefone_ddd": "11 3333-3333"},
        ]

        clientes_objs = []
        for c_data in clientes_data:
            cliente = db.query(Cliente).filter(Cliente.email == c_data["email"]).first()
            if not cliente:
                cliente = Cliente(id=uuid4(), tenant_id=tenant.id, **c_data, ativo=True)
                db.add(cliente)
                db.commit()
                db.refresh(cliente)
                print(f"✅ Cliente criado: {cliente.nome}")
            clientes_objs.append(cliente)

        # ---------------------------------------------------------
        # 4. Criar Pedidos e Compromissos
        # ---------------------------------------------------------
        if clientes_objs:
            # Pedido 1
            pedido = Pedido(
                id=uuid4(),
                tenant_id=tenant.id,
                cliente_id=clientes_objs[0].id,
                numero="001/2025",
                status="Aprovado",
                valor_total=5000.00,
                prazo_execucao_dias=30,
                created_at=datetime.now()
            )
            db.add(pedido)
            
            # Compromisso vinculado ao pedido
            compromisso = Compromisso(
                id=uuid4(),
                tenant_id=tenant.id,
                cliente_id=clientes_objs[0].id,
                pedido_id=pedido.id,
                titulo="Medição Técnica",
                tipo="Medição",
                status="Agendado",
                data_hora_inicio=datetime.now() + timedelta(days=2, hours=9),
                data_hora_fim=datetime.now() + timedelta(days=2, hours=11),
                local="Obra do Cliente"
            )
            db.add(compromisso)
            db.commit()
            print("✅ Pedidos e Compromissos de exemplo criados.")

    except Exception as e:
        print(f"❌ Erro ao rodar seed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
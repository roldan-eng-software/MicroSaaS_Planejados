# 🚀 GUIA PRÁTICO: COMEÇAR DO ZERO - MicroSaaS Marcenaria

## Fase 1: Setup Inicial (2-3 dias)

### 1.1 Criar Repositório no GitHub

```bash
# Clone um template (ou crie do zero)
git clone https://github.com/seu-usuario/microsass-marcenaria.git
cd microsass-marcenaria

# Estrutura inicial
mkdir -p backend frontend infrastructure

# Iniciar git
git init
git add .
git commit -m "Initial commit: project structure"
git push origin main
```

### 1.2 Setup Backend (FastAPI)

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar (Linux/Mac)
source venv/bin/activate

# Ativar (Windows)
venv\Scripts\activate

# Instalar dependências básicas
pip install fastapi uvicorn[standard] pydantic sqlalchemy psycopg[binary] alembic

# Criar requirements.txt
pip freeze > requirements.txt

# Estrutura de pastas
mkdir -p app/{models,schemas,repos,services,routes,middleware,utils,core}
mkdir -p migrations/versions
mkdir -p tests
```

### 1.3 Setup Frontend (React + Vite)

```bash
cd frontend

# Criar projeto com Vite
npm create vite@latest . -- --template react-ts

# Instalar dependências principais
npm install \
  axios \
  @tanstack/react-query \
  @tanstack/react-table \
  react-router-dom \
  react-hook-form \
  zod \
  tailwindcss \
  postcss \
  autoprefixer \
  date-fns \
  recharts \
  react-big-calendar

# Setup Tailwind
npx tailwindcss init -p
```

### 1.4 Setup Docker

```bash
# Na raiz do projeto
touch docker-compose.yml Dockerfile

# Criar arquivos .dockerignore
echo "node_modules\n.env\n__pycache__" > frontend/.dockerignore
echo "venv\n__pycache__\n.env" > backend/.dockerignore
```

---

## Fase 2: Database Schema (3-5 dias)

### 2.1 Criar Primeiro Model (SQLAlchemy)

```python
# backend/app/models/base.py
from sqlalchemy import Column, DateTime, UUID
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class BaseModel(Base):
    """Base model com tenant_id obrigatório para multitenant"""
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### 2.2 Criar Models Principais

```python
# backend/app/models/tenant.py
from sqlalchemy import Column, String, Enum, DateTime, Boolean
from .base import BaseModel

class Tenant(BaseModel):
    """Empresa cliente do SaaS"""
    __tablename__ = "tenants"
    
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(20), unique=True, nullable=False, index=True)
    email_suporte = Column(String(255), nullable=False)
    telefone = Column(String(20))
    endereco = Column(String(500))
    plano = Column(Enum('Starter', 'Pro', 'Enterprise'), default='Starter')
    ativo = Column(Boolean, default=True)
    data_expiracao_plano = Column(DateTime)

# backend/app/models/cliente.py
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from .base import BaseModel

class Cliente(BaseModel):
    """Cliente do marceneiro"""
    __tablename__ = "clientes"
    
    nome = Column(String(255), nullable=False)
    tipo = Column(Enum('PF', 'PJ'), nullable=False)
    cpf_cnpj = Column(String(20), nullable=False)
    email = Column(String(255))
    telefone_ddd = Column(String(20))
    endereco = Column(String(500))
    cep = Column(String(10))
    cidade = Column(String(100))
    uf = Column(String(2))
    ativo = Column(Boolean, default=True)

# backend/app/models/pedido.py
from sqlalchemy import Column, String, Enum, Date, DateTime, Numeric, ForeignKey
from .base import BaseModel

class Pedido(BaseModel):
    """Pedido/Ordem de trabalho"""
    __tablename__ = "pedidos"
    
    cliente_id = Column(UUID(as_uuid=True), ForeignKey('clientes.id'), nullable=False)
    numero = Column(String(50), nullable=False, index=True)  # "021-2025"
    status = Column(Enum(
        'Aguardando Aprovação',
        'Aprovado',
        'Em Andamento',
        'Aguardando Pagamento',
        'Concluído',
        'Cancelado'
    ), default='Aguardando Aprovação')
    referencia = Column(String(255))
    validade_orcamento_dias = Column(Integer, default=30)
    prazo_execucao_dias = Column(Integer)
    data_inicio = Column(Date)
    data_fim_prevista = Column(Date)
    data_fim_real = Column(Date)
    valor_subtotal = Column(Numeric(12, 2), default=0)
    valor_desconto = Column(Numeric(12, 2), default=0)
    valor_total = Column(Numeric(12, 2), default=0)
```

### 2.3 Criar Migration Inicial

```bash
cd backend

# Inicializar Alembic
alembic init migrations

# Editar migrations/env.py para usar SQLAlchemy models automaticamente

# Criar primeira migration
alembic revision --autogenerate -m "Create initial schema"

# Aplicar migration
alembic upgrade head
```

### 2.4 Adicionar RLS Policies

```python
# backend/migrations/versions/008_add_rls_policies.py
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
```

---

## Fase 3: Backend APIs (5-7 dias)

### 3.1 Criar Schemas (Pydantic)

```python
# backend/app/schemas/cliente.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class ClienteBase(BaseModel):
    nome: str
    tipo: str  # 'PF' ou 'PJ'
    cpf_cnpj: str
    email: Optional[EmailStr] = None
    telefone_ddd: Optional[str] = None
    endereco: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(ClienteBase):
    pass

class ClienteRead(ClienteBase):
    id: UUID
    tenant_id: UUID
    ativo: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
```

### 3.2 Criar Repository (Data Access)

```python
# backend/app/repos/cliente_repo.py
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate
from uuid import UUID

class ClienteRepository:
    def __init__(self, db: Session):
        self.db = db
    
    async def criar(self, tenant_id: UUID, schema: ClienteCreate) -> Cliente:
        db_cliente = Cliente(
            tenant_id=tenant_id,
            **schema.dict()
        )
        self.db.add(db_cliente)
        self.db.commit()
        self.db.refresh(db_cliente)
        return db_cliente
    
    async def listar(self, tenant_id: UUID, skip: int = 0, limit: int = 10) -> list[Cliente]:
        return self.db.query(Cliente).filter(
            Cliente.tenant_id == tenant_id
        ).offset(skip).limit(limit).all()
    
    async def obter_por_id(self, tenant_id: UUID, cliente_id: UUID) -> Cliente:
        return self.db.query(Cliente).filter(
            Cliente.tenant_id == tenant_id,
            Cliente.id == cliente_id
        ).first()
    
    async def atualizar(self, tenant_id: UUID, cliente_id: UUID, schema: ClienteUpdate) -> Cliente:
        db_cliente = await self.obter_por_id(tenant_id, cliente_id)
        if not db_cliente:
            return None
        
        for key, value in schema.dict(exclude_unset=True).items():
            setattr(db_cliente, key, value)
        
        self.db.commit()
        self.db.refresh(db_cliente)
        return db_cliente
    
    async def deletar(self, tenant_id: UUID, cliente_id: UUID) -> bool:
        db_cliente = await self.obter_por_id(tenant_id, cliente_id)
        if not db_cliente:
            return False
        
        self.db.delete(db_cliente)
        self.db.commit()
        return True
```

### 3.3 Criar Service (Lógica de Negócio)

```python
# backend/app/services/cliente_service.py
from app.repos.cliente_repo import ClienteRepository
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteRead
from uuid import UUID

class ClienteService:
    def __init__(self, repo: ClienteRepository):
        self.repo = repo
    
    async def criar_cliente(self, tenant_id: UUID, schema: ClienteCreate) -> ClienteRead:
        # Validações de negócio
        if schema.tipo == 'PF' and len(schema.cpf_cnpj) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        
        if schema.tipo == 'PJ' and len(schema.cpf_cnpj) != 14:
            raise ValueError("CNPJ deve ter 14 dígitos")
        
        db_cliente = await self.repo.criar(tenant_id, schema)
        return ClienteRead.from_orm(db_cliente)
    
    async def listar_clientes(self, tenant_id: UUID, skip: int = 0, limit: int = 10):
        clientes = await self.repo.listar(tenant_id, skip, limit)
        return [ClienteRead.from_orm(c) for c in clientes]
```

### 3.4 Criar Endpoints (Routes)

```python
# backend/app/routes/clientes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteRead
from app.services.cliente_service import ClienteService
from app.repos.cliente_repo import ClienteRepository
from app.core.database import get_db
from app.dependencies import get_current_tenant_id

router = APIRouter(prefix="/clientes", tags=["clientes"])

@router.post("/", response_model=ClienteRead, status_code=201)
async def criar_cliente(
    schema: ClienteCreate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    service = ClienteService(repo)
    return await service.criar_cliente(tenant_id, schema)

@router.get("/", response_model=list[ClienteRead])
async def listar_clientes(
    skip: int = 0,
    limit: int = 10,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    service = ClienteService(repo)
    return await service.listar_clientes(tenant_id, skip, limit)

@router.get("/{cliente_id}", response_model=ClienteRead)
async def obter_cliente(
    cliente_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    cliente = await repo.obter_por_id(tenant_id, cliente_id)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return ClienteRead.from_orm(cliente)

@router.put("/{cliente_id}", response_model=ClienteRead)
async def atualizar_cliente(
    cliente_id: UUID,
    schema: ClienteUpdate,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    cliente = await repo.atualizar(tenant_id, cliente_id, schema)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return ClienteRead.from_orm(cliente)

@router.delete("/{cliente_id}", status_code=204)
async def deletar_cliente(
    cliente_id: UUID,
    tenant_id: UUID = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    repo = ClienteRepository(db)
    sucesso = await repo.deletar(tenant_id, cliente_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return None
```

### 3.5 Registrar Routers no Main

```python
# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import clientes, pedidos, pagamentos
from app.middleware.auth import auth_middleware

app = FastAPI(title="MicroSaaS Marcenaria API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://seu-dominio.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware custom
app.middleware("http")(auth_middleware)

# Routers
app.include_router(clientes.router, prefix="/api")
app.include_router(pedidos.router, prefix="/api")
app.include_router(pagamentos.router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

### 3.6 Testar com cURL ou Postman

```bash
# Criar cliente
curl -X POST http://localhost:8000/api/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nome": "João Silva",
    "tipo": "PF",
    "cpf_cnpj": "12345678901",
    "email": "joao@email.com",
    "telefone_ddd": "+55 16 99999-9999"
  }'

# Listar clientes
curl -X GET http://localhost:8000/api/clientes \
  -H "Authorization: Bearer {token}"
```

---

## Fase 4: Frontend Componentes (5-7 dias)

### 4.1 Criar Hook Custom (useClientes)

```typescript
// frontend/src/hooks/useClientes.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/services/cliente.service';
import { ClienteCreate, ClienteRead } from '@/types/cliente';
import { AxiosError } from 'axios';

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: () => clienteService.listar(),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  });
}

export function useCriarCliente() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ClienteCreate) => clienteService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
    onError: (error: AxiosError) => {
      console.error('Erro ao criar cliente:', error.response?.data);
    },
  });
}
```

### 4.2 Criar Serviço de API (clienteService)

```typescript
// frontend/src/services/cliente.service.ts
import api from '@/services/api';
import { ClienteCreate, ClienteRead } from '@/types/cliente';

export const clienteService = {
  async listar(): Promise<ClienteRead[]> {
    const { data } = await api.get('/clientes');
    return data;
  },

  async obterPorId(id: string): Promise<ClienteRead> {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
  },

  async criar(payload: ClienteCreate): Promise<ClienteRead> {
    const { data } = await api.post('/clientes', payload);
    return data;
  },

  async atualizar(id: string, payload: Partial<ClienteCreate>): Promise<ClienteRead> {
    const { data } = await api.put(`/clientes/${id}`, payload);
    return data;
  },

  async deletar(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`);
  },
};
```

### 4.3 Criar Componente de Listagem

```typescript
// frontend/src/components/Clientes/ClienteList.tsx
import React from 'react';
import { useClientes } from '@/hooks/useClientes';
import { ClienteCard } from './ClienteCard';

export function ClienteList() {
  const { data: clientes, isLoading, error } = useClientes();

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro ao carregar clientes</div>;

  return (
    <div className="grid grid-cols-1 gap-4">
      {clientes?.map((cliente) => (
        <ClienteCard key={cliente.id} cliente={cliente} />
      ))}
    </div>
  );
}
```

### 4.4 Criar Componente de Formulário

```typescript
// frontend/src/components/Clientes/ClienteForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCriarCliente } from '@/hooks/useClientes';

const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  tipo: z.enum(['PF', 'PJ']),
  cpf_cnpj: z.string().regex(/^\d+$/, 'Apenas números'),
  email: z.string().email('Email inválido'),
  telefone_ddd: z.string(),
});

export function ClienteForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(clienteSchema),
  });
  
  const { mutate: criarCliente, isPending } = useCriarCliente();

  const onSubmit = (data) => {
    criarCliente(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input
        {...register('nome')}
        placeholder="Nome"
        className="w-full border rounded px-3 py-2"
      />
      {errors.nome && <span className="text-red-500">{errors.nome.message}</span>}

      <select {...register('tipo')} className="w-full border rounded px-3 py-2">
        <option value="PF">Pessoa Física</option>
        <option value="PJ">Pessoa Jurídica</option>
      </select>

      <input
        {...register('cpf_cnpj')}
        placeholder="CPF/CNPJ"
        className="w-full border rounded px-3 py-2"
      />
      {errors.cpf_cnpj && <span className="text-red-500">{errors.cpf_cnpj.message}</span>}

      <input
        {...register('email')}
        type="email"
        placeholder="Email"
        className="w-full border rounded px-3 py-2"
      />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}

      <input
        {...register('telefone_ddd')}
        placeholder="Telefone"
        className="w-full border rounded px-3 py-2"
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {isPending ? 'Salvando...' : 'Criar Cliente'}
      </button>
    </form>
  );
}
```

---

## Fase 5: Docker Local (1-2 dias)

### 5.1 Testar com Docker Compose

```bash
# Na raiz do projeto
docker-compose up -d

# Verificar logs
docker-compose logs -f backend

# Rodar migrations
docker-compose exec backend alembic upgrade head

# Parar
docker-compose down
```

### 5.2 Acessar serviços

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:8000/api>
- Docs Swagger: <http://localhost:8000/docs>
- PostgreSQL: localhost:5432

---

## Checklist Completo de Implementação

### ✅ Semana 1

- [ ] Criar repositório GitHub
- [ ] Setup FastAPI + estrutura de pastas
- [ ] Setup React + Vite
- [ ] Criar Docker Compose
- [ ] Criar 3 models principais (Tenant, Cliente, Pedido)
- [ ] Criar migrations iniciais
- [ ] Rodar tudo localmente com Docker

### ✅ Semana 2

- [ ] Implementar autenticação JWT
- [ ] Criar Repository pattern para Clientes
- [ ] Criar Service + Validações de negócio
- [ ] Criar endpoints CRUD de Clientes
- [ ] Testar com Postman/Thunder Client

### ✅ Semana 3

- [ ] Criar front-end com React
- [ ] Implementar listagem de clientes
- [ ] Criar formulário de novo cliente
- [ ] Integrar com backend via axios
- [ ] Testar fluxo completo

### ✅ Semana 4

- [ ] Repetir para Pedidos
- [ ] Implementar Pagamentos
- [ ] Criar dashboard financeiro
- [ ] Testes unitários

---

**Você está pronto para começar! Qual módulo quer implementar primeiro?**

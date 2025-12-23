# 📚 STACK TÉCNICA COMPLETA - MicroSaaS Marcenaria

## Estrutura Geral do Projeto

```
microsass-marcenaria/
├── backend/                    # FastAPI + Python
├── frontend/                   # React + TypeScript
├── infrastructure/             # Docker + CI/CD
└── docs/                       # Documentação
```

---

## 🛢️ **1. CAMADA DE BANCO DE DADOS**

### **Tecnologia Principal: PostgreSQL 15+**

**Por quê PostgreSQL:**
- ✅ Row Level Security (RLS) nativo para multitenant
- ✅ JSON/JSONB para dados flexíveis
- ✅ Triggers para auditoria automática
- ✅ Full-text search integrado
- ✅ Escalável e confiável

### **Bibliotecas Python (Backend)**

| Dependência | Versão | Uso |
|---|---|---|
| `psycopg[binary]` | 3.1+ | Driver PostgreSQL |
| `sqlalchemy` | 2.0+ | ORM para modelagem |
| `alembic` | 1.13+ | Migrations de schema |
| `sqlalchemy-utils` | 0.41+ | Tipos customizados (UUID, JSON) |

### **Estrutura de Migrations (Alembic)**

```bash
backend/
└── migrations/
    ├── alembic.ini              # Config do Alembic
    ├── env.py                   # Configuração de ambiente
    └── versions/
        ├── 001_create_tenants.py
        ├── 002_create_users.py
        ├── 003_create_clientes.py
        ├── 004_create_pedidos.py
        ├── 005_create_pagamentos.py
        ├── 006_create_compromissos.py
        ├── 007_create_documentos.py
        ├── 008_add_rls_policies.py
        └── 009_add_audit_triggers.py
```

### **Row Level Security (RLS) - Implementação**

```sql
-- Exemplo de RLS Policy
CREATE POLICY tenant_isolation_policy ON pedidos
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
```

---

## 🔧 **2. CAMADA DE BACKEND - FastAPI**

### **Framework e Bibliotecas Principais**

| Dependência | Versão | Uso |
|---|---|---|
| `fastapi` | 0.104+ | Framework web |
| `uvicorn[standard]` | 0.24+ | ASGI server |
| `pydantic` | 2.0+ | Validação de dados |
| `python-jose[cryptography]` | 3.3+ | JWT tokens |
| `passlib[bcrypt]` | 1.7+ | Hashing de senhas |
| `python-multipart` | 0.0.6+ | Form parsing |

### **Estrutura do Backend**

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                         # FastAPI app principal
│   ├── config.py                       # Settings com Pydantic
│   ├── dependencies.py                 # FastAPI dependencies
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py                    # JWT validation + tenant injection
│   │   ├── error_handler.py           # Exception handling
│   │   ├── cors.py                    # CORS configuration
│   │   └── rate_limiter.py            # Rate limiting
│   │
│   ├── models/                         # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── base.py                    # Base model com tenant_id
│   │   ├── tenant.py                  # Tenant model
│   │   ├── user.py
│   │   ├── cliente.py
│   │   ├── servico.py
│   │   ├── pedido.py
│   │   ├── item_pedido.py
│   │   ├── orcamento.py
│   │   ├── pagamento.py
│   │   ├── parcela.py
│   │   ├── compromisso.py
│   │   ├── documento.py
│   │   └── custo.py
│   │
│   ├── schemas/                        # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── tenant.py
│   │   ├── user.py
│   │   ├── cliente.py                 # ClienteCreate, ClienteRead, etc
│   │   ├── pedido.py
│   │   ├── pagamento.py
│   │   ├── compromisso.py
│   │   ├── documento.py
│   │   └── common.py                  # PaginatedResponse, ErrorResponse
│   │
│   ├── repos/                          # Data Access Layer (queries)
│   │   ├── __init__.py
│   │   ├── base.py                    # BaseRepository com métodos comuns
│   │   ├── cliente_repo.py
│   │   ├── pedido_repo.py
│   │   ├── pagamento_repo.py
│   │   ├── compromisso_repo.py
│   │   ├── documento_repo.py
│   │   └── servico_repo.py
│   │
│   ├── services/                       # Lógica de negócio
│   │   ├── __init__.py
│   │   ├── auth_service.py            # JWT, login, senha
│   │   ├── cliente_service.py
│   │   ├── pedido_service.py          # Validações complexas
│   │   ├── pagamento_service.py       # Cálculo de parcelas
│   │   ├── documento_service.py       # Geração de PDF
│   │   ├── compromisso_service.py
│   │   ├── notificacao_service.py     # Email/WhatsApp
│   │   └── relatorio_service.py       # Relatórios financeiros
│   │
│   ├── routes/                         # Endpoints (API routes)
│   │   ├── __init__.py
│   │   ├── auth.py                    # POST /login, /register, /refresh
│   │   ├── clientes.py                # GET/POST/PUT/DELETE /clientes
│   │   ├── pedidos.py                 # CRUD /pedidos
│   │   ├── orcamentos.py
│   │   ├── pagamentos.py
│   │   ├── parcelas.py
│   │   ├── compromissos.py
│   │   ├── documentos.py
│   │   ├── servicos.py
│   │   ├── custos.py
│   │   ├── financeiro.py              # Dashboard financeiro
│   │   └── relatorios.py              # Relatórios exportáveis
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── security.py                # JWT creation/verification
│   │   ├── pagination.py              # Pagination logic
│   │   ├── validators.py              # Custom validators
│   │   ├── formatters.py              # Data formatting (moeda, data)
│   │   ├── pdf_generator.py           # PDF generation
│   │   └── constants.py               # Enums, status codes
│   │
│   └── core/
│       ├── __init__.py
│       ├── database.py                # Database connection + session
│       ├── security.py                # Encryption, hashing
│       └── logging.py                 # Structured logging
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py                    # Pytest fixtures
│   ├── test_auth.py
│   ├── test_clientes.py
│   ├── test_pedidos.py
│   ├── test_pagamentos.py
│   ├── test_multitenant.py            # Testes de isolamento
│   └── test_security.py
│
├── requirements.txt                   # Dependências Python
├── requirements-dev.txt               # Dependências de dev (pytest, black)
├── .env.example                       # Variáveis de ambiente
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### **Base Model (Implementação Multitenant)**

```python
# app/models/base.py
from sqlalchemy import Column, UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class BaseModel(Base):
    """Modelo base com tenant_id obrigatório"""
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### **Middleware de Autenticação**

```python
# app/middleware/auth.py
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
import jwt

async def auth_middleware(request: Request, call_next):
    """
    1. Extrai JWT do header
    2. Valida assinatura
    3. Injeta tenant_id no request.state
    4. Define variável PostgreSQL app.current_tenant_id
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        request.state.tenant_id = payload["tenant_id"]
        request.state.user_id = payload["sub"]
        
        # Para RLS no PostgreSQL
        db.execute(f"SET app.current_tenant_id = '{payload['tenant_id']}'")
        
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return await call_next(request)
```

### **Dependência para Injetar Tenant**

```python
# app/dependencies.py
from fastapi import Depends, Request, HTTPException

async def get_current_tenant_id(request: Request) -> uuid.UUID:
    """Extrai tenant_id do request injetado pelo middleware"""
    if not hasattr(request.state, "tenant_id"):
        raise HTTPException(status_code=401, detail="Tenant not found")
    return request.state.tenant_id

async def get_current_user(request: Request) -> uuid.UUID:
    """Extrai user_id do request"""
    if not hasattr(request.state, "user_id"):
        raise HTTPException(status_code=401, detail="User not found")
    return request.state.user_id

# Uso em endpoints
@router.get("/pedidos")
async def list_pedidos(
    tenant_id: uuid.UUID = Depends(get_current_tenant_id),
    skip: int = 0,
    limit: int = 10
):
    # Queries automaticamente filtram por tenant_id
    pedidos = db.query(Pedido).filter(Pedido.tenant_id == tenant_id).offset(skip).limit(limit)
    return pedidos
```

### **Geração de PDF**

| Biblioteca | Uso | Vantagens |
|---|---|---|
| `reportlab` | Geração programática | ✅ Controle total, gráficos, tabelas |
| `weasyprint` | Converter HTML → PDF | ✅ Design em CSS, mais simples |
| `pypdf` | Manipular PDFs | ✅ Merge, split, assinatura |

**Recomendação:** Usar `weasyprint` para Orçamentos/Pedidos (renderiza HTML/CSS) + `reportlab` para gráficos no financeiro.

```python
# app/services/documento_service.py
from weasyprint import WeasyPrint
from jinja2 import Template

async def gerar_orcamento_pdf(orcamento_id: uuid.UUID, tenant_id: uuid.UUID):
    """
    1. Busca dados do orçamento
    2. Renderiza template HTML
    3. Converte com WeasyPrint
    4. Salva no S3
    5. Retorna URL
    """
    orcamento = db.query(Orcamento).filter(
        Orcamento.id == orcamento_id,
        Orcamento.tenant_id == tenant_id
    ).first()
    
    html_template = Template("""
        <html>
        <body>
            <h1>Orçamento {{ numero }}</h1>
            <p>Cliente: {{ cliente_nome }}</p>
            <table>
                {% for item in itens %}
                <tr>
                    <td>{{ item.descricao }}</td>
                    <td>R$ {{ item.preco | format_currency }}</td>
                </tr>
                {% endfor %}
            </table>
        </body>
        </html>
    """)
    
    html_content = html_template.render(orcamento=orcamento)
    
    # Gerar PDF
    pdf_bytes = WeasyPrint(string=html_content).write_pdf()
    
    # Salvar em S3
    s3_path = f"orçamentos/{tenant_id}/{orcamento_id}.pdf"
    s3_client.put_object(Bucket=settings.S3_BUCKET, Key=s3_path, Body=pdf_bytes)
    
    return s3_path
```

### **Notificações (Email + WhatsApp)**

| Serviço | Uso | Quando |
|---|---|---|
| `SendGrid` (Email) | Confirmação, avisos | Pedido aprovado, pagamento recebido |
| `Twilio` (WhatsApp/SMS) | Mensagens diretas | Agendamento confirmado, atraso de pagamento |
| `Celery` (Queue) | Processamento assíncrono | Background jobs para notificações |

```python
# app/services/notificacao_service.py
from celery import Celery
from sendgrid import SendGridAPIClient
from twilio.rest import Client

celery_app = Celery('tasks', broker='redis://localhost:6379')

@celery_app.task
def enviar_email_pedido_aprovado(pedido_id: str, cliente_email: str):
    """Task assíncrona para enviar email"""
    sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    message = Mail(
        from_email="noreply@marcenaria.com",
        to_emails=cliente_email,
        subject="Seu pedido foi aprovado!",
        html_content="<strong>Seu projeto está em andamento!</strong>"
    )
    sg.send(message)

@celery_app.task
def enviar_whatsapp_agendamento(cliente_telefone: str, data_agendamento: str):
    """Task para enviar WhatsApp"""
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=f"Olá! Seu agendamento está confirmado para {data_agendamento}",
        from_=f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",
        to=f"whatsapp:{cliente_telefone}"
    )
```

---

## 🎨 **3. CAMADA DE FRONTEND - React + TypeScript**

### **Dependências Principais**

| Dependência | Versão | Uso |
|---|---|---|
| `react` | 18.2+ | Framework UI |
| `react-dom` | 18.2+ | DOM rendering |
| `typescript` | 5.3+ | Type safety |
| `react-router-dom` | 6.20+ | Roteamento |
| `axios` | 1.6+ | HTTP client |
| `@tanstack/react-query` | 5.0+ | State management + cache |
| `@tanstack/react-table` | 8.10+ | Tabelas avançadas |
| `react-hook-form` | 7.48+ | Gerenciamento de forms |
| `zod` | 3.22+ | Validação de schemas |
| `tailwindcss` | 3.3+ | CSS framework |
| `shadcn/ui` | latest | Componentes base (opcional) |
| `recharts` | 2.10+ | Gráficos para financeiro |
| `react-big-calendar` | 1.8+ | Calendário/agenda |
| `date-fns` | 2.30+ | Manipulação de datas |

### **Estrutura do Frontend**

```
frontend/
├── src/
│   ├── components/                     # Componentes reutilizáveis
│   │   ├── Common/
│   │   │   ├── Header.tsx             # Cabeçalho com logo
│   │   │   ├── Sidebar.tsx            # Menu lateral/mobile drawer
│   │   │   ├── Footer.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── Clientes/
│   │   │   ├── ClienteList.tsx        # Listagem com search
│   │   │   ├── ClienteForm.tsx        # Criar/editar cliente
│   │   │   ├── ClienteCard.tsx        # Card individual
│   │   │   └── ClienteDetail.tsx      # Detalhes completos
│   │   │
│   │   ├── Pedidos/
│   │   │   ├── PedidoList.tsx         # Lista com filtros/status
│   │   │   ├── PedidoForm.tsx         # Criar novo pedido
│   │   │   ├── PedidoDetail.tsx       # Detalhes do pedido
│   │   │   ├── PedidoTabs.tsx         # Tabs: Pedido|Agenda|Financeiro
│   │   │   ├── ItemPedidoList.tsx     # Itens do pedido
│   │   │   └── PedidoStatusBadge.tsx
│   │   │
│   │   ├── Pagamentos/
│   │   │   ├── PagamentoSummary.tsx
│   │   │   ├── ParcelaList.tsx
│   │   │   ├── ParcelaForm.tsx        # Registrar pagamento
│   │   │   └── PagamentoTimeline.tsx
│   │   │
│   │   ├── Orcamentos/
│   │   │   ├── OrcamentoList.tsx
│   │   │   ├── OrcamentoForm.tsx
│   │   │   └── OrcamentoDetail.tsx
│   │   │
│   │   ├── Compromissos/
│   │   │   ├── Calendar.tsx           # React Big Calendar
│   │   │   ├── CompromissoForm.tsx
│   │   │   └── CompromissoList.tsx
│   │   │
│   │   ├── Servicos/
│   │   │   ├── ServicoList.tsx
│   │   │   ├── ServicoForm.tsx
│   │   │   └── ServicoCatalogo.tsx
│   │   │
│   │   ├── Financeiro/
│   │   │   ├── DashboardFinanceiro.tsx
│   │   │   ├── GraficoReceita.tsx     # Recharts
│   │   │   ├── GraficoCustos.tsx
│   │   │   └── AtalhoFinanceiro.tsx
│   │   │
│   │   ├── Documentos/
│   │   │   ├── DocumentoSelector.tsx  # Modal: qual documento?
│   │   │   ├── DocumentoPDF.tsx       # Visualizador
│   │   │   └── DocumentoDownload.tsx
│   │   │
│   │   ├── UI/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   └── Layout/
│   │       ├── MainLayout.tsx         # Layout principal (Sidebar + Content)
│   │       ├── AuthLayout.tsx         # Layout para login
│   │       └── EmptyState.tsx
│   │
│   ├── pages/                          # Páginas (routes)
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx      # Home com cards grid
│   │   │
│   │   ├── clientes/
│   │   │   ├── ClientesPage.tsx
│   │   │   ├── ClienteDetailPage.tsx
│   │   │   └── ClienteFormPage.tsx
│   │   │
│   │   ├── pedidos/
│   │   │   ├── PedidosPage.tsx
│   │   │   ├── PedidoDetailPage.tsx
│   │   │   └── PedidoFormPage.tsx
│   │   │
│   │   ├── orcamentos/
│   │   ├── compromissos/
│   │   ├── financeiro/
│   │   ├── servicos/
│   │   └── settings/
│   │
│   ├── hooks/                          # Custom hooks
│   │   ├── useAuth.ts                 # Auth context
│   │   ├── useTenant.ts               # Tenant context
│   │   ├── useClientes.ts             # Query hook para clientes
│   │   ├── usePedidos.ts
│   │   ├── usePagamentos.ts
│   │   ├── useParcelas.ts
│   │   ├── useCompromissos.ts
│   │   ├── useDocumentos.ts
│   │   ├── usePaginacao.ts
│   │   └── useFormValidation.ts
│   │
│   ├── services/
│   │   ├── api.ts                     # Axios config + interceptors
│   │   ├── auth.service.ts            # API auth calls
│   │   ├── cliente.service.ts
│   │   ├── pedido.service.ts
│   │   ├── pagamento.service.ts
│   │   ├── compromisso.service.ts
│   │   ├── documento.service.ts
│   │   ├── servico.service.ts
│   │   └── relatorio.service.ts
│   │
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── TenantContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   ├── types/
│   │   ├── index.ts                   # Exports dos tipos
│   │   ├── api.ts                     # Tipos gerais (Response, Pagination)
│   │   ├── cliente.ts
│   │   ├── pedido.ts
│   │   ├── pagamento.ts
│   │   ├── compromisso.ts
│   │   ├── documento.ts
│   │   ├── servico.ts
│   │   └── auth.ts
│   │
│   ├── utils/
│   │   ├── format.ts                  # Formatação (moeda, data)
│   │   ├── validation.ts              # Validações (email, CPF, etc)
│   │   ├── constants.ts               # Enums, status colors
│   │   ├── debounce.ts                # Debounce helper
│   │   └── storage.ts                 # LocalStorage wrapper
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── tailwind.css               # Tailwind directives
│   │   └── animations.css
│   │
│   ├── routes/
│   │   └── index.tsx                  # React Router config
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
│   ├── icons/
│   ├── logo.svg
│   └── favicon.ico
│
├── .env.example
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### **React Query Patterns (State Management)**

```typescript
// hooks/usePedidos.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { pedidoService } from '@/services/pedido.service';

export function usePedidos(filters?: PedidoFilters) {
  return useQuery({
    queryKey: ['pedidos', filters],
    queryFn: () => pedidoService.listar(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2,
  });
}

export function useCriarPedido() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PedidoCreateRequest) => pedidoService.criar(data),
    onSuccess: () => {
      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    },
    onError: (error: AxiosError) => {
      toast.error(`Erro ao criar pedido: ${error.response?.data.message}`);
    },
  });
}
```

### **Axios Interceptors (Auth + Tenant)**

```typescript
// services/api.ts
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor para injetar Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para refrescar token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tentar refrescar token
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        const newToken = await refreshToken(refresh);
        localStorage.setItem('auth_token', newToken);
        // Retry original request
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🐳 **4. INFRAESTRUTURA - Docker + Deployment**

### **Docker Compose (Desenvolvimento Local)**

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    container_name: microsass_postgres
    environment:
      POSTGRES_DB: microsass_marcenaria
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/init_db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U developer"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: microsass_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: microsass_backend
    environment:
      DATABASE_URL: postgresql://developer:dev_password@postgres:5432/microsass_marcenaria
      REDIS_URL: redis://redis:6379
      SECRET_KEY: ${SECRET_KEY}
      ENVIRONMENT: development
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: microsass_frontend
    environment:
      VITE_API_URL: http://localhost:8000/api
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
    command: npm run dev
    depends_on:
      - backend

  # Celery worker para tasks assíncronas
  celery:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: microsass_celery
    environment:
      DATABASE_URL: postgresql://developer:dev_password@postgres:5432/microsass_marcenaria
      REDIS_URL: redis://redis:6379
    command: celery -A app.tasks worker --loglevel=info
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

### **Dockerfile Backend**

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Expor porta
EXPOSE 8000

# Comando padrão
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Dockerfile Frontend**

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
```

---

## 🚀 **5. CI/CD - GitHub Actions**

### **Workflow de Deploy**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r backend/requirements-dev.txt
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost/test_db
        run: |
          cd backend
          pytest tests/ --cov=app

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and push Docker images
        run: |
          docker build -t ghcr.io/seu-usuario/microsass-backend:${{ github.sha }} ./backend
          docker build -t ghcr.io/seu-usuario/microsass-frontend:${{ github.sha }} ./frontend
          
          echo ${{ secrets.GITHUB_TOKEN }} | docker login ghcr.io -u $ --password-stdin
          docker push ghcr.io/seu-usuario/microsass-backend:${{ github.sha }}
          docker push ghcr.io/seu-usuario/microsass-frontend:${{ github.sha }}
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /app/microsass
            docker-compose pull
            docker-compose up -d
```

---

## 📊 **6. MONITORAMENTO E LOGGING**

| Ferramenta | Uso |
|---|---|
| `structlog` | Logging estruturado em Python |
| `prometheus` | Métricas do sistema |
| `sentry` | Error tracking |
| `ELK Stack` ou `Datadog` | Logs centralizados (produção) |

```python
# app/core/logging.py
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()
```

---

## 📋 **RESUMO: Stack por Camada**

| Camada | Tecnologia | Versão | Uso |
|---|---|---|---|
| **Database** | PostgreSQL | 15+ | Banco de dados principal com RLS |
| **ORM** | SQLAlchemy | 2.0+ | Modelagem de dados |
| **Backend** | FastAPI | 0.104+ | Framework REST API |
| **Async Jobs** | Celery + Redis | 5.3+/7.0+ | Notificações, PDFs |
| **Auth** | Python-Jose | 3.3+ | JWT tokens |
| **PDF** | WeasyPrint | 59+ | Geração de documentos |
| **Frontend** | React | 18.2+ | Framework UI |
| **State** | TanStack Query | 5.0+ | Cache + fetching |
| **Forms** | React Hook Form | 7.48+ | Gerenciamento de formulários |
| **CSS** | TailwindCSS | 3.3+ | Utility-first styling |
| **Tables** | TanStack Table | 8.10+ | Tabelas avançadas |
| **Charts** | Recharts | 2.10+ | Gráficos financeiros |
| **Calendar** | React Big Calendar | 1.8+ | Agenda |
| **Container** | Docker | 24+ | Containerização |
| **CI/CD** | GitHub Actions | - | Deploy automatizado |
| **Logging** | Structlog | 23+ | Logs estruturados |

---

## 🔐 **7. VARIÁVEIS DE AMBIENTE (.env)**

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/microsass_marcenaria
DATABASE_POOL_SIZE=20
DATABASE_ECHO=false

# Redis
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=seu_secret_key_super_seguro_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=microsass-documentos
AWS_REGION=us-east-1

# Email (SendGrid)
SENDGRID_API_KEY=xxx

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_WHATSAPP_NUMBER=+55999999999

# Sentry
SENTRY_DSN=xxx

# Frontend
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=MicroSaaS Marcenaria

# Ambiente
ENVIRONMENT=development
DEBUG=true
```

---

Esta é a **stack técnica completa e profissional** para seu MicroSaaS!
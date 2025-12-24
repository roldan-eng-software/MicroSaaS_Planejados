# 🪚 MicroSaaS Marcenaria

Sistema de gestão completo para marcenarias e móveis planejados, desenvolvido com arquitetura moderna, escalável e segura. O sistema permite gerenciar clientes, pedidos, orçamentos, financeiro e agenda de forma integrada e multi-tenant.

---

## 🚀 Funcionalidades Principais

### 👥 Gestão de Clientes
- Cadastro completo de clientes (PF/PJ).
- Histórico de pedidos e interações.
- Busca rápida e filtros avançados.

### 📝 Pedidos e Orçamentos
- Criação de orçamentos detalhados com itens e serviços.
- Fluxo de aprovação de status.
- **Geração automática de PDF** profissional para envio ao cliente.
- **Envio por E-mail** integrado (SendGrid) diretamente da plataforma.

### 💰 Financeiro
- Controle de pagamentos e parcelamento.
- Registro de entradas e status de parcelas.
- **Dashboard Financeiro** com KPIs (Ticket Médio, Receita Total) e gráficos de evolução.

### 📅 Agenda Inteligente
- Calendário interativo (Mês, Semana, Dia).
- Agendamento de visitas técnicas, medições e instalações.
- Integração visual com status dos compromissos.

### 🛡️ Segurança e Infraestrutura
- **Multi-tenancy:** Isolamento total de dados entre diferentes marcenarias.
- **Autenticação:** JWT (JSON Web Tokens) com expiração segura.
- **Proteção:** Rate Limiting (SlowAPI), Headers de Segurança, Hash de senhas (Bcrypt).
- **Background Tasks:** Processamento assíncrono com Celery e Redis (Emails, PDFs).
- **Monitoramento:** Integração pronta com Sentry.

---

## 🛠️ Stack Tecnológico

### Backend (API)
- **Linguagem:** Python 3.11
- **Framework:** FastAPI
- **Banco de Dados:** PostgreSQL 15
- **ORM:** SQLAlchemy + Alembic (Migrations)
- **Async:** Celery + Redis
- **Segurança:** OAuth2, Passlib, SlowAPI
- **Testes:** Pytest

### Frontend (SPA)
- **Framework:** React 18 (Vite)
- **Linguagem:** TypeScript
- **Estado Server-Side:** TanStack Query (React Query)
- **Estilização:** Tailwind CSS
- **Formulários:** React Hook Form + Zod
- **Componentes:** React Big Calendar, Recharts

### DevOps
- **Containerização:** Docker & Docker Compose
- **CI/CD:** GitHub Actions (Build, Test, Push to GHCR, Deploy via SSH)

---

## 📦 Como Rodar Localmente

### Pré-requisitos
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/microsaas-marcenaria.git
   cd microsaas-marcenaria
   ```

2. **Configure as variáveis de ambiente:**
   O projeto já possui configurações padrão para desenvolvimento no `docker-compose.yml`, mas para funcionalidades como envio de e-mail, crie um arquivo `.env` na pasta `backend`:
   ```env
   DATABASE_URL=postgresql+psycopg://app_user:app_password@db:5432/app_db
   SECRET_KEY=chave_secreta_dev
   CELERY_BROKER_URL=redis://redis:6379/0
   CELERY_RESULT_BACKEND=redis://redis:6379/0
   SENDGRID_API_KEY=sua_api_key_aqui
   MAIL_FROM=noreply@suamarcenaria.com
   ENVIRONMENT=local
   ```

3. **Inicie a aplicação:**
   ```bash
   docker-compose up --build
   ```

4. **Acesse:**
   - **Frontend:** http://localhost:5173
   - **Documentação da API (Swagger):** http://localhost:8000/docs
   - **Banco de Dados:** localhost:5432

---

## 🧪 Testes e Auditoria

Para rodar os testes de segurança simulados (Pentest):

```bash
docker-compose exec backend pytest tests/test_security_pentest.py
```

Consulte o arquivo SECURITY_AUDIT.md para ver o relatório de conformidade de segurança.

---

## 📂 Estrutura de Diretórios

```
microsaas-marcenaria/
├── backend/                # API Python/FastAPI
│   ├── app/
│   │   ├── core/           # Configurações globais
│   │   ├── middleware/     # Segurança e interceptadores
│   │   ├── models/         # Tabelas do Banco de Dados
│   │   ├── routes/         # Endpoints REST
│   │   ├── schemas/        # Validação de dados (Pydantic)
│   │   ├── services/       # Regras de negócio
│   │   └── tasks/          # Workers Celery
│   └── tests/              # Testes automatizados
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # UI Kits e componentes isolados
│   │   ├── hooks/          # Lógica de estado e API
│   │   ├── pages/          # Telas do sistema
│   │   └── services/       # Camada de rede (Axios)
└── docker-compose.yml      # Orquestração de containers
```

---

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Sinta-se livre para usar e modificar.
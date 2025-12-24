# ✔️ CHECKLIST DE DESENVOLVIMENTO - MicroSaaS Marcenaria

Este documento serve como um guia de tarefas para o desenvolvimento do projeto, permitindo o acompanhamento do progresso.

---

### ✅ **Fase 0: Estruturação e Autenticação (Concluído)**

- [x] **Backend:** Criar estrutura de diretórios (`core`, `middleware`, `utils`, etc.).
- [x] **Backend:** Instalar e configurar dependências Python.
- [x] **Backend:** Implementar modelos `BaseModel`, `Tenant` e `User`.
- [x] **Backend:** Implementar serviço de autenticação com JWT (`auth_service`).
- [x] **Backend:** Criar rotas de `login` e `registro`.
- [x] **Backend:** Implementar middleware de autenticação e multi-tenant.
- [x] **Banco de Dados:** Criar migration inicial para `tenants`, `users`, `clientes`, `pedidos`.
- [x] **Frontend:** Criar estrutura de diretórios (`pages`, `hooks`, `services`, `context`, etc.).
- [x] **Frontend:** Instalar e configurar dependências NPM.
- [x] **Frontend:** Configurar `axios` com interceptors (`api.ts`).
- [x] **Frontend:** Implementar `AuthContext` e `useAuth` hook.
- [x] **Frontend:** Criar páginas de `Login` e `Registro` com validação.
- [x] **Frontend:** Configurar roteamento (`react-router-dom`) com rotas públicas e privadas.

---

### ✅ **Fase 1: CRUD de Clientes (Concluído)**

- [x] **Backend:**
    - [x] Criar/Revisar schemas Pydantic para Cliente (`ClienteCreate`, `ClienteUpdate`, `ClienteRead`).
    - [x] Implementar `cliente_repo.py` com as queries (Create, Read, Update, Delete) filtrando por `tenant_id`.
    - [x] Implementar `cliente_service.py` com a lógica de negócio para o CRUD de clientes.
    - [x] Implementar os endpoints (`POST`, `GET`, `PUT`, `DELETE`) em `routes/clientes.py`.
    - [ ] Escrever testes automatizados para a API de clientes.
- [x] **Frontend:**
    - [x] Criar o serviço `cliente.service.ts` para as chamadas de API.
    - [x] Criar o hook `useClientes.ts` com TanStack Query.
    - [x] Implementar o componente `ClienteList.tsx` (tabela, busca, paginação).
    - [x] Implementar o componente `ClienteForm.tsx` (criação e edição com validação).
    - [x] Criar as páginas `ClientesPage.tsx` e `ClienteDetailPage.tsx`.
- [x] **Integração:**
    - [x] Conectar UI do frontend com a API do backend para o fluxo completo de clientes.
    - [x] Testar manualmente o fluxo de ponta a ponta.

---

### ✅ **Fase 2: CRUD de Pedidos e Orçamentos (Concluído)**

- [x] **Backend:**
    - [x] Criar/Revisar schemas para Pedido e Itens do Pedido.
    - [x] Implementar `pedido_repo.py`.
    - [x] Implementar `pedido_service.py` (lógica para cálculo de totais, etc.).
    - [x] Implementar endpoints em `routes/pedidos.py`.
    - [ ] Escrever testes para a API de pedidos.
- [x] **Frontend:**
    - [x] Criar serviço e hook `usePedidos.ts`.
    - [x] Implementar `PedidoList.tsx` com filtros por status.
    - [x] Implementar `PedidoForm.tsx` para criar e editar pedidos e seus itens.
    - [x] Desenvolver a `PedidoDetailPage.tsx` com abas (Detalhes, Financeiro, Agenda).

---

### ✅ **Fase 3: Financeiro e Pagamentos (Concluído)**

- [x] **Backend:**
    - [x] Criar modelos e schemas para Pagamentos e Parcelas.
    - [x] Implementar `pagamento_repo.py`.
    - [x] Implementar `pagamento_service.py` (lógica para gerar parcelas, registrar pagamentos).
    - [x] Implementar endpoints em `routes/pagamentos.py`.
    - [ ] Escrever testes para a API de pagamentos.
- [x] **Frontend:**
    - [x] Criar serviço e hook `usePagamentos.ts`.
    - [x] Desenvolver componentes para listar parcelas (`ParcelaList.tsx`).
    - [x] Criar modal/formulário para registrar um pagamento de parcela.
    - [x] Montar a aba "Financeiro" na página de detalhes do pedido.

---

### 📅 **Fase 4: Agenda e Compromissos**

- [ ] **Backend:**
    - [x] Criar modelo e schema para Compromissos (visitas, entregas).
    - [x] Implementar `compromisso_repo.py` e `compromisso_service.py`.
    - [x] Implementar endpoints em `routes/compromissos.py`.
- [ ] **Frontend:**
    - [x] Criar serviço e hook `useCompromissos.ts`.
    - [x] Integrar o `react-big-calendar` na página/aba de agenda.
    - [x] Criar formulário para agendar novos compromissos.

---

### 🚀 **Fase 5: Funcionalidades Avançadas**

- [ ] **Backend:**
    - [x] Configurar `Celery` e `Redis` para tarefas assíncronas.
    - [x] Implementar serviço de geração de PDFs (`weasyprint`) para orçamentos e pedidos.
    - [x] Implementar serviço de notificações por e-mail (`sendgrid`).
- [ ] **Frontend:**
    - [x] Adicionar botões para "Download PDF" e "Enviar por Email" nas páginas relevantes.

---

### ☁️ **Fase 6: Deploy e Produção**

- [ ] **Infraestrutura:**
    - [x] Finalizar e testar `docker-compose.yml` para produção.
    - [x] Configurar CI/CD com GitHub Actions para build e deploy automáticos.
- [ ] **Monitoramento:**
    - [x] Integrar Sentry para error tracking.
    - [x] Configurar logging estruturado em produção.
- [ ] **Segurança:**
    - [x] Revisar todas as configurações (CORS, senhas, chaves secretas).
    - [x] Fazer um teste de penetração básico (Validado).
    - [x] Implementar Rate Limiting (proteção contra força bruta).
    - [x] Implementar Middleware de Headers de Segurança.

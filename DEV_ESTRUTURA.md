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

### 🏃 **Fase 1: CRUD de Clientes (Em Andamento)**

- [ ] **Backend:**
    - [ ] Criar/Revisar schemas Pydantic para Cliente (`ClienteCreate`, `ClienteUpdate`, `ClienteRead`).
    - [ ] Implementar `cliente_repo.py` com as queries (Create, Read, Update, Delete) filtrando por `tenant_id`.
    - [ ] Implementar `cliente_service.py` com a lógica de negócio para o CRUD de clientes.
    - [ ] Implementar os endpoints (`POST`, `GET`, `PUT`, `DELETE`) em `routes/clientes.py`.
    - [ ] Escrever testes automatizados para a API de clientes.
- [ ] **Frontend:**
    - [ ] Criar o serviço `cliente.service.ts` para as chamadas de API.
    - [ ] Criar o hook `useClientes.ts` com TanStack Query.
    - [ ] Implementar o componente `ClienteList.tsx` (tabela, busca, paginação).
    - [ ] Implementar o componente `ClienteForm.tsx` (criação e edição com validação).
    - [ ] Criar as páginas `ClientesPage.tsx` e `ClienteDetailPage.tsx`.
- [ ] **Integração:**
    - [ ] Conectar UI do frontend com a API do backend para o fluxo completo de clientes.
    - [ ] Testar manualmente o fluxo de ponta a ponta.

---

### 📝 **Fase 2: CRUD de Pedidos e Orçamentos**

- [ ] **Backend:**
    - [ ] Criar/Revisar schemas para Pedido e Itens do Pedido.
    - [ ] Implementar `pedido_repo.py`.
    - [ ] Implementar `pedido_service.py` (lógica para cálculo de totais, etc.).
    - [ ] Implementar endpoints em `routes/pedidos.py`.
    - [ ] Escrever testes para a API de pedidos.
- [ ] **Frontend:**
    - [ ] Criar serviço e hook `usePedidos.ts`.
    - [ ] Implementar `PedidoList.tsx` com filtros por status.
    - [ ] Implementar `PedidoForm.tsx` para criar e editar pedidos e seus itens.
    - [ ] Desenvolver a `PedidoDetailPage.tsx` com abas (Detalhes, Financeiro, Agenda).

---

### 💰 **Fase 3: Financeiro e Pagamentos**

- [ ] **Backend:**
    - [ ] Criar modelos e schemas para Pagamentos e Parcelas.
    - [ ] Implementar `pagamento_repo.py`.
    - [ ] Implementar `pagamento_service.py` (lógica para gerar parcelas, registrar pagamentos).
    - [ ] Implementar endpoints em `routes/pagamentos.py`.
- [ ] **Frontend:**
    - [ ] Criar serviço e hook `usePagamentos.ts`.
    - [ ] Desenvolver componentes para listar parcelas (`ParcelaList.tsx`).
    - [ ] Criar modal/formulário para registrar um pagamento de parcela.
    - [ ] Montar a aba "Financeiro" na página de detalhes do pedido.

---

### 📅 **Fase 4: Agenda e Compromissos**

- [ ] **Backend:**
    - [ ] Criar modelo e schema para Compromissos (visitas, entregas).
    - [ ] Implementar `compromisso_repo.py` e `compromisso_service.py`.
    - [ ] Implementar endpoints em `routes/compromissos.py`.
- [ ] **Frontend:**
    - [ ] Criar serviço e hook `useCompromissos.ts`.
    - [ ] Integrar o `react-big-calendar` na página/aba de agenda.
    - [ ] Criar formulário para agendar novos compromissos.

---

### 🚀 **Fase 5: Funcionalidades Avançadas**

- [ ] **Backend:**
    - [ ] Configurar `Celery` e `Redis` para tarefas assíncronas.
    - [ ] Implementar serviço de geração de PDFs (`weasyprint`) para orçamentos e pedidos.
    - [ ] Implementar serviço de notificações por e-mail (`sendgrid`).
- [ ] **Frontend:**
    - [ ] Adicionar botões para "Download PDF" e "Enviar por Email" nas páginas relevantes.

---

### ☁️ **Fase 6: Deploy e Produção**

- [ ] **Infraestrutura:**
    - [ ] Finalizar e testar `docker-compose.yml` para produção.
    - [ ] Configurar CI/CD com GitHub Actions para build e deploy automáticos.
- [ ] **Monitoramento:**
    - [ ] Integrar Sentry para error tracking.
    - [ ] Configurar logging estruturado em produção.
- [ ] **Segurança:**
    - [ ] Revisar todas as configurações (CORS, senhas, chaves secretas).
    - [ ] Fazer um teste de penetração básico.

# 🔐 CHECKLIST COMPLETO DE SEGURANÇA MULTITENANT

## 1️⃣ ISOLAMENTO DE DADOS (Row Level Security)

### ✅ Nivel 1: Database (PostgreSQL RLS)

- [ ] **Habilitar RLS em todas as tabelas multitenant**
```sql
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE compromissos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE custos ENABLE ROW LEVEL SECURITY;
```

- [ ] **Criar policies por tabela**
```sql
CREATE POLICY clientes_tenant_isolation ON clientes
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY pedidos_tenant_isolation ON pedidos
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

- [ ] **Testar RLS com queries diretas**
```bash
# Tentar acessar dados de outro tenant DEVE falhar
psql -U developer -d microsass_marcenaria
SET app.current_tenant_id = '00000000-0000-0000-0000-000000000001';
SELECT * FROM clientes WHERE tenant_id = '00000000-0000-0000-0000-000000000002';
-- Resultado esperado: 0 rows (segurança ativa!)
```

### ✅ Nivel 2: Application Layer

- [ ] **Middleware valida tenant_id em cada request**
```python
async def auth_middleware(request: Request, call_next):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    payload = jwt.decode(token, settings.SECRET_KEY)
    
    # Injeta tenant_id no request
    request.state.tenant_id = payload["tenant_id"]
    
    # Define variável PostgreSQL para RLS
    db.execute(f"SET app.current_tenant_id = '{payload['tenant_id']}'")
    
    return await call_next(request)
```

- [ ] **Todas as queries filtram por tenant_id**
```python
# ❌ ERRADO - não filtra tenant
clientes = db.query(Cliente).all()

# ✅ CORRETO - filtra por tenant
clientes = db.query(Cliente).filter(
    Cliente.tenant_id == tenant_id
).all()
```

- [ ] **Dependency injection garante tenant_id**
```python
async def get_current_tenant_id(request: Request) -> uuid.UUID:
    if not hasattr(request.state, "tenant_id"):
        raise HTTPException(status_code=401)
    return request.state.tenant_id

@router.get("/clientes")
async def list_clientes(tenant_id: UUID = Depends(get_current_tenant_id)):
    # tenant_id é injetado automaticamente
    pass
```

---

## 2️⃣ AUTENTICAÇÃO & AUTORIZAÇÃO

### ✅ JWT Tokens

- [ ] **Payload inclui tenant_id + role**
```python
token_data = {
    "sub": str(user_id),  # user_id
    "tenant_id": str(tenant_id),
    "role": "admin",  # admin, gerente, operador
    "iat": datetime.utcnow(),
    "exp": datetime.utcnow() + timedelta(minutes=30)
}
token = jwt.encode(token_data, settings.SECRET_KEY, algorithm="HS256")
```

- [ ] **Tokens com expiration curta (30 min)**
- [ ] **Refresh token com duração mais longa (7 dias)**
- [ ] **Armazenar refresh tokens em database (não localStorage)**

### ✅ Senhas

- [ ] **Hash com Argon2 ou Bcrypt (min 12 rounds)**
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash
hashed_password = pwd_context.hash(plain_password)

# Verify
is_valid = pwd_context.verify(plain_password, hashed_password)
```

- [ ] **Nunca armazenar senhas em plain text**
- [ ] **Validar força de senha (min 12 caracteres, maiúsculas, números, símbolos)**

### ✅ RBAC (Role-Based Access Control)

- [ ] **Três roles: admin, gerente, operador**
```python
ROLES = {
    "admin": ["create_pedido", "delete_pedido", "view_financeiro", "manage_users"],
    "gerente": ["create_pedido", "view_pedido", "view_financeiro"],
    "operador": ["create_pedido", "view_pedido"]
}
```

- [ ] **Proteger endpoints com roles**
```python
async def require_role(required_roles: list[str]):
    async def verify(request: Request):
        user_role = request.state.user_role
        if user_role not in required_roles:
            raise HTTPException(status_code=403, detail="Forbidden")
    return verify

@router.delete("/pedidos/{id}")
async def deletar_pedido(
    id: UUID,
    _: None = Depends(require_role(["admin"]))
):
    # Apenas admin pode deletar
    pass
```

---

## 3️⃣ VALIDAÇÃO DE ENTRADA

### ✅ Pydantic Schemas

- [ ] **Todas as requests validadas com Pydantic**
```python
class ClienteCreate(BaseModel):
    nome: str = Field(..., min_length=3, max_length=255)
    cpf_cnpj: str = Field(..., regex=r"^\d+$")
    email: EmailStr  # Valida email
    telefone_ddd: str = Field(..., regex=r"^\+\d{2}\s\d{2}\s\d{5}-\d{4}$")
```

- [ ] **SQL Injection prevention (usar ORM sempre)**
```python
# ❌ NUNCA fazer isso
db.execute(f"SELECT * FROM clientes WHERE nome = '{nome}'")

# ✅ SEMPRE usar parametrizadas
db.query(Cliente).filter(Cliente.nome == nome)
```

- [ ] **XSS prevention (sanitizar HTML)**
```python
from bleach import clean

descricao_limpa = clean(descricao_raw, tags=[], strip=True)
```

- [ ] **Rate limiting em endpoints críticos**
```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginSchema):
    # Max 5 tentativas por minuto
    pass
```

---

## 4️⃣ DADOS SENSÍVEIS

### ✅ Criptografia

- [ ] **Dados sensíveis em repouso (encrypted)**
```python
from cryptography.fernet import Fernet

cipher = Fernet(settings.ENCRYPTION_KEY)

# Encrypt
encrypted_telefone = cipher.encrypt(telefone.encode())

# Decrypt
telefone = cipher.decrypt(encrypted_telefone).decode()
```

- [ ] **HTTPS obrigatório em produção**
```python
# Redirect HTTP → HTTPS
@app.middleware("http")
async def force_https(request, call_next):
    if request.headers.get("x-forwarded-proto") == "http":
        return RedirectResponse(f"https://{request.url.netloc}{request.url.path}")
    return await call_next(request)
```

- [ ] **Environment variables para secrets**
```python
# .env (NUNCA commitar)
SECRET_KEY=seu_secret_super_seguro
ENCRYPTION_KEY=sua_chave_de_encriptacao
DATABASE_URL=postgresql://...
```

- [ ] **AWS Secrets Manager para produção**
```python
import boto3

secrets_client = boto3.client('secretsmanager')
secret = secrets_client.get_secret_value(SecretId='microsass/prod/db-password')
```

---

## 5️⃣ AUDITORIA & LOGGING

### ✅ Audit Trail

- [ ] **Log todas as ações críticas**
```python
# app/models/audit_log.py
class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    
    user_id: UUID = Column(UUID, nullable=False)
    tenant_id: UUID = Column(UUID, nullable=False)
    action: str  # "CREATE_PEDIDO", "UPDATE_PAGAMENTO", etc
    entity_type: str  # "pedido", "cliente", etc
    entity_id: UUID
    changes: JSON  # Antes e depois
    ip_address: str
    timestamp: DateTime = Column(DateTime, default=datetime.utcnow)
```

- [ ] **Criar audit log em cada operação**
```python
async def criar_pedido(...):
    pedido = Pedido(...)
    db.add(pedido)
    db.commit()
    
    # Log auditoria
    audit = AuditLog(
        user_id=user_id,
        tenant_id=tenant_id,
        action="CREATE_PEDIDO",
        entity_type="pedido",
        entity_id=pedido.id,
        changes={"criado": True},
        ip_address=request.client.host
    )
    db.add(audit)
    db.commit()
```

### ✅ Structured Logging

- [ ] **Logs estruturados (JSON)**
```python
import structlog

logger = structlog.get_logger()

logger.info(
    "pedido_created",
    pedido_id=pedido_id,
    tenant_id=tenant_id,
    valor=valor_total,
    user_id=user_id
)
# Output: {"event": "pedido_created", "pedido_id": "...", "tenant_id": "...", "timestamp": "..."}
```

- [ ] **Logs centralizados em produção (ELK, Datadog, CloudWatch)**

### ✅ Error Tracking

- [ ] **Sentry para capturar exceções**
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment=settings.ENVIRONMENT
)
```

---

## 6️⃣ PROTEÇÃO CSRF & CORS

### ✅ CSRF Protection

- [ ] **CSRF tokens em formulários (se usar sessions)**
```python
from starlette_csrf import CSRFProtection

csrf_protection = CSRFProtection(secret_key=settings.SECRET_KEY)

@app.post("/pedidos")
@csrf_protection.protect
async def criar_pedido(request: Request):
    # Validar CSRF token
    pass
```

### ✅ CORS Configuration

- [ ] **CORS restritivo (não allow "*")**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://seu-dominio.com",
        "https://app.seu-dominio.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
```

- [ ] **SameSite cookies**
```python
# Set cookie com SameSite=Strict
response.set_cookie("session_id", session_id, samesite="strict", secure=True)
```

---

## 7️⃣ TESTES DE SEGURANÇA MULTITENANT

### ✅ Testes Automatizados

- [ ] **Teste de isolamento multitenant**
```python
# tests/test_multitenant.py
import pytest

@pytest.mark.asyncio
async def test_cliente_isolation():
    """Verificar que tenant A não vê dados do tenant B"""
    
    tenant_a_id = uuid.uuid4()
    tenant_b_id = uuid.uuid4()
    
    # Criar cliente em tenant A
    cliente_a = await cliente_repo.criar(tenant_a_id, {...})
    
    # Tentar acessar como tenant B
    result = await cliente_repo.obter_por_id(tenant_b_id, cliente_a.id)
    
    # Deve retornar None
    assert result is None
```

- [ ] **Teste de acesso não autorizado**
```python
async def test_unauthorized_access():
    """Verificar que usuário não autorizado não pode acessar"""
    
    response = await client.get(
        "/api/clientes",
        headers={"Authorization": "Bearer invalid_token"}
    )
    
    assert response.status_code == 401
```

- [ ] **Teste de SQL Injection**
```python
async def test_sql_injection_prevention():
    """Verificar que SQL injection não funciona"""
    
    malicious_input = "'; DROP TABLE clientes; --"
    
    response = await client.post(
        "/api/clientes",
        json={"nome": malicious_input, ...}
    )
    
    # Deve ser tratado como string normal
    assert response.status_code in [201, 422]
    
    # Tabela clientes deve continuar existindo
    clientes = db.query(Cliente).all()
    assert len(clientes) > 0
```

### ✅ Testes Manuais

- [ ] **Penetration Testing**
  - [ ] Tentar acessar dados de outro tenant via API
  - [ ] Tentar bypass de autenticação
  - [ ] Tentar manipular JWT
  - [ ] Tentar brute force em login
  - [ ] Tentar XSS em campos de entrada

- [ ] **Checklist de Segurança (OWASP)**
  - [ ] Broken Authentication
  - [ ] Sensitive Data Exposure
  - [ ] XML External Entities (XXE)
  - [ ] Broken Access Control
  - [ ] Security Misconfiguration
  - [ ] Injection (SQL, NoSQL, OS)
  - [ ] Cross-Site Scripting (XSS)
  - [ ] Using Components with Known Vulnerabilities

---

## 8️⃣ DEPLOY & PRODUÇÃO

### ✅ Security Headers

- [ ] **Content Security Policy**
```python
app.add_middleware(
    CustomHeaderMiddleware,
    headers={
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-XSS-Protection": "1; mode=block",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
    }
)
```

- [ ] **HSTS habilitado**
- [ ] **X-Content-Type-Options: nosniff**
- [ ] **X-Frame-Options: DENY**

### ✅ Database Backups

- [ ] **Backups automáticos daily**
```bash
# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U user database > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://seu-bucket/backups/
```

- [ ] **Testar restore regularmente**
- [ ] **Criptografar backups em repouso**

### ✅ SSL/TLS

- [ ] **Certificado SSL válido (Let's Encrypt)**
- [ ] **TLS 1.3+ obrigatório**
- [ ] **Disable SSLv3, TLSv1.0, TLSv1.1**

### ✅ Secrets Management

- [ ] **Nunca committar .env**
```bash
echo ".env" >> .gitignore
```

- [ ] **Usar AWS Secrets Manager ou equivalente**
- [ ] **Rotar secrets regularmente**

---

## 9️⃣ MONITORAMENTO CONTÍNUO

### ✅ Security Monitoring

- [ ] **Detectar tentativas de acesso não autorizado**
```python
# Alertar se > 5 falhas de login em 5 min
FAILED_LOGIN_ATTEMPTS.labels(tenant_id=tenant_id).inc()
```

- [ ] **Alertar se mudança de permissões**
- [ ] **Alertar se acesso a dados sensíveis**
- [ ] **Alertar se erro 403/401 frequente**

### ✅ Dependency Scanning

- [ ] **Verificar vulnerabilidades em dependências**
```bash
pip install safety
safety check

# Ou
pip install pip-audit
pip-audit
```

- [ ] **GitHub Dependabot habilitado**
- [ ] **Atualizar dependências regularmente**

---

## 🔟 CHECKLIST FINAL PRÉ-PRODUÇÃO

- [ ] RLS habilitado em TODAS as tabelas
- [ ] Todas as queries filtram por tenant_id
- [ ] JWT tokens com tenant_id + role
- [ ] Senhas com hash Bcrypt/Argon2
- [ ] HTTPS obrigatório
- [ ] Rate limiting em endpoints críticos
- [ ] Validação Pydantic em todos os inputs
- [ ] Logs estruturados de auditoria
- [ ] Testes de isolamento multitenant passando
- [ ] Sentry configurado para error tracking
- [ ] Secrets em AWS Secrets Manager (não .env)
- [ ] Backups automáticos testados
- [ ] WAF (Web Application Firewall) ativo
- [ ] DDoS protection (Cloudflare, etc)
- [ ] Security headers configurados
- [ ] OWASP Top 10 verificado
- [ ] Penetration test realizado
- [ ] Documentação de segurança atualizada

---

**Implementar segurança não é opcional—é obrigatório em um SaaS multitenant!**
from fastapi import FastAPI
from app.routes import clientes, auth, pedidos, pagamentos, compromissos, test_rate_limit
from app.middleware.cors import setup_cors
from app.middleware.auth import auth_middleware
from app.middleware.rate_limiter import setup_rate_limiter
from app.middleware.security import setup_security_headers
from app.middleware.error_handler import http_error_handler
from starlette.exceptions import ExceptionMiddleware
from app.core.sentry import init_sentry
from app.core.logging import setup_logging

setup_logging() # Configura logs antes de tudo
init_sentry() # Chame antes de criar a instância 'app = FastAPI()'


app = FastAPI(title="MicroSaaS Marcenaria API", version="1.0.0")

# Middlewares
setup_cors(app)
setup_rate_limiter(app)
setup_security_headers(app)
app.add_middleware(ExceptionMiddleware, handlers={500: http_error_handler})
app.middleware("http")(auth_middleware)

# Routers
app.include_router(auth.router, prefix="/api/auth")
app.include_router(clientes.router, prefix="/api")
app.include_router(pedidos.router, prefix="/api")
app.include_router(pagamentos.router, prefix="/api")
app.include_router(compromissos.router, prefix="/api")
app.include_router(test_rate_limit.router, prefix="/api/test")

@app.get("/health", tags=["Health"])
async def health_check():
    """Verifica se a API está online."""
    return {"status": "ok"}

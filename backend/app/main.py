from fastapi import FastAPI
from app.routes import clientes, auth
from app.middleware.cors import setup_cors
from app.middleware.auth import auth_middleware
from app.middleware.error_handler import http_error_handler
from starlette.exceptions import ExceptionMiddleware

app = FastAPI(title="MicroSaaS Marcenaria API", version="1.0.0")

# Middlewares
setup_cors(app)
app.add_middleware(ExceptionMiddleware, handlers={500: http_error_handler})
app.middleware("http")(auth_middleware)

# Routers
app.include_router(auth.router, prefix="/api/auth")
app.include_router(clientes.router, prefix="/api")

@app.get("/health", tags=["Health"])
async def health_check():
    """Verifica se a API está online."""
    return {"status": "ok"}

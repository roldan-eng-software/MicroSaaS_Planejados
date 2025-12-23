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

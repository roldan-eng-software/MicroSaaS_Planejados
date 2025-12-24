from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.config import settings

def setup_cors(app: FastAPI) -> None:
    """
    Configura o middleware de CORS com base nas configurações.
    """
    # Converte para lista de strings para o FastAPI
    origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
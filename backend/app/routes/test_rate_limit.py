from fastapi import APIRouter, Request
from app.middleware.rate_limiter import limiter

router = APIRouter(tags=["Test"])

@router.get("/rate-limit")
@limiter.limit("3/minute")
def test_rate_limit(request: Request):
    """
    Endpoint de teste para verificar o Rate Limiting.
    Limite: 3 requisições por minuto.
    """
    return {"status": "ok", "message": "Dentro do limite permitido"}
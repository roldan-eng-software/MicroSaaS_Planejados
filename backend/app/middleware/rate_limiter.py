from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Instância global do Limiter para ser importada nos routers (ex: auth)
# key_func=get_remote_address usa o IP do cliente como chave de identificação
limiter = Limiter(key_func=get_remote_address)

def setup_rate_limiter(app: FastAPI):
    """
    Configura o Rate Limiting na aplicação FastAPI.
    """
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)
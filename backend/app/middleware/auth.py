# app/middleware/auth.py
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
import jwt
from app.config import settings
from app.core.database import SessionLocal

async def auth_middleware(request: Request, call_next):
    """
    1. Extrai JWT do header
    2. Valida assinatura
    3. Injeta tenant_id e user_id no request.state
    4. Define variável PostgreSQL app.current_tenant_id para RLS
    """
    token = request.headers.get("Authorization", "")
    if not token.startswith("Bearer "):
        # Bypass for public endpoints if needed, or raise error
        return await call_next(request)

    token = token.replace("Bearer ", "")
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        request.state.tenant_id = payload.get("tenant_id")
        request.state.user_id = payload.get("sub")
        
        if not request.state.tenant_id or not request.state.user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Define o tenant_id para a sessão do banco de dados (RLS)
        # Esta é uma abordagem simplificada. Em produção, isso deve ser
        # gerenciado de forma mais robusta, talvez em uma dependência.
        db = SessionLocal()
        try:
            # O ideal é fazer isso por transação, não globalmente.
            db.execute(f"SET app.current_tenant_id = '{request.state.tenant_id}'")
        finally:
            db.close()
        
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    response = await call_next(request)
    return response


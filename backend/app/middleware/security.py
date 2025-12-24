from fastapi import FastAPI, Request

def setup_security_headers(app: FastAPI):
    """
    Configura middleware para adicionar headers de segurança HTTP nas respostas.
    Recomendação do relatório de auditoria de segurança (SEC-05).
    """
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        
        # Proteção contra Clickjacking (impede que o site seja aberto em iframe)
        response.headers["X-Frame-Options"] = "DENY"
        
        # Proteção contra MIME Sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # HSTS (HTTP Strict Transport Security) - Força HTTPS por 1 ano
        # Nota: Em ambiente local (HTTP), navegadores modernos podem ignorar para localhost
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response
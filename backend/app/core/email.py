import time
from app.core.celery_app import celery_app

@celery_app.task(name="enviar_email_boas_vindas")
def enviar_email_boas_vindas(email: str, nome: str):
    """
    Simula o envio de um e-mail de boas-vindas em background.
    """
    print(f"Iniciando envio de email para {nome} <{email}>...")
    # Simula delay de rede/SMTP
    time.sleep(5)
    print(f"Email enviado com sucesso para {email}!")
    return {"status": "sent", "email": email}
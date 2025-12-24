import os
import base64
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition

class NotificacaoService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("MAIL_FROM", "noreply@microsaasmarcenaria.com")

    def enviar_email(self, para: str, assunto: str, conteudo_html: str, anexo_bytes: bytes = None, nome_anexo: str = None):
        """
        Envia um e-mail usando a API do SendGrid.
        """
        if not self.api_key:
            print("Aviso: SENDGRID_API_KEY não configurada. Email não enviado.")
            return

        message = Mail(
            from_email=self.from_email,
            to_emails=para,
            subject=assunto,
            html_content=conteudo_html
        )

        if anexo_bytes and nome_anexo:
            encoded_file = base64.b64encode(anexo_bytes).decode()
            attachment = Attachment(
                FileContent(encoded_file),
                FileName(nome_anexo),
                FileType('application/pdf'),
                Disposition('attachment')
            )
            message.attachment = attachment

        try:
            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)
            return response.status_code
        except Exception as e:
            print(f"Erro ao enviar email via SendGrid: {str(e)}")
            raise e
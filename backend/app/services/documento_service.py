import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from typing import Any, Dict

class DocumentoService:
    def __init__(self):
        # Configura o diretório de templates
        self.template_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
        self.env = Environment(loader=FileSystemLoader(self.template_dir))

    def _formatar_moeda(self, valor):
        if valor is None:
            return "R$ 0,00"
        return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

    def gerar_pdf_pedido(self, pedido: Any) -> bytes:
        """
        Gera um PDF para um objeto Pedido (ou dicionário com estrutura similar).
        """
        template = self.env.get_template("pedido.html")
        
        # Adiciona filtros customizados se necessário
        self.env.filters["moeda"] = self._formatar_moeda

        # Prepara o contexto para o template
        context = {
            "pedido": pedido,
            "data_geracao": datetime.now().strftime("%d/%m/%Y às %H:%M"),
            "titulo_documento": "Orçamento" if getattr(pedido, "status", "") == "Aguardando Aprovação" else "Pedido"
        }

        # Renderiza HTML
        html_content = template.render(**context)

        # Gera PDF em memória
        return HTML(string=html_content).write_pdf()
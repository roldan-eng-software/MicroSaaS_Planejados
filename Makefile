.PHONY: help run stop down logs test seed reset-db shell deploy-local backup

help:
	@echo "🛠️  Comandos disponíveis no MicroSaaS Marcenaria:"
	@echo "  make run          - Sobe a aplicação (Docker Compose Up + Build)"
	@echo "  make stop         - Para os containers sem remover"
	@echo "  make down         - Para e remove containers e redes"
	@echo "  make logs         - Visualiza logs de todos os serviços em tempo real"
	@echo "  make test         - Executa os testes automatizados (Backend)"
	@echo "  make seed         - Popula o banco de dados com dados iniciais"
	@echo "  make reset-db     - Reseta o banco de dados (apaga volumes e recria)"
	@echo "  make shell        - Abre um terminal bash no container do backend"
	@echo "  make deploy-local - Roda a versão de produção localmente (teste de deploy)"
	@echo "  make backup       - Realiza backup do banco de dados para a pasta backups/"

run:
	docker compose up --build -d
	@echo "🚀 Aplicação iniciada!"
	@echo "   Backend (Docs): http://localhost:8000/docs"
	@echo "   Frontend:       http://localhost:5173"

stop:
	docker compose stop

down:
	docker compose down

logs:
	docker compose logs -f

test:
	docker compose exec backend pytest tests/

seed:
	docker compose exec backend python seed.py

reset-db:
	docker compose down -v
	@echo "🗑️  Volume do banco de dados removido. Execute 'make run' para subir novamente."

shell:
	docker compose exec backend bash

deploy-local:
	docker compose -f docker-compose.prod.yml up --build

backup:
	@bash scripts/backup.sh
# Postmortem: Instabilidade de bind-mounts em /run/media

**Resumo:**
Durante o desenvolvimento, o uso de um bind-mount a partir de um dispositivo externo montado em `/run/media` causou comportamentos intermitentes nos containers (arquivos ausentes, `npm ENOENT`, e reinicializações de container). Para mitigar, o projeto foi copiado para um caminho local estável (`~/projects/MicroSaaS_Planejados`), e um arquivo de origem limpo foi criado com `git archive` e validado.

## Causas
- Dispositivo externo com sistema de arquivos instável para operações de container.
- Arquivos grandes (venv, node_modules) incluídos em tentativas de arquivamento causaram truncamento/corrupção de `.tar.gz` em compressões anteriores.

## Ações corretivas tomadas
- Não usar bind-mounts de `/run/media` para ambientes de desenvolvimento ou produção de containers.
- Copiar o projeto para um caminho local estável e usar essa cópia como fonte canônica.
- Criar um `git archive` somente do código-fonte (exclui `venv`, `node_modules`) e validar a integridade (gzip -t e SHA256).
- Adicionar um mecanismo de espera no start do frontend para evitar `npm ENOENT` quando o bind-mount ainda não estiver pronto.
- Adicionar healthchecks para backend e frontend em `docker-compose.yml`.
- Adicionar workflow de smoke tests (`.github/workflows/smoke-tests.yml`) para prevenir regressões de start e health.

## Recomendações
- Evitar usar dispositivos externos para montar código fonte em containers; use locais persistentes ou volumes Docker.
- Armazenar backups do repositório (source-only) e validar checksums antes de apagar cópias originais.
- Validar scripts de arquivamento em diretórios limpos (sem `venv`/`node_modules`) ou usar `git archive`.

---

*Se desejar, posso:*
- Abrir um branch e PR com as mudanças (healthcheck + entrypoint wait + smoke tests + docs).
- Ajudar a validar e executar o workflow de CI localmente ou no GitHub.

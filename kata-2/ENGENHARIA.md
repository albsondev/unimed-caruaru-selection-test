# Kata 2 - Engenharia

## 1. Decisoes de arquitetura no backend

Estruturei a API em quatro camadas:

- `domain`: contratos centrais da entidade `Task`
- `application`: servico com regras de negocio e validacoes
- `infrastructure`: repositorio em arquivo JSON com escrita atomica
- `presentation`: rotas HTTP, validacao de payload e traducao de erros

Essa separacao reduz acoplamento, facilita testes e torna a troca de persistencia relativamente simples. Se eu decidir migrar de JSON para SQLite ou PostgreSQL, a mudanca principal fica concentrada na implementacao do repositorio.

Tambem optei por `Fastify` por ser enxuto, performatico e simples de observar, o que combina bem com um painel interno de pequena escala que pode crescer.

## 2. Como garantir confiabilidade em producao

Eu focaria, no minimo, nestes pilares:

- `Observabilidade`: logs estruturados com correlacao por request, metricas de latencia, taxa de erro e volume por endpoint
- `Confiabilidade operacional`: health checks, tratamento padronizado de erros, timeouts, validacao de entrada e deploy automatizado com smoke tests

Em uma versao de producao real, eu incluiria ainda:

- persistencia transacional em banco relacional
- backups e estrategia de restauracao
- testes automatizados no pipeline de CI
- monitoramento com alertas para disponibilidade e degradacao de performance

## 3. O que mudaria para suportar multiplos usuarios com autenticacao

A arquitetura atual e intencionalmente single-user. Para evoluir para multitenancy simples com autenticacao, eu faria:

- adicionar identidade de usuario no dominio (`userId` em `Task`)
- incluir camada de autenticacao com JWT ou sessao
- proteger os endpoints e filtrar acesso por usuario autenticado
- mover a persistencia para banco relacional com indices por `userId` e `status`
- revisar contratos e testes para garantir isolamento de dados entre usuarios

Tambem passaria a considerar requisitos nao funcionais adicionais, como seguranca, auditoria, controle de acesso e LGPD, que nao sao relevantes no MVP atual, mas passam a ser criticos num ambiente multiusuario.

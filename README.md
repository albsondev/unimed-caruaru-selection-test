# Teste de Selecao - Unimed Caruaru

## Identificacao

- Nome completo: `PREENCHER_ANTES_DA_ENTREGA`
- Telefone de contato: `PREENCHER_ANTES_DA_ENTREGA`
- E-mail: `PREENCHER_ANTES_DA_ENTREGA`

## Stack utilizada e justificativa

Escolhi uma arquitetura multi-stack, alinhada ao contexto do teste e ao ambiente disponível:

- `TypeScript` para os Katas 1 e 2, garantindo tipagem forte, legibilidade, refatoração segura e uma base consistente para backend e frontend.
- `Fastify + Node.js` no backend do Kata 2, priorizando simplicidade operacional, boa performance e baixo overhead.
- `React + Vite` no frontend do Kata 2, para entregar uma interface clara, rápida e fácil de manter.
- `Python 3.13` com biblioteca padrão no Kata 4, por ser uma escolha pragmática para ETL, manipulação de CSV e automação de dados sem dependências externas.

Observacao importante: a stack sugerida no enunciado inclui `.NET`, mas o ambiente local disponibilizado para a execução deste projeto nao possui o SDK instalado. Optei por manter a entrega em tecnologias igualmente adequadas, priorizando portabilidade, produtividade e qualidade arquitetural.

## Estrutura do repositorio

- `kata-1/`: fila de triagem, testes e analise
- `kata-2/`: requisitos, API REST, frontend e documento de engenharia
- `kata-3/`: plano tecnico para o sistema legado
- `kata-4/`: pipeline de transformacao, dados de exemplo, indicadores e analise

## Como executar

### Requisitos

- `Node.js 24+`
- `Python 3.13+`

### Instalar dependencias JavaScript

```bash
npm install
```

### Kata 1

```bash
npm run test -w kata-1
```

### Kata 2 - API

```bash
npm run dev:api
```

API padrao em `http://localhost:3001`.

### Kata 2 - Frontend

Em outro terminal:

```bash
npm run dev:web
```

Frontend padrao em `http://localhost:5173`.

Para apontar o frontend para outro host da API, crie `kata-2/web/.env.local` com:

```bash
VITE_API_BASE_URL=http://localhost:3001
```

### Kata 2 - Testes do backend

```bash
npm run test -w kata-2/api
```

### Kata 3

Leitura direta do documento:

```bash
kata-3/PLANO.md
```

### Kata 4

Gerar o consolidado e os indicadores:

```bash
python kata-4/scripts/pipeline.py
```

Rodar testes:

```bash
python -m unittest discover -s kata-4/tests -p "test_*.py"
```

## Qualidade e boas praticas adotadas

- Separacao explicita entre dominio, aplicacao, infraestrutura e camada HTTP no backend.
- Tipagem rigorosa e contratos bem definidos.
- Regras de negocio isoladas e extensiveis.
- Persistencia desacoplada por interface.
- Escrita atomica em arquivo no backend para reduzir risco de corrupcao.
- Testes cobrindo regras de negocio criticas.
- Documentacao de trade-offs e decisoes de engenharia.

## O que eu faria diferente com mais tempo

- Substituir a persistencia em arquivo do Kata 2 por PostgreSQL ou SQLite com migrations e testes de integracao mais profundos.
- Adicionar autenticacao, autorizacao e rastreabilidade de usuario no painel de tarefas.
- Incluir CI com lint, typecheck, testes, build e cobertura.
- Adicionar telemetria estruturada e dashboards para o backend.
- Evoluir o pipeline do Kata 4 para processamento particionado e orientado a lotes com DuckDB/Polars ou Spark, conforme volume.

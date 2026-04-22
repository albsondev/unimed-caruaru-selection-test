# Teste de Selecao - Unimed Caruaru

## Identificacao

- Nome completo: `Andre Albson Santos Xavier`
- Telefone de contato: `(81) 9 9899-4052`
- E-mail: `albsondev@outlook.com`

## Repositorio

- GitHub: [albsondev/unimed-caruaru-selection-test](https://github.com/albsondev/unimed-caruaru-selection-test)

## Stack utilizada e justificativa

Escolhi uma arquitetura multi-stack, alinhada ao contexto do teste e ao ambiente disponivel:

- `TypeScript` no Kata 1 e no frontend do Kata 2, garantindo tipagem forte, legibilidade e refatoracao segura.
- `C# / ASP.NET Core` no backend do Kata 2, para aderir de forma mais proxima a stack sugerida pela equipe da Unimed Caruaru.
- `React + Vite` no frontend do Kata 2, para entregar uma interface clara, rapida e facil de manter.
- `Python 3.13` com biblioteca padrao no Kata 4, por ser uma escolha pragmatica para ETL, manipulacao de CSV e automacao de dados sem dependencias externas.

Para aumentar a aderencia ao ambiente real descrito no enunciado, priorizei `.NET` exatamente no ponto de maior relevancia para a vaga: a API/backend do Kata 2. O arquivo `global.json` fixa a versao do SDK usada no projeto.

## Estrutura do repositorio

- `kata-1/`: fila de triagem, testes e analise
- `kata-2/`: requisitos, API REST, frontend e documento de engenharia
- `kata-3/`: plano tecnico do sistema legado
- `kata-4/`: pipeline de transformacao, dados de exemplo, indicadores e analise

## Como executar

### Requisitos

- `Node.js 24+`
- `.NET SDK 10.0.203+`
- `Python 3.13+`

### Instalar dependencias JavaScript

```bash
npm install
```

### Rodar validacao completa

```bash
npm run typecheck
npm run test
npm run build
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
scripts\dotnet.cmd test kata-2/api/tests/TaskPanel.Api.Tests/TaskPanel.Api.Tests.csproj
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
- Aderencia intencional a `C# / ASP.NET Core` no backend principal do desafio full-stack.
- Tipagem rigorosa e contratos bem definidos.
- Regras de negocio isoladas e extensiveis.
- Persistencia desacoplada por interface.
- Escrita atomica em arquivo no backend para reduzir risco de corrupcao.
- Testes cobrindo regras de negocio criticas.
- Documentacao de trade-offs e decisoes de engenharia.
- Historico de commits organizado por entregavel.

## O que eu faria diferente com mais tempo

- Substituir a persistencia em arquivo do Kata 2 por PostgreSQL ou SQLite com migrations e testes de integracao mais profundos.
- Adicionar autenticacao, autorizacao e rastreabilidade de usuario no painel de tarefas.
- Incluir CI com lint, typecheck, testes, build e cobertura.
- Adicionar telemetria estruturada e dashboards para o backend.
- Evoluir o pipeline do Kata 4 para processamento particionado e orientado a lotes com DuckDB, Polars ou Spark, conforme volume.

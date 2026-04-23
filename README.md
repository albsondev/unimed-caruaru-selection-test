# Teste de Selecao - Unimed Caruaru

## Identificacao

- Nome completo: `Andre Albson Santos Xavier`
- Telefone de contato: `(81) 9 9899-4052`
- E-mail: `albsondev@outlook.com`

## Repositorio

- GitHub: [albsondev/unimed-caruaru-selection-test](https://github.com/albsondev/unimed-caruaru-selection-test)

## Visao geral da entrega

Este repositorio foi estruturado para atender aos quatro katas propostos com foco em:

- clareza de raciocinio e documentacao das decisoes
- arquitetura simples, extensivel e aderente ao contexto de cada problema
- validacao automatizada sempre que o kata envolve codigo executavel
- equilibrio entre pragmatismo de entrega e qualidade de engenharia

Priorizei a stack sugerida sempre que isso aumentava a aderencia ao contexto da vaga. Por esse motivo, o backend do Kata 2, que concentra a parte full-stack mais relevante do desafio, foi implementado em `C# / ASP.NET Core`.

## Stack utilizada e justificativa

Adotei uma arquitetura multi-stack alinhada ao contexto do teste e ao ambiente disponivel:

- `TypeScript` no Kata 1 e no frontend do Kata 2, garantindo tipagem forte, legibilidade e refatoracao segura.
- `C# / ASP.NET Core` no backend do Kata 2, para aderir de forma mais proxima a stack sugerida pela equipe da Unimed Caruaru.
- `React + Vite` no frontend do Kata 2, para entregar uma interface clara, rapida e facil de manter.
- `Python 3.13` com biblioteca padrao no Kata 4, por ser uma escolha pragmatica para ETL, manipulacao de CSV e automacao de dados sem dependencias externas.

Para aproximar a entrega do ambiente real descrito no enunciado, concentrei o uso de `.NET` exatamente no ponto de maior relevancia para a vaga: a API do Kata 2. O arquivo `global.json` fixa a versao do SDK usada no projeto.

## Estrutura do repositorio

- `kata-1/`: fila de triagem, testes e analise
- `kata-2/`: requisitos, API REST, frontend e documento de engenharia
- `kata-3/`: plano tecnico do sistema legado
- `kata-4/`: pipeline de transformacao, dados de exemplo, indicadores e analise

## Visao executiva por kata

### Kata 1 - Fila de triagem

- objetivo: ordenar pacientes com base em regras de prioridade e FIFO
- implementacao: modulo `TypeScript` com pipeline de regras extensivel
- qualidade: testes unitarios cobrindo regras criticas e casos de borda
- documentacao: analise tecnica e modelagem SQL opcional

### Kata 2 - Painel de tarefas

- objetivo: entregar uma feature full-stack com analise de requisitos, API e frontend
- backend: `ASP.NET Core` com Minimal API, servico de aplicacao e repositorio em JSON
- frontend: `React + TypeScript + Vite`
- qualidade: testes automatizados do backend, contrato HTTP consistente e persistencia atomica em arquivo

### Kata 3 - Sistema legado em colapso

- objetivo: produzir um plano tecnico priorizado para um contexto realista de incidentes
- entregavel: documento executivo com diagnostico, plano de acao, decisao arquitetural e RNFs negligenciados
- foco: priorizacao, trade-offs e maturidade de engenharia

### Kata 4 - Pipeline de dados

- objetivo: ler, limpar, consolidar e analisar dados inconsistentes de multiplos CSVs
- implementacao: pipeline em `Python` com tratamento deterministico e idempotente
- qualidade: testes de parsing e normalizacao, relatorio de qualidade e arquivos de saida gerados

## Arquitetura e tecnicas adotadas

- `Separation of concerns`: dominio, aplicacao, infraestrutura e borda HTTP separados onde faz sentido
- `KISS`: evitar complexidade estrutural desnecessaria para um teste tecnico com escopo controlado
- `DRY`: centralizacao de regras, parsers e contratos em pontos unicos de manutencao
- `Open for extension`: Kata 1 modelado como pipeline de regras de triagem
- `Persistencia pragmatica`: JSON local para MVPs com escrita atomica e baixo acoplamento
- `Stack aderente`: uso de `ASP.NET Core` no backend do Kata 2, `React + TypeScript` no frontend e `Python` no pipeline
- `Documentacao decisional`: arquivos dedicados para explicar ambiguidades, RF/RNF, arquitetura e trade-offs

## Garantias de qualidade

- `Kata 1`: testes unitarios da logica de triagem
- `Kata 2`: testes automatizados do backend `.NET`, validacao de build e integracao funcional com o frontend
- `Kata 3`: documento estruturado com criterio de priorizacao e metricas sugeridas
- `Kata 4`: testes do pipeline, relatorio de qualidade e geracao de artefatos consolidados
- `Repositorio`: historico de commits organizado por entregavel e evolucao tecnica

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

## Checklist de aderencia ao edital

- `README.md` raiz com nome, telefone, e-mail, stack, instrucoes e comentarios finais: atendido
- `Kata 1` com implementacao, testes unitarios e analise escrita: atendido
- `Kata 2` com `REQUISITOS.md`, API, frontend e documento de engenharia: atendido
- `Kata 3` com `PLANO.md` nas quatro secoes pedidas: atendido
- `Kata 4` com pipeline, dados de exemplo, indicadores e analise escrita: atendido
- repositorio publico no GitHub: atendido
- commits organizados por entregavel: atendido

Observacao: o envio do link por e-mail para a empresa e um passo externo ao repositorio e, portanto, depende da submissao final manual.

## O que eu faria diferente com mais tempo

- Substituir a persistencia em arquivo do Kata 2 por PostgreSQL ou SQLite com migrations e testes de integracao mais profundos.
- Adicionar autenticacao, autorizacao e rastreabilidade de usuario no painel de tarefas.
- Incluir CI com lint, typecheck, testes, build e cobertura.
- Adicionar telemetria estruturada e dashboards para o backend.
- Evoluir o pipeline do Kata 4 para processamento particionado e orientado a lotes com DuckDB, Polars ou Spark, conforme volume.

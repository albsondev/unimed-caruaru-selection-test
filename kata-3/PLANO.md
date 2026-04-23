# Kata 3 - Plano Tecnico

## Secao 1 - Diagnostico

| Problema | Causa raiz mais provavel | Risco tecnico e de negocio | Prioridade |
| :-- | :-- | :-- | :-- |
| Endpoint de consulta de pedidos com 8-12 segundos | Query sem indices adequados, N+1 entre pedidos e itens, ausencia de cache, payload excessivo e possivel contencao no banco em horario de pico | Degrada a experiencia do cliente, aumenta abandono, pressiona suporte e mascara outras falhas operacionais | Urgente e importante |
| Pedidos criados em duplicidade | Falta de idempotencia, ausencia de constraint unica, retries no cliente/servidor sem deduplicacao | Cobranca indevida, erro logistico, retrabalho operacional e dano reputacional | Urgente e importante |
| Correcao de frete em producao sem PR nem teste | Processo fragil de mudanca, ausencia de governanca de deploy e cultura de qualidade insuficiente | Regressao silenciosa, auditoria inexistente, risco financeiro e dependencia de conhecimento tacito | Importante e urgente |
| Arquivo de negocio com mais de 4.000 linhas | Crescimento organico sem refatoracao, falta de modularizacao e pressao por entrega imediata | Alto custo de manutencao, bugs recorrentes, onboarding lento e medo de alterar o codigo | Importante |
| Nenhum teste automatizado | Deficit historico de qualidade e ausencia de investimento em engenharia habilitadora | Mudancas lentas, regressao frequente e impossibilidade de evoluir com seguranca | Urgente e importante |

### Leitura pela matriz de Eisenhower

- `Urgente e importante`: lentidao do endpoint, duplicidade de pedidos, ausencia de testes, mudancas em producao sem processo
- `Importante`: arquivo monolitico de 4.000 linhas

Deliberadamente, eu nao classifico o arquivo de 4.000 linhas como o primeiro incendio a apagar, porque ele e uma fonte estrutural de risco, mas os incidentes que afetam receita e integridade transacional exigem resposta imediata.

## Secao 2 - Plano de acao

### Prioridade 1 - Eliminar duplicidade de pedidos

- O que sera feito:
  - mapear o fluxo de criacao do pedido ponta a ponta
  - introduzir chave de idempotencia no endpoint de criacao
  - criar constraint unica no banco para impedir duplicidade tecnica
  - revisar retries no cliente e no backend
  - registrar auditoria do pedido com correlacao por request
- Esforco estimado:
  - `2 a 4 dias`, dependendo da facilidade de alterar contrato com o cliente chamador
- Criterio de sucesso:
  - nenhum pedido duplicado em producao durante um periodo acordado
  - alertas sem ocorrencias de violacao da regra de unicidade
  - cobertura automatizada para cenarios de retry e concorrencia

### Prioridade 2 - Reduzir a latencia do endpoint de consulta

- O que sera feito:
  - capturar traces e metricas do endpoint para localizar o gargalo real
  - analisar o plano de execucao das queries e adicionar indices faltantes
  - eliminar N+1 e ajustar projections para retornar somente o necessario
  - considerar cache de leitura para consultas repetitivas
  - definir SLO de latencia e baseline antes/depois
- Esforco estimado:
  - `2 a 5 dias`, dependendo do acoplamento entre ORM, banco e serializacao
- Criterio de sucesso:
  - `p95 < 1.5s` em horario de pico para o endpoint principal
  - reducao consistente do uso de CPU/IO no banco
  - dashboard com metricas comparativas antes/depois

### Prioridade 3 - Criar uma malha minima de seguranca para mudancas

- O que sera feito:
  - bloquear alteracoes diretas em producao sem PR
  - criar pipeline minimo com build, testes e aprovacao
  - escrever testes de caracterizacao para os fluxos criticos: criacao de pedido, calculo de frete e consulta
  - definir checklist de release e rollback
- Esforco estimado:
  - `3 a 6 dias` para estabelecer a base sem tentar cobrir tudo
- Criterio de sucesso:
  - nenhuma mudanca em producao sem rastreabilidade
  - pipeline executando automaticamente em toda alteracao
  - testes protegendo os fluxos criticos com execucao recorrente no CI

## Secao 3 - Decisao de arquitetura

Eu escolheria a **Opcao A - refatoracao incremental**.

O contexto pesa mais do que a tentacao da reescrita: o sistema esta em producao, nao tem testes, o time ja esta ocupado e existem incidentes ativos. Nesse cenario, reescrever o modulo inteiro do zero aumenta demais o risco de regressao, alonga o tempo ate a captura de valor e cria uma segunda codebase mental para um time que ja opera no limite.

A refatoracao incremental me permite:

- estabilizar primeiro o que gera impacto financeiro e operacional
- escrever testes de caracterizacao ao redor do comportamento atual
- extrair modulos menores em fatias seguras
- medir ganho de qualidade a cada etapa, sem big bang

Eu so consideraria reescrita parcial se, durante a instrumentacao e os testes de caracterizacao, ficasse provado que uma parte especifica do modulo esta irreparavelmente acoplada ou inviavel de manter. Mesmo assim, faria isso por estrangulamento, e nao por substituicao total imediata.

## Secao 4 - RNFs ignorados

### 1. Desempenho

- Por que esta comprometido:
  - o endpoint principal leva `8-12 segundos` em horario de pico, o que viola qualquer expectativa razoavel de resposta para consulta operacional
- Metrica sugerida:
  - `p95` e `p99` de latencia por endpoint

### 2. Confiabilidade

- Por que esta comprometido:
  - houve duplicidade de pedidos e alteracao manual em producao sem trilha de seguranca
- Metrica sugerida:
  - taxa de pedidos duplicados por mil requisicoes e `change failure rate`

### 3. Manutenibilidade

- Por que esta comprometido:
  - o dominio esta concentrado em um unico arquivo de mais de 4.000 linhas e nao ha testes automatizados
- Metrica sugerida:
  - complexidade ciclomatica por modulo, cobertura de testes dos fluxos criticos e lead time de mudanca

### 4. Auditabilidade

- Por que esta comprometido:
  - uma correcao foi feita diretamente em producao, sem PR e sem teste, o que impede rastrear decisao, aprovacao e impacto
- Metrica sugerida:
  - percentual de deploys com PR aprovado, changelog e rollback documentado

### 5. Disponibilidade operacional

- Por que esta comprometido:
  - latencia alta e mudancas sem governanca geralmente antecedem indisponibilidade parcial ou total
- Metrica sugerida:
  - `uptime` mensal, taxa de erro `5xx` e numero de incidentes por semana

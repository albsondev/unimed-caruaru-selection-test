# Kata 2 - Requisitos

## 1. Ambiguidades identificadas

### Ambiguidade 1 - Quem e o dono das tarefas?

- Pergunta ao cliente: as tarefas sao pessoais por usuario, compartilhadas por equipe ou globais?
- Decisao adotada: considerei um painel single-user na primeira versao, com escopo local e sem autenticacao.

### Ambiguidade 2 - O que exatamente significa "situacao"?

- Pergunta ao cliente: a situacao tem somente os estados `pendente` e `concluida` ou existe um fluxo maior, como `em andamento`, `bloqueada` e `cancelada`?
- Decisao adotada: formalizei apenas `pending` e `completed`, porque sao os estados explicitamente mencionados e suficientes para o MVP.

### Ambiguidade 3 - Exclusao e fisica ou logica?

- Pergunta ao cliente: ao deletar uma tarefa, ela deve ser removida permanentemente ou arquivada para auditoria?
- Decisao adotada: implementei exclusao fisica, por simplicidade e aderencia ao pedido literal do cliente.

### Ambiguidade 4 - Quais validacoes devem existir no titulo?

- Pergunta ao cliente: existe tamanho minimo, maximo ou restricao de duplicidade para o titulo?
- Decisao adotada: exigi titulo obrigatorio com 3 a 140 caracteres, normalizando espacos em branco.

### Ambiguidade 5 - Prioridade ja deve influenciar comportamento?

- Pergunta ao cliente: prioridade entra apenas como campo futuro ou ja deve impactar ordenacao e filtros?
- Decisao adotada: tratei como item de backlog e nao o inclui no contrato da API para evitar complexidade prematura.

## 2. Requisitos Funcionais (RF)

- `RF-01`: o sistema deve permitir cadastrar uma nova tarefa informando um titulo.
- `RF-02`: o sistema deve listar todas as tarefas cadastradas.
- `RF-03`: o sistema deve permitir filtrar tarefas por status (`pendente` ou `concluida`).
- `RF-04`: o sistema deve permitir alterar o status de uma tarefa.
- `RF-05`: o sistema deve permitir editar o titulo de uma tarefa.
- `RF-06`: o sistema deve permitir excluir uma tarefa.
- `RF-07`: o sistema deve apresentar feedback visual de carregamento, erro e sucesso na interface.

## 3. Requisitos Nao Funcionais (RNF)

- `RNF-01 - Usabilidade`: a interface deve permitir criar, concluir, filtrar e excluir tarefas em poucos cliques, sem treinamento.
- `RNF-02 - Desempenho`: a API deve responder operacoes simples em tempo subsegundo no contexto do MVP local.
- `RNF-03 - Confiabilidade`: a persistencia deve sobreviver a reinicializacao do processo sem corromper os dados gravados.
- `RNF-04 - Manutenibilidade`: o backend deve ser organizado em camadas e com testes automatizados cobrindo os fluxos principais.
- `RNF-05 - Portabilidade`: a aplicacao deve rodar localmente com setup simples, sem exigir banco externo.

## 4. Tratamento do item de prioridade no backlog

Eu o classificaria como `should have`, e nao como `must have`, seguindo a leitura MoSCoW. Ele tem valor claro para o produto, mas o proprio cliente sinalizou que pode ficar para depois. Na pratica:

- manteria o item no backlog do produto, com descricao funcional e criterios objetivos de aceite
- evitaria contaminar o MVP com campos e regras ainda nao confirmados
- deixaria a arquitetura preparada para evolucao futura, por exemplo com `PATCH` generico e camada de dominio isolada

Essa abordagem reduz risco de retrabalho e preserva foco no fluxo principal solicitado pelo cliente.

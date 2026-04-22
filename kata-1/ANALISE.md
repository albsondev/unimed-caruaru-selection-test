# Kata 1 - Analise

## 1. Estrutura de dados escolhida

Modelei a fila como uma lista imutavel de pacientes enriquecida com metadados derivados, em especial:

- `effectiveUrgency`: prioridade final apos aplicar as regras de negocio
- `arrivalRank`: representacao numerica do horario de chegada
- `index`: indice original da entrada para manter estabilidade em empates absolutos

Essa escolha foi intencionalmente simples e transparente. Como o problema pede a fila ordenada a partir de uma lista recebida, a estrutura mais adequada e legivel e uma colecao ordenada por comparador. Ela reduz complexidade acidental, facilita testes e ainda permite extensao por novas regras sem acoplar a ordenacao a uma implementacao de heap ou fila de prioridade mutavel.

## 2. Complexidade do algoritmo

O algoritmo tem duas etapas:

- calculo da urgencia efetiva para cada paciente: `O(n * r)`, onde `r` e a quantidade de regras
- ordenacao da lista: `O(n log n)`

Na pratica, com um conjunto pequeno e um numero fixo de regras, a complexidade dominante e `O(n log n)`.

Se a lista tivesse 1 milhao de pacientes, a abordagem ainda seria correta, mas eu revisaria dois pontos:

- processamento em streaming ou particionado, caso o volume nao coubesse confortavelmente em memoria
- eventualmente substituir a ordenacao completa por uma estrategia em buckets, pois existem apenas quatro niveis de prioridade

Com buckets por prioridade e ordenacao apenas local quando necessario, o custo pode se aproximar de `O(n)` para parte do problema, preservando a regra FIFO.

## 3. Interacao entre as regras 4 e 5

As regras 4 e 5 nao entram em conflito, porque atuam sobre grupos diferentes:

- regra 4: pacientes com 60 anos ou mais e urgencia `MEDIUM`
- regra 5: pacientes menores de 18 anos, qualquer urgencia

Para um paciente de 15 anos com urgencia `MEDIUM`, apenas a regra 5 se aplica. O resultado final e uma promocao de `MEDIUM` para `HIGH`.

Mesmo em um modelo futuro com regras sobrepostas, a implementacao atual continua segura porque aplica as regras em cadeia sobre a prioridade corrente. Isso deixa explicita a ordem de aplicacao e facilita auditoria do comportamento.

## 4. Extensibilidade para uma sexta regra

O codigo foi desenhado com uma pequena pipeline de regras:

- cada regra recebe `patient` e `currentUrgency`
- cada regra devolve a prioridade resultante
- a funcao principal aplica todas as regras sequencialmente

Na pratica, uma nova regra pode ser adicionada criando uma nova funcao do tipo `TriageRule` e incluindo-a no array `defaultTriageRules`.

Esse desenho segue o principio aberto/fechado em um nivel pragmatico: o comportamento e extensivel sem precisar reescrever o algoritmo de ordenacao ou espalhar condicionais por varios pontos do codigo.

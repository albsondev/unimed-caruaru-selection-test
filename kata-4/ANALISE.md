# Kata 4 - Analise

## 1. Principais decisoes de tratamento

Adotei as seguintes decisoes para garantir consistencia, previsibilidade e rastreabilidade do pipeline:

- datas em formatos mistos sao convertidas para `datetime` usando um parser tolerante a `DD/MM/AAAA`, `AAAA-MM-DD`, ISO e timestamps numericos
- valores monetarios sao normalizados para `Decimal`, aceitando virgula como separador decimal
- registros com campos obrigatorios ausentes em `pedidos.csv` ou `clientes.csv` sao rejeitados e contabilizados no relatorio de qualidade
- entregas com `id_pedido` inexistente sao tratadas como `orphan records`, excluidas do consolidado e registradas no relatorio de qualidade
- cidades sao normalizadas para um formato canonico ASCII em `Title Case`, removendo acentos e variacoes de caixa

Evitei rejeicao silenciosa sempre que possivel. Sempre que um registro e descartado, o pipeline registra a razao em um arquivo de qualidade de dados para manter rastreabilidade.

## 2. Idempotencia

Sim. O pipeline e idempotente.

Ele sempre:

- le os mesmos arquivos de entrada
- aplica transformacoes deterministicas
- ordena o consolidado por `id_pedido`
- sobrescreve os arquivos de saida com o mesmo conteudo para a mesma entrada

Isso significa que rodar o processo duas ou mais vezes com os mesmos insumos gera exatamente o mesmo resultado.

## 3. O que eu mudaria para 10 milhoes de linhas

Com esse volume, eu deixaria de usar uma abordagem totalmente em memoria e adotaria uma estrategia orientada a volume:

- leitura em chunks ou processamento particionado
- engine colunar como `DuckDB` ou `Polars` para joins e agregacoes
- armazenamento intermediario em formato colunar, como `Parquet`
- validacoes e rejeicoes separadas por lote
- observabilidade de throughput, memoria e taxa de rejeicao

Se o pipeline fosse diario e critico para o negocio, eu tambem incluiria orquestracao, controle de versao dos schemas e testes de qualidade de dados em estilo de contrato.

## 4. Testes que eu escreveria

Os testes mais relevantes para assegurar a qualidade das transformacoes seriam:

- parser de datas cobrindo todos os formatos aceitos e datas invalidas
- parser monetario cobrindo `1234,56`, `1234.56` e valores nulos
- normalizacao de cidades para entradas com caixa e acentuacao diferentes
- consolidacao com registros orfaos em entregas
- calculo de `atraso_dias`, incluindo entrega antecipada, no prazo, atrasada e nao realizada
- idempotencia do pipeline para a mesma massa de dados

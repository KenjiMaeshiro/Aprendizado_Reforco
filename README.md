# Aprendizado por Reforço aplicado ao Deadlock

Trabalho acadêmico desenvolvido para a disciplina de Inteligência Computacional, referente ao tema Machine Learning 2 — Aprendizado por Reforço.

## Demonstração do projeto

**[Acesse o chatbot Deadlock](https://kenjimaeshiro.github.io/Aprendizado_Reforco/chatbot/)**

O chatbot funciona diretamente no navegador, sem necessidade de instalação de Python ou de bibliotecas adicionais.

## Sobre o projeto

O projeto consiste no desenvolvimento de um sistema de recomendação de heróis e itens para o jogo Deadlock, utilizando o algoritmo Q-learning.

Foi desenvolvido um ambiente de simulação de combate no qual um agente aprende, por meio de experiências e recompensas, quais decisões de compra proporcionam melhores resultados em diferentes situações.

O conhecimento adquirido durante o treinamento é disponibilizado por meio de um chatbot interativo.

## Objetivos

- Aplicar os conceitos de aprendizado por reforço em um problema prático.
- Desenvolver um ambiente de simulação de combates.
- Implementar o algoritmo Q-learning.
- Avaliar o desempenho do agente treinado em comparação com um agente aleatório.
- Disponibilizar recomendações de heróis e itens por meio de uma interface web.

## Metodologia

O projeto utiliza o Q-learning tabular, associado à estratégia epsilon-greedy, para equilibrar a exploração de novas ações e o aproveitamento do conhecimento adquirido.

| Componente | Aplicação |
|---|---|
| Agente | Algoritmo Q-learning |
| Ambiente | Simulador de combates do Deadlock |
| Estado | Herói, adversário, vida, almas, distância, inventário e duelos restantes |
| Ação | Comprar um item ou guardar almas |
| Recompensa | Resultado e desempenho durante o combate |
| Política | Seleção das ações com maior valor Q |

O treinamento também utiliza replay sistemático das transições conhecidas do simulador, permitindo ampliar a cobertura dos estados e ações.

### Configuração do ambiente

| Característica | Quantidade |
|---|---:|
| Heróis | 5 |
| Itens | 13 |
| Habilidades simuladas | 20 |
| Distâncias de combate | 3 |
| Episódios de treinamento por herói | 100.000 |
| Total de episódios | 500.000 |

Os personagens utilizados são Infernus, Viscoso, Vindicta, Abrams e Guarda.

## Etapas do desenvolvimento

### 1. Coleta e tratamento dos dados

Extração dos atributos dos personagens, armas, habilidades e itens por meio da Deadlock API.

Os dados são tratados e organizados em quatro arquivos CSV, utilizados posteriormente pelo ambiente.

### 2. Construção do ambiente

Implementação das mecânicas de combate, considerando dano balístico, dano espiritual, regeneração, resistência, recarga, precisão estimada, habilidades e distância entre os personagens.

### 3. Treinamento

Implementação do Q-learning para identificar as ações que oferecem maior retorno esperado.

O agente utiliza as recompensas recebidas durante os confrontos para atualizar os valores da Tabela Q.

### 4. Avaliação

Comparação entre o agente treinado e um agente que seleciona ações aleatoriamente.

São analisadas métricas como recompensa média, retorno descontado, quantidade de vitórias, taxa de conclusão, cobertura e empates entre ações.

### 5. Chatbot

Desenvolvimento de uma interface que consulta o conhecimento adquirido pelo agente e fornece recomendações ao usuário.

O chatbot não realiza novos treinamentos durante a conversa e não utiliza inteligência artificial generativa.

## Estrutura do repositório

```text
Aprendizado_Reforco/
├── apresentação/
├── chatbot/
│   ├── modelo/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── motor.js
├── database/
│   ├── alcance_armas.csv
│   ├── dataset_heroes.csv
│   ├── dataset_itens_compraveis.csv
│   ├── habilidades_simuladas.csv
│   ├── dados_coleta_reprodutivel.zip
│   └── link_api.txt
├── modelos/
├── script/
│   ├── coleta_tratamento.ipynb
│   ├── 01_ambiente.ipynb
│   ├── 02_treinamento.ipynb
│   ├── 03_avaliacao.ipynb
│   └── 04_chatbot.ipynb
└── README.md
```

## Tecnologias utilizadas

- Python
- Google Colab
- Jupyter Notebook
- Pandas
- NumPy
- Numba
- Requests
- Matplotlib
- HTML
- CSS
- JavaScript
- GitHub Pages

## Como executar o projeto

### Chatbot online

Acesse:

https://kenjimaeshiro.github.io/Aprendizado_Reforco/chatbot/

Selecione a modalidade de recomendação e informe as características do confronto.

### Chatbot offline

1. Baixe o repositório.
2. Extraia os arquivos.
3. Acesse a pasta `chatbot`.
4. Abra o arquivo `index.html` em um navegador compatível.

Mantenha todos os arquivos da pasta chatbot, incluindo a pasta modelo.

### Execução dos notebooks no Google Colab

Caso necessário, instale as dependências:

```python
%pip install pandas numpy numba requests matplotlib
```

Execute os notebooks na seguinte ordem:

1. `coleta_tratamento.ipynb`
2. `01_ambiente.ipynb`
3. `02_treinamento.ipynb`
4. `03_avaliacao.ipynb`
5. `04_chatbot.ipynb`

Disponibilize os quatro CSVs da pasta `database` na área Arquivos do Colab.

Para reproduzir a coleta histórica, utilize `dados_coleta_reprodutivel.zip` e mantenha:

```python
FONTE = "historica"
```

Os notebooks posteriores reutilizam as funções dos notebooks de ambiente e treinamento. Portanto, disponibilize esses arquivos na sessão do Colab quando necessário.

### Treinamento do modelo

Para executar o treinamento completo, configure:

```python
RETREINAR = True
EPISODIOS_POR_HEROI = 100000
```

Para utilizar um modelo Python previamente treinado:

```python
RETREINAR = False
```

Nesse caso, é necessário disponibilizar o manifesto e as cinco partes do modelo treinado em formato `.pkl.gz`.

O modelo exportado para o navegador encontra-se na pasta `chatbot/modelo`. Essa exportação permite utilizar o chatbot sem executar novamente o treinamento, mas não substitui os arquivos Python necessários aos notebooks de avaliação.

## Resultados do treinamento

| Indicador | Resultado |
|---|---:|
| Episódios de treinamento | 500.000 |
| Cenários disponíveis no chatbot | 441.600 |
| Pares estado-ação disponíveis na interface | 3.475.200 |
| Estados totais, incluindo sucessores | 2.758.848 |
| Pares estado-ação treinados | 21.176.772 |
| Cobertura do espaço definido | 100% |

A cobertura inclui as atualizações sistemáticas das transições conhecidas do ambiente. Portanto, os pares estado-ação treinados não representam partidas independentes.

A comparação detalhada entre o agente aleatório e o agente treinado pode ser reproduzida no notebook de avaliação.

## Funcionamento do chatbot

O chatbot possui duas funcionalidades principais:

**Recomendação de heróis:** compara os personagens disponíveis contra um adversário específico, considerando um único duelo.

**Recomendação de itens:** identifica as ações válidas e consulta os valores Q correspondentes ao estado informado pelo usuário.

O processo pode ser representado da seguinte maneira:

```text
Entrada do usuário
        ↓
Identificação do estado
        ↓
Verificação das ações válidas
        ↓
Consulta à Tabela Q
        ↓
Classificação das ações
        ↓
Recomendação
```

A ação com maior valor Q representa a decisão com maior retorno descontado esperado dentro do ambiente simulado.

## Limitações

- O ambiente considera apenas cinco heróis e treze itens.
- As habilidades dos personagens possuem representações simplificadas.
- A distância permanece fixa durante cada confronto.
- A precisão dos disparos é estimada utilizando dano esperado.
- As recomendações não foram validadas em partidas reais.
- A cobertura de 100% refere-se exclusivamente às possibilidades definidas no simulador.

## Referências

- SUTTON, R. S.; BARTO, A. G. Reinforcement Learning: An Introduction. 2. ed., 2018.
- WATKINS, C. J. C. H.; DAYAN, P. Q-learning. Machine Learning, v. 8, p. 279–292, 1992.
- [Deadlock API](https://api.deadlock-api.com/docs)

---

Projeto desenvolvido para fins acadêmicos, sem vínculo oficial com a Valve.

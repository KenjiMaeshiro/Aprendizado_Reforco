# Assistente Deadlock - versao estatica (modelo 6.0)

Este site utiliza a mesma tabela Q treinada da versao balanceada. Nao precisa de Python, CMD, bibliotecas ou servidor de aplicacao. Os cinco arquivos de modelo exportam todos os Q e visitas para as 441.600 consultas da interface (3.475.200 pares validos); os estados internos ja estao refletidos nos valores Q. O diagnostico de cada duelo foi calculado pelo simulador original durante a exportacao. Nenhuma consulta treina o modelo ou chama uma API.

## Uso local

Extraia tudo e abra `index.html` no Chrome ou Edge atualizado. Mantenha `app.js`, `motor.js`, `style.css` e a pasta `modelo` junto ao HTML. Aguarde o indicador Modelo local pronto. A versao HTML unica, disponivel no pacote offline, e mais pratica para pendrive. O navegador deve permitir abrir HTML local e executar JavaScript; politicas da instituicao podem impedir isso.

## GitHub Pages

1. Crie um repositorio publico (por exemplo, `deadlock-chatbot`), ou use o repositorio do trabalho.
2. Envie os arquivos extraidos, nao o ZIP. Para um repositorio exclusivo, envie todos para a raiz, mantendo `modelo/`. Em um repositorio do trabalho ja existente, copie-os para `docs/`, mantendo a mesma estrutura.
3. Confirme que `index.html` e a pasta `modelo/` estao no diretorio publicado. Inclua `.nojekyll` (arquivo oculto; se nao for enviado, crie um arquivo com esse nome pelo GitHub).
4. Em Settings > Pages > Build and deployment, escolha Deploy from a branch; branch `main` (ou a branch usada), pasta `/(root)` ou `/docs`, conforme a etapa anterior. Clique Save.
5. Aguarde a publicacao e abra o endereco indicado em Pages. Em um repositorio normal, o padrao e `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.

A publicacao requer permissoes no repositorio e internet. Em contas gratuitas, use repositorio publico. O endereco exato depende do repositorio. Nao e preciso publicar os pickles, datasets ou notebooks para que este site funcione. Eles continuam importantes para documentar/reproduzir a pesquisa em separado.

Documentacao oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Validacao e limites

Testes de comparacao com Python: 195 consultas completas (incluindo 15 comparacoes de herois); verificacao integral dos 441.600 estados e 3.475.200 valores Q/contagens de visitas, com hashes identicos para cada heroi. A interface do HTML unico foi testada em navegador com rede desativada. O ambiente de testes bloqueou a navegacao direta `file://` e para o endereco HTTP simulado por politica administrativa; portanto a abertura por duplo clique e o deploy real no GitHub Pages ainda precisam ser verificados no computador/repositorio do usuario. O codigo nao usa fetch, importacoes de modulos, bibliotecas externas ou caminhos absolutos.

O modelo e restrito aos 5 herois, 13 itens e 3 distancias da versao 6.0; os resultados sao do simulador, nao do jogo real. Nao ha retreinamento nem alteracao da funcao de recompensa.

# Plano de Implementação — Catálogo de Jogos Infantil

## Tasks

- [x] 1. Estrutura base do projeto
  - [x] 1.1 Criar estrutura de diretórios do projeto (`css/`, `js/`, `games/`, `assets/`)
  - [x] 1.2 Criar arquivo `games/catalog.js` com o array `GAMES` vazio e a estrutura de categorias `CATEGORIES`
  - [x] 1.3 Criar `css/style.css` com as variáveis CSS (custom properties) para paleta de cores (azul elétrico, roxo neon, verde limão, fundo escuro), tipografia e espaçamentos
  - [x] 1.4 Criar `index.html` com a estrutura base da SPA: `<nav>`, seções `#home`, `#catalogo` e `#privacidade`, e `<footer>`
  - [x] 1.5 Criar `README.md` na raiz com instruções de como adicionar novos jogos e como fazer deploy no GitHub Pages

- [x] 2. Sistema de navegação e roteamento
  - [x] 2.1 Criar `js/router.js` com funções `Router.navigate(sectionId)`, `Router.getCurrent()` e `Router.init()` para roteamento por hash
  - [x] 2.2 Implementar menu de navegação no `index.html` com os 4 links: Início, Catálogo, Categorias, Política de Privacidade
  - [x] 2.3 Criar `js/ui.js` com `UI.initNavMenu()` para controle do menu hambúrguer (toggle visibilidade em telas <768px) e `UI.setActiveLink(id)` para destacar o link ativo
  - [x] 2.4 Implementar animações CSS de entrada de elementos usando Intersection Observer em `UI.initAnimations()`

- [x] 3. Módulo de catálogo e cards de jogo
  - [x] 3.1 Implementar em `js/catalog.js` a função `Catalog.renderCard(game)` que recebe um objeto de jogo e retorna o HTML completo do card com título, imagem, categoria, descrição (máx 80 chars) e botão "Jogar"
  - [x] 3.2 Implementar `Catalog.getCategories(games)` que extrai categorias únicas do array de jogos
  - [x] 3.3 Implementar `Catalog.renderFilterButtons(categories)` que gera os botões de filtro (incluindo "Todos") a partir do array de categorias
  - [x] 3.4 Implementar `Catalog.filter(category)` que filtra os cards visíveis por categoria sem recarregar a página, exibindo mensagem de "nenhum jogo encontrado" quando aplicável
  - [x] 3.5 Implementar `Catalog.init(games)` que inicializa o catálogo completo: renderiza todos os cards, cria os botões de filtro e configura os event listeners
  - [x] 3.6 Adicionar tratamento para imagem ausente (`onerror` → placeholder) e para jogos com configuração inválida (ignorar com aviso no console)

- [x] 4. Página inicial (Home)
  - [x] 4.1 Implementar o banner de destaque na seção `#home` com nome do site, slogan e botão "Ver Jogos" (que navega para `#catalogo`)
  - [x] 4.2 Implementar a seção "Jogos em Destaque" que exibe até 4 cards usando `Catalog.renderCard()` com jogos marcados como `featured: true` (ou os mais recentes)
  - [x] 4.3 Implementar a seção "Categorias" na home que renderiza ícones clicáveis para cada categoria, redirecionando para `#catalogo` com o filtro correspondente ativo

- [x] 5. Estilos globais e sistema visual
  - [x] 5.1 Implementar em `css/style.css` os estilos do layout responsivo com grid/flexbox, usando media queries para os breakpoints: 320px, 480px, 768px, 1024px e 1280px
  - [x] 5.2 Implementar estilos do menu de navegação incluindo variante hambúrguer para mobile (largura <768px), com área de toque mínima de 44×44px em todos os elementos interativos
  - [x] 5.3 Implementar estilos dos cards de jogo com efeitos de hover (elevação e brilho suave) e garantir contraste mínimo de 4.5:1 entre texto e fundo
  - [x] 5.4 Integrar fontes do Google Fonts (Nunito e/ou Fredoka One) com tamanho mínimo de 16px no corpo do texto
  - [x] 5.5 Implementar estilos das seções da página de jogo individual (header com título/categoria/descrição, container do jogo, botão "Voltar ao Catálogo")

- [x] 6. Política de Privacidade
  - [x] 6.1 Implementar o conteúdo da seção `#privacidade` declarando: não coleta de dados, ausência de cookies/analytics, execução local dos jogos, finalidade de entretenimento e data da última atualização

- [x] 7. Jogo — Nave Espacial (Ação)
  - [x] 7.1 Criar diretório `games/nave-espacial/` com `index.html`, `game.js` e `style.css`
  - [x] 7.2 Implementar a lógica principal do jogo em `game.js`: loop de jogo via `requestAnimationFrame`, estado `{ ship, projectiles, asteroids, score, lives, level, gameOver }`, spawning de asteroides e detecção de colisão
  - [x] 7.3 Implementar controles de teclado (setas/WASD) e toque (botões na tela para mobile) para movimentação da nave e disparo
  - [x] 7.4 Implementar HUD (pontuação e vidas) com atualização em tempo real e lógica de progressão de dificuldade (velocidade e frequência de asteroides aumentam com o score)
  - [x] 7.5 Implementar tela de Game Over (quando `lives === 0`) com pontuação final e botão de reinício; adicionar ao `GAMES` em `catalog.js`

- [x] 8. Jogo — Jogo da Memória (Memória)
  - [x] 8.1 Criar diretório `games/memoria/` com `index.html`, `game.js` e `style.css`
  - [x] 8.2 Implementar geração do tabuleiro com pares de cartas usando emojis temáticos, com suporte a dois níveis de dificuldade (8 pares = fácil, 16 pares = difícil)
  - [x] 8.3 Implementar lógica de clique: virar carta, verificar par (`a.value === b.value && a.id !== b.id`), manter pares corretos virados e virar pares incorretos após 1 segundo
  - [x] 8.4 Implementar contagem de tentativas, tela de vitória (quando todos os pares forem encontrados) com número de tentativas e botão de reinício; adicionar ao `GAMES` em `catalog.js`

- [x] 9. Jogo — Quiz de Conhecimentos (Raciocínio)
  - [x] 9.1 Criar diretório `games/quiz/` com `index.html`, `game.js` e `style.css`
  - [x] 9.2 Criar banco de dados com ao menos 20 perguntas de múltipla escolha (4 alternativas cada) sobre ciência, natureza e espaço em `games/quiz/questions.js`
  - [x] 9.3 Implementar lógica de jogo: embaralhar perguntas a cada partida, selecionar 10 para a rodada, exibir feedback visual imediato (verde/vermelho) ao responder, revelar resposta correta quando errada
  - [x] 9.4 Implementar temporizador de 15 segundos por pergunta que avança automaticamente ao zerar (contando a resposta como incorreta); implementar tela de resultado final com pontuação e mensagem motivacional; adicionar ao `GAMES` em `catalog.js`

- [x] 10. Jogo — Quebra-Cabeça Deslizante (Quebra-Cabeça)
  - [x] 10.1 Criar diretório `games/puzzle-deslizante/` com `index.html`, `game.js` e `style.css`
  - [x] 10.2 Implementar função de embaralhamento que garante configuração com solução possível (verificação de paridade das inversões; se insolúvel, trocar dois elementos para corrigir a paridade)
  - [x] 10.3 Implementar lógica de movimento: ao clicar/tocar em peça adjacente ao espaço vazio (`0`), trocar as posições da peça e do espaço no array, atualizar o DOM e incrementar o contador de movimentos
  - [x] 10.4 Implementar verificação de vitória (board == [1,2,3,4,5,6,7,8,0]) com animação de vitória, exibição do número de movimentos e botão de reinício; adicionar ao `GAMES` em `catalog.js`

- [x] 11. Página de jogo (template compartilhado)
  - [x] 11.1 Criar template HTML base para páginas de jogo com: carregamento de `../../css/style.css`, header com título/categoria/descrição, container do jogo, botão "Voltar ao Catálogo" (`../../index.html#catalogo`), e indicador de loading
  - [x] 11.2 Implementar em cada `index.html` de jogo o indicador de loading (spinner visível até o jogo estar pronto para interação)

- [x] 12. Integração final e polimento
  - [x] 12.1 Preencher `games/catalog.js` com os metadados dos 4 jogos implementados (id, title, description, category, cover, path, featured)
  - [x] 12.2 Criar imagens de capa (`cover.png`) para cada jogo em seus respectivos diretórios; criar `assets/cover-placeholder.png` para fallback
  - [x] 12.3 Criar `assets/` com ícones e ilustrações vetoriais temáticas (espaço, games, aventura) usados como decoração nas páginas principais
  - [x] 12.4 Verificar caminhos relativos em todos os links, scripts e imagens para compatibilidade com GitHub Pages (subdiretório de repositório)
  - [x] 12.5 Testar a plataforma nos 4 navegadores alvo (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) e corrigir inconsistências
  - [x] 12.6 Executar auditoria de acessibilidade (Lighthouse ou axe): verificar contraste ≥4.5:1, áreas de toque ≥44×44px, fontes ≥16px

- [ ] 13. Testes
  - [ ] 13.1 Configurar ambiente de testes com `fast-check` e um test runner (ex.: Vitest ou Jest) como devDependency
  - [ ] 13.2 Escrever testes de propriedade para as Propriedades 1–6 (módulo `catalog.js`): completude dos dados, renderização do card, exclusividade da filtragem, filtro "Todos", correspondência de botões, estado vazio
  - [ ] 13.3 Escrever testes de propriedade para as Propriedades 7–8 (home e roteamento): limite de 4 destaques, clique em categoria filtra o catálogo
  - [ ] 13.4 Escrever testes de propriedade para as Propriedades 9–11 (Nave Espacial): colisão reduz vidas em 1, UI reflete estado, dificuldade monotonicamente crescente
  - [ ] 13.5 Escrever testes de propriedade para as Propriedades 12–14 (Jogo da Memória): verificação de par, atualização de estado após acerto, tabuleiro tem número correto de pares
  - [ ] 13.6 Escrever testes de propriedade para as Propriedades 15–16 (Quiz): feedback visual correto, timeout avança como incorreto
  - [ ] 13.7 Escrever testes de propriedade para as Propriedades 17–19 (Puzzle): invariante do tabuleiro, movimento troca peça e espaço, embaralhamento sempre solucionável
  - [ ] 13.8 Escrever testes de propriedade para a Propriedade 20 (extensibilidade): adição ao catálogo reflete automaticamente nos cards exibidos
  - [ ] 13.9 Escrever testes unitários por exemplo para os comportamentos específicos: menu hambúrguer, Game Over da nave, cartas virando após 1s, tela de vitória do puzzle, temporizador do quiz

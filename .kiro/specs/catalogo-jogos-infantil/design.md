# Documento de Design — Catálogo de Jogos Infantil

## Visão Geral

O **Catálogo de Jogos Infantil** é uma plataforma web estática voltada para meninos de 8 a 10 anos, hospedada no GitHub Pages. A plataforma reúne jogos interativos escritos em JavaScript puro, organizados por categorias temáticas, com visual moderno no estilo dark mode com cores vibrantes.

A arquitetura é completamente estática — sem backend, sem banco de dados, sem build tools obrigatórias. Todo o estado da aplicação é gerenciado no cliente via JavaScript vanilla, e os dados dos jogos são mantidos em um arquivo de configuração central.

### Objetivos de Design

- **Simplicidade de deploy**: funciona diretamente no GitHub Pages sem nenhum passo de build.
- **Extensibilidade**: adicionar um novo jogo requer apenas criar um diretório e atualizar um arquivo de configuração.
- **Performance**: site estático com assets otimizados; sem frameworks pesados.
- **Responsividade**: layout fluido para telas de 320px a 1920px.
- **Acessibilidade**: contraste mínimo 4.5:1, toque mínimo 44×44px, fontes ≥16px.

---

## Arquitetura

A plataforma segue uma arquitetura de **Single-Page Application estática** com roteamento por hash (`#section`) para navegação sem reload, complementada por páginas HTML independentes para cada jogo.

```
┌─────────────────────────────────────────────────────┐
│                  GitHub Pages CDN                   │
│                                                     │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │  index.html  │────▶│  catalog.js (dados)      │  │
│  │  (SPA Shell) │     │  Array de metadados      │  │
│  └──────┬───────┘     └──────────────────────────┘  │
│         │                                           │
│         ▼                                           │
│  ┌──────────────────────────────────────────────┐   │
│  │         JavaScript (Vanilla ES6+)            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────┐  │   │
│  │  │  Router  │  │ Catalog  │  │  UI/DOM   │  │   │
│  │  │ (hash)   │  │ Filter   │  │ Renderer  │  │   │
│  │  └──────────┘  └──────────┘  └───────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │  games/      │  │  css/        │                 │
│  │  nave/       │  │  style.css   │                 │
│  │  memoria/    │  │  (global)    │                 │
│  │  quiz/       │  └──────────────┘                 │
│  │  puzzle/     │                                   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

### Fluxo de Navegação

```
index.html
  ├── #home      → Seção Home (banner + destaque + categorias)
  ├── #catalogo  → Seção Catálogo (grid filtrado)
  └── #privacidade → Seção Política de Privacidade

games/nave-espacial/index.html    → Jogo em iframe ou direto
games/memoria/index.html          → Jogo em iframe ou direto
games/quiz/index.html             → Jogo em iframe ou direto
games/puzzle-deslizante/index.html → Jogo em iframe ou direto
```

---

## Componentes e Interfaces

### 1. Shell Principal (`index.html`)

Único arquivo HTML da SPA. Contém:
- `<nav>` com menu de navegação e botão hambúrguer
- `<section id="home">` — página inicial
- `<section id="catalogo">` — catálogo com filtros
- `<section id="privacidade">` — política de privacidade
- `<footer>` — links e copyright

### 2. Módulo de Roteamento (`js/router.js`)

Gerencia navegação por hash:

```js
// Interface pública
Router.navigate(sectionId)   // navega para seção por hash
Router.getCurrent()          // retorna seção ativa
Router.init()                // inicializa listeners de hash
```

### 3. Módulo de Catálogo (`js/catalog.js`)

Responsável por renderizar e filtrar os cards de jogo:

```js
// Interface pública
Catalog.init(games)                   // inicializa com array de jogos
Catalog.filter(category)             // filtra por categoria ('all' para todos)
Catalog.renderCard(game)             // retorna HTML string de um card
Catalog.getCategories(games)         // extrai categorias únicas do array
Catalog.renderFilterButtons(cats)    // renderiza botões de filtro
```

### 4. Arquivo de Configuração Central (`games/catalog.js`)

Array exportado com todos os metadados dos jogos:

```js
// Estrutura de cada objeto de jogo
const GAMES = [
  {
    id: "nave-espacial",
    title: "Nave Espacial",
    description: "Destrua asteroides e salve a galáxia!",  // máx 80 chars
    category: "Acao",
    cover: "games/nave-espacial/cover.png",
    path: "games/nave-espacial/index.html"
  },
  // ...
];
```

### 5. Módulo de UI (`js/ui.js`)

Controla comportamentos gerais de interface:

```js
UI.initNavMenu()         // inicializa hambúrguer e active states
UI.setActiveLink(id)     // marca link ativo no menu
UI.showLoading(el)       // exibe indicador de loading em elemento
UI.hideLoading(el)       // remove indicador de loading
UI.initAnimations()      // configura Intersection Observer para animações de entrada
```

### 6. Páginas de Jogo (`games/{nome}/index.html`)

Cada jogo é uma página HTML autossuficiente:
- Carregam `../../css/style.css` (estilos globais)
- Carregam `style.css` (estilos do jogo)
- Carregam `game.js` (lógica do jogo)
- Botão "Voltar ao Catálogo" com link relativo `../../index.html#catalogo`

### 7. Módulo Base de Jogo (padrão sugerido em `games/game-base.js`)

Interface padrão que cada jogo deve implementar:

```js
GameBase = {
  init()    // inicializa o jogo, configura canvas/DOM
  start()   // inicia a partida
  pause()   // pausa o jogo
  reset()   // reinicia para estado inicial
  destroy() // limpa event listeners e timers
}
```

---

## Modelos de Dados

### Objeto de Jogo (Game)

```js
{
  id: String,           // identificador kebab-case único (ex: "nave-espacial")
  title: String,        // título exibido nos cards e na página
  description: String,  // máximo 80 caracteres
  category: String,     // uma de: "Acao", "Memoria", "Raciocinio", "Quebra-Cabeca"
  cover: String,        // caminho relativo à raiz para a imagem de capa
  path: String,         // caminho relativo à raiz para o index.html do jogo
  featured: Boolean     // (opcional) true = aparece em "Jogos em Destaque"
}
```

### Categorias Disponíveis

```js
const CATEGORIES = {
  ACAO:          { id: "Acao",         label: "Ação",         icon: "🚀" },
  MEMORIA:       { id: "Memoria",      label: "Memória",      icon: "🧠" },
  RACIOCINIO:    { id: "Raciocinio",   label: "Raciocínio",   icon: "💡" },
  QUEBRA_CABECA: { id: "Quebra-Cabeca",label: "Quebra-Cabeça",icon: "🧩" }
};
```

### Estado do Filtro do Catálogo

```js
{
  activeCategory: String | "all",   // categoria ativa ou "all"
  visibleGames: Game[]              // array filtrado a exibir
}
```

### Estado do Quiz

```js
{
  questions: Question[],  // array de 20+ perguntas embaralhadas
  current: Number,        // índice da pergunta atual (0-9)
  score: Number,          // número de acertos
  timeLeft: Number,       // segundos restantes (0-15)
  answered: Boolean       // se a pergunta atual já foi respondida
}

Question = {
  text: String,
  options: String[4],   // 4 alternativas
  correct: Number       // índice da alternativa correta (0-3)
}
```

### Estado do Jogo da Memória

```js
{
  board: Card[],          // array de 16 ou 32 cartas (8 ou 16 pares)
  flipped: Number[],      // índices das cartas viradas (0, 1 ou 2 elementos)
  matched: Set<Number>,   // índices dos pares já combinados
  attempts: Number,       // número total de tentativas
  difficulty: "easy" | "hard"
}

Card = {
  id: Number,    // índice no board
  value: String, // emoji ou ícone (dois cards têm o mesmo value em cada par)
  isFlipped: Boolean,
  isMatched: Boolean
}
```

### Estado do Puzzle Deslizante

```js
{
  board: Number[9],   // array de 9 posições; 0 representa o espaço vazio
  emptyIndex: Number, // posição atual do espaço vazio (0-8)
  moves: Number,      // contador de movimentos
  solved: Boolean     // true quando board == [1,2,3,4,5,6,7,8,0]
}
```

### Estado da Nave Espacial

```js
{
  ship: { x, y, speed },
  projectiles: [{ x, y, speed }],
  asteroids: [{ x, y, speed, size }],
  score: Number,
  lives: Number,      // começa em 3
  level: Number,      // aumenta com pontuação
  gameOver: Boolean
}
```

---

## Propriedades de Corretude

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas do sistema — essencialmente, uma declaração formal sobre o que o software deve fazer. Propriedades servem de ponte entre especificações legíveis por humanos e garantias de corretude verificáveis por máquina.*

### Propriedade 1: Completude dos dados do catálogo

*Para qualquer* objeto no array de configuração central (`GAMES`), ele deve conter todos os campos obrigatórios: `id`, `title`, `description`, `category`, `cover` e `path`, todos com valores do tipo correto e não-vazios.

**Valida: Requisito 11.2**

---

### Propriedade 2: Renderização completa do card de jogo

*Para qualquer* objeto de jogo válido no catálogo, o HTML do card renderizado deve conter o título do jogo, a categoria, uma string de descrição e um botão "Jogar" com link para o `path` correto.

**Valida: Requisitos 3.7, 3.8**

---

### Propriedade 3: Filtragem por categoria é exclusiva

*Para qualquer* categoria `C` selecionada no filtro e *para qualquer* lista de jogos no catálogo, todos os cards exibidos devem pertencer exclusivamente à categoria `C`. Nenhum card de outra categoria deve estar visível.

**Valida: Requisito 3.3**

---

### Propriedade 4: Filtro "Todos" exibe todos os jogos

*Para qualquer* lista de jogos no catálogo, quando o filtro ativo é "Todos", o número de cards visíveis deve ser exatamente igual ao número total de jogos no array de configuração.

**Valida: Requisitos 3.1, 3.4**

---

### Propriedade 5: Correspondência de botões de filtro com categorias

*Para qualquer* conjunto de categorias presente nos dados dos jogos, os botões de filtro renderizados devem conter exatamente um botão para cada categoria distinta, mais o botão "Todos" — sem duplicatas e sem categorias faltando.

**Valida: Requisito 3.2**

---

### Propriedade 6: Estado vazio para categoria sem jogos

*Para qualquer* categoria `C` para a qual nenhum jogo no array de configuração tenha `category === C`, após aplicar o filtro de `C`, o catálogo deve exibir zero cards e a mensagem de "nenhum jogo encontrado" deve estar visível.

**Valida: Requisito 3.6**

---

### Propriedade 7: Destaque limita-se a 4 jogos

*Para qualquer* array de jogos no catálogo (independente do tamanho), a seção "Jogos em Destaque" deve exibir no máximo 4 cards — nunca mais que 4, mesmo com 10 ou 100 jogos no catálogo.

**Valida: Requisito 2.3**

---

### Propriedade 8: Clique em categoria da home filtra o catálogo

*Para qualquer* categoria `C` exibida na seção de categorias da página inicial, ao clicar no ícone de `C`, o catálogo deve ser exibido com o filtro `C` ativo — equivalente a selecionar `C` diretamente no catálogo.

**Valida: Requisito 2.5**

---

### Propriedade 9: Colisão reduz vidas em 1 (Nave Espacial)

*Para qualquer* estado de jogo da Nave Espacial com `lives > 0`, quando ocorre uma colisão entre um obstáculo e a nave, o estado resultante deve ter exatamente `lives - 1` vidas — nunca zero decremento, nunca mais de um.

**Valida: Requisito 5.3**

---

### Propriedade 10: UI reflete estado interno do jogo (Nave Espacial)

*Para qualquer* estado interno do jogo da Nave Espacial `{ score: S, lives: L }`, os valores exibidos na interface (HUD) devem ser numericamente iguais a `S` e `L` respectivamente.

**Valida: Requisito 5.5**

---

### Propriedade 11: Dificuldade aumenta com pontuação (Nave Espacial)

*Para quaisquer* dois estados do jogo `s1` e `s2` onde `s1.score < s2.score`, os parâmetros de dificuldade em `s2` (velocidade dos asteroides, frequência de spawn) devem ser maiores ou iguais aos de `s1`. A dificuldade nunca retrocede.

**Valida: Requisito 5.6**

---

### Propriedade 12: Verificação de par no Jogo da Memória

*Para quaisquer* duas cartas `a` e `b` selecionadas no tabuleiro do Jogo da Memória, a função de verificação de par deve retornar `true` se e somente se `a.value === b.value` e `a.id !== b.id`.

**Valida: Requisito 6.3**

---

### Propriedade 13: Acerto de par atualiza estado corretamente (Memória)

*Para qualquer* par de cartas `(a, b)` com `a.value === b.value`, após o match: ambas devem ter `isMatched === true`, ambas devem estar visíveis no tabuleiro e a pontuação (pares encontrados) deve ser incrementada em 1.

**Valida: Requisito 6.4**

---

### Propriedade 14: Tabuleiro da Memória tem número correto de pares

*Para qualquer* nível de dificuldade `D` configurado, o tabuleiro gerado deve conter exatamente `2 * pairs(D)` cartas, onde `pairs("easy") === 8` e `pairs("hard") === 16`. Cada valor de carta deve aparecer exatamente 2 vezes.

**Valida: Requisito 6.7**

---

### Propriedade 15: Feedback visual do Quiz é correto

*Para qualquer* pergunta `Q` com resposta correta `C` e *para qualquer* alternativa `A` selecionada pelo usuário, se `A === C` a indicação visual deve ser "correto" (verde); se `A !== C` a indicação visual deve ser "incorreto" (vermelho) e a alternativa `C` deve ser destacada.

**Valida: Requisito 7.3**

---

### Propriedade 16: Timeout avança pergunta como incorreta (Quiz)

*Para qualquer* pergunta em que o temporizador chegue a 0 sem resposta do usuário, a pergunta deve ser contada como incorreta (sem acréscimo ao score) e a próxima pergunta deve ser exibida.

**Valida: Requisito 7.7**

---

### Propriedade 17: Invariante do tabuleiro do Puzzle

*Para qualquer* estado do tabuleiro do Puzzle Deslizante (inicial ou após qualquer sequência de movimentos válidos), o tabuleiro deve sempre conter exatamente os valores `{0, 1, 2, 3, 4, 5, 6, 7, 8}` — sem duplicatas, sem valores faltando. O `0` representa o espaço vazio.

**Valida: Requisito 8.2**

---

### Propriedade 18: Movimento do Puzzle troca peça e espaço

*Para qualquer* estado do tabuleiro com espaço na posição `E` e peça válida na posição `P` adjacente a `E`, após executar o movimento de `P`: a posição `E` deve conter o valor que estava em `P`, e a posição `P` deve conter `0`. Todos os outros valores permanecem inalterados.

**Valida: Requisito 8.3**

---

### Propriedade 19: Embaralhamento gera configuração solucionável (Puzzle)

*Para qualquer* configuração gerada pela função de embaralhamento do Puzzle, a configuração deve ser solucionável — verificável pela paridade das inversões: o número de inversões no array deve ser par.

**Valida: Requisito 8.7**

---

### Propriedade 20: Adição ao catálogo reflete automaticamente no catálogo

*Para qualquer* objeto de jogo válido adicionado ao array `GAMES` no arquivo de configuração central, ao renderizar o catálogo com o filtro "Todos", deve aparecer um card adicional correspondente ao novo jogo — sem modificação de nenhum outro arquivo HTML.

**Valida: Requisito 11.3**

---

## Tratamento de Erros

### Imagem de Capa Ausente

Se o arquivo de imagem de capa de um jogo não existir, o card deve exibir uma imagem placeholder com o ícone da categoria. Implementado via `onerror` no elemento `<img>`:

```html
<img src="..." onerror="this.src='assets/cover-placeholder.png'" alt="...">
```

### Jogo Não Encontrado

Se o usuário navegar para uma página de jogo cujo arquivo `index.html` não existe (erro 404 do GitHub Pages), o GitHub Pages retorna a página 404 padrão. Para mitigar, todos os links são gerados dinamicamente a partir do `catalog.js`, garantindo que apenas jogos existentes tenham links.

### Configuração de Jogo Inválida

Se um objeto no array `GAMES` estiver com campos ausentes ou inválidos, o módulo de catálogo deve ignorar silenciosamente aquele jogo (não renderizar o card) e registrar um aviso no console. Isso evita que um jogo mal configurado quebre a página inteira.

```js
function isValidGame(game) {
  return game && game.id && game.title && game.description &&
         game.category && game.cover && game.path &&
         game.description.length <= 80;
}
```

### Puzzle Deslizante — Embaralhamento Insolúvel

A função de embaralhamento deve verificar a solucionabilidade após gerar o estado aleatório. Se insolúvel, deve trocar dois elementos adjacentes (exceto o espaço vazio) para inverter a paridade e tornar o estado solucionável. Isso é feito em O(1) e garante 100% dos embaralhamentos serem solucionáveis.

### Quiz — Banco de Perguntas Insuficiente

Se o banco de perguntas tiver menos de 10 itens (abaixo do mínimo para uma rodada), o quiz deve exibir uma mensagem de erro ao invés de tentar iniciar o jogo. Em condições normais, o banco terá ≥ 20 perguntas.

### Dispositivos sem Suporte a Toque (Touch)

Os jogos com controle por toque devem verificar `'ontouchstart' in window` antes de registrar event listeners de touch. Em dispositivos sem toque, apenas controles de teclado/mouse são registrados. Não há mensagens de erro — o comportamento de degradação é transparente.

---

## Estratégia de Testes

### Abordagem Dual

A estratégia combina **testes unitários por exemplo** para comportamentos específicos e **testes baseados em propriedades** (PBT) para invariantes universais da lógica dos jogos e do catálogo.

**Biblioteca de PBT recomendada**: [fast-check](https://github.com/dubzzz/fast-check) (JavaScript, madura, sem dependências obrigatórias de runtime).

### Testes Unitários por Exemplo

Cobrem casos específicos e condições de contorno:

- Menu de navegação: presença dos 4 links, estado ativo, comportamento hambúrguer
- Botão "Ver Jogos": navegação para a seção correta
- Indicador de loading: aparece ao carregar, some quando pronto
- Botão "Voltar ao Catálogo": existência e link correto
- Tela de Game Over (Nave): exibição quando vidas = 0
- Cartas que não formam par voltam após 1s (Memória)
- Tela de vitória do Puzzle: exibida ao completar
- Temporizador do Quiz: começa em 15 e decrementa

### Testes Baseados em Propriedades

Cada propriedade de corretude descrita acima deve ser implementada como um teste de propriedade com mínimo de **100 iterações**. As propriedades PBT identificadas são:

| # | Propriedade | Módulo |
|---|-------------|--------|
| 1 | Completude dos dados do catálogo | `catalog.js` |
| 2 | Renderização completa do card | `catalog.js` |
| 3 | Filtragem por categoria é exclusiva | `catalog.js` |
| 4 | Filtro "Todos" exibe todos os jogos | `catalog.js` |
| 5 | Correspondência de botões de filtro | `catalog.js` |
| 6 | Estado vazio para categoria sem jogos | `catalog.js` |
| 7 | Destaque limita-se a 4 jogos | `ui.js` |
| 8 | Clique em categoria filtra o catálogo | `router.js` + `catalog.js` |
| 9 | Colisão reduz vidas em 1 | `game.js` (nave) |
| 10 | UI reflete estado interno | `game.js` (nave) |
| 11 | Dificuldade aumenta com pontuação | `game.js` (nave) |
| 12 | Verificação de par (Memória) | `game.js` (memória) |
| 13 | Acerto de par atualiza estado | `game.js` (memória) |
| 14 | Tabuleiro tem pares corretos | `game.js` (memória) |
| 15 | Feedback visual do Quiz | `game.js` (quiz) |
| 16 | Timeout avança como incorreto | `game.js` (quiz) |
| 17 | Invariante do tabuleiro do Puzzle | `game.js` (puzzle) |
| 18 | Movimento troca peça e espaço | `game.js` (puzzle) |
| 19 | Embaralhamento solucionável | `game.js` (puzzle) |
| 20 | Adição ao catálogo reflete automaticamente | `catalog.js` |

**Tag de cada teste PBT:**
```
Feature: catalogo-jogos-infantil, Property N: <texto da propriedade>
```

**Configuração mínima:**
```js
fc.assert(fc.property(...), { numRuns: 100 });
```

### Testes de Integração / Smoke

- Verificar que todos os `path` listados no `catalog.js` existem como arquivos reais
- Verificar que todas as imagens de capa referenciadas existem
- Smoke test de deploy: `index.html` na raiz carrega sem erros de console

### Testes Manuais / Visuais

- Verificar responsividade em 320px, 480px, 768px, 1024px e 1280px
- Verificar contraste de cores (ferramenta: axe DevTools ou Lighthouse)
- Verificar comportamento de animações em dispositivos de baixo desempenho
- Testar em Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

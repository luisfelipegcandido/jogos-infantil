/**
 * catalog.js — Configuração central de jogos do Catálogo de Jogos Infantil
 *
 * Como adicionar um novo jogo:
 * 1. Crie um diretório em games/{nome-do-jogo}/ com o arquivo index.html do jogo.
 * 2. Adicione uma imagem de capa em games/{nome-do-jogo}/cover.svg (recomendado: 400×225px).
 * 3. Inclua um novo objeto no array GAMES abaixo, preenchendo os campos:
 *
 *    {
 *      id:          String — identificador único em kebab-case (ex: "nave-espacial")
 *      title:       String — título exibido nos cards e na página do jogo
 *      description: String — descrição curta, máximo 80 caracteres
 *      category:    String — uma de: "Acao", "Memoria", "Raciocinio", "Quebra-Cabeca"
 *                            (use os ids definidos em CATEGORIES abaixo)
 *      cover:       String — caminho relativo à raiz para a imagem de capa
 *                            (ex: "games/nave-espacial/cover.svg")
 *      path:        String — caminho relativo à raiz para o index.html do jogo
 *                            (ex: "games/nave-espacial/index.html")
 *      featured:    Boolean — (opcional) true para aparecer em "Jogos em Destaque"
 *                             Máximo 4 jogos com featured: true são exibidos
 *    }
 *
 * Nenhum outro arquivo HTML precisa ser modificado — o catálogo é gerado automaticamente.
 */

// Categorias disponíveis no catálogo
const CATEGORIES = {
  ACAO:          { id: "Acao",          label: "Ação",          icon: "🚀" },
  MEMORIA:       { id: "Memoria",       label: "Memória",       icon: "🧠" },
  RACIOCINIO:    { id: "Raciocinio",    label: "Raciocínio",    icon: "💡" },
  QUEBRA_CABECA: { id: "Quebra-Cabeca", label: "Quebra-Cabeça", icon: "🧩" }
};

// Array de jogos — atualizado conforme os jogos são criados
const GAMES = [
  {
    id:          "nave-espacial",
    title:       "Nave Espacial",
    description: "Destrua asteroides e salve a galáxia!",
    category:    "Acao",
    cover:       "games/nave-espacial/cover.png",
    path:        "games/nave-espacial/index.html",
    featured:    true
  },
  {
    id:          "memoria",
    title:       "Jogo da Memória",
    description: "Encontre todos os pares e treine sua memória!",
    category:    "Memoria",
    cover:       "games/memoria/cover.png",
    path:        "games/memoria/index.html",
    featured:    true
  },
  {
    id:          "quiz",
    title:       "Quiz de Conhecimentos",
    description: "Responda perguntas sobre ciência, natureza e espaço!",
    category:    "Raciocinio",
    cover:       "games/quiz/cover.png",
    path:        "games/quiz/index.html",
    featured:    true
  },
  {
    id:          "puzzle-deslizante",
    title:       "Quebra-Cabeça Deslizante",
    description: "Deslize as peças e monte o quebra-cabeça numérico!",
    category:    "Quebra-Cabeca",
    cover:       "games/puzzle-deslizante/cover.png",
    path:        "games/puzzle-deslizante/index.html",
    featured:    true
  },
  {
    id:          "puzzle-animais",
    title:       "Quebra-Cabeça dos Animais",
    description: "Monte a imagem do animal corretamente!",
    category:    "Quebra-Cabeca",
    cover:       "games/puzzle-animais/cover.png",
    path:        "games/puzzle-animais/index.html",
    featured:    true
  },
  {
    id:          "forca-divertida",
    title:       "Forca Divertida",
    description: "Descubra a palavra antes das tentativas acabarem.",
    category:    "Raciocinio",
    cover:       "games/forca-divertida/cover.png",
    path:        "games/forca-divertida/index.html",
    featured:    true
  },
  {
    id:          "desafio-matematico",
    title:       "Desafio Matemático",
    description: "Resolva contas e conquiste pontos.",
    category:    "Raciocinio",
    cover:       "games/desafio-matematico/cover.png",
    path:        "games/desafio-matematico/index.html",
    featured:    true
  }
];

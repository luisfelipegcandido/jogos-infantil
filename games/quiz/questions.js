/**
 * questions.js — Banco de perguntas do Quiz de Conhecimentos
 *
 * 20+ perguntas de múltipla escolha (4 alternativas cada) sobre
 * ciência, natureza e espaço — temática para crianças de 8–10 anos.
 *
 * Estrutura de cada pergunta:
 *   {
 *     text:    String  — enunciado da pergunta
 *     options: String[4] — 4 alternativas (índice 0 a 3)
 *     correct: Number  — índice da alternativa correta (0–3)
 *   }
 *
 * Exposto como variável global QUESTIONS (compatível com browser e Node/Jest).
 */

const QUESTIONS = [
  // ---- Espaço ----------------------------------------------------------------
  {
    text:    "Qual é o planeta mais próximo do Sol?",
    options: ["Vênus", "Terra", "Mercúrio", "Marte"],
    correct: 2
  },
  {
    text:    "Quantas luas tem o planeta Terra?",
    options: ["Nenhuma", "Uma", "Duas", "Três"],
    correct: 1
  },
  {
    text:    "Como se chama a galáxia onde fica o nosso Sistema Solar?",
    options: ["Andrômeda", "Sombrero", "Via Láctea", "Nuvem de Magalhães"],
    correct: 2
  },
  {
    text:    "Qual é o maior planeta do Sistema Solar?",
    options: ["Saturno", "Netuno", "Urano", "Júpiter"],
    correct: 3
  },
  {
    text:    "O que é uma estrela cadente?",
    options: [
      "Uma estrela que explodiu",
      "Um meteoro que queima ao entrar na atmosfera",
      "Uma lua pequena",
      "Um cometa que passou pela Terra"
    ],
    correct: 1
  },
  {
    text:    "Qual planeta é conhecido por seus anéis lindos?",
    options: ["Júpiter", "Urano", "Saturno", "Marte"],
    correct: 2
  },
  {
    text:    "Como se chama a camada de ar que envolve a Terra?",
    options: ["Hidrosfera", "Litosfera", "Atmosfera", "Biosfera"],
    correct: 2
  },
  {
    text:    "Qual é a estrela mais próxima da Terra?",
    options: ["Sirius", "Alpha Centauri", "Betelgeuse", "O Sol"],
    correct: 3
  },

  // ---- Natureza --------------------------------------------------------------
  {
    text:    "Qual animal é o maior do mundo?",
    options: ["Elefante africano", "Tubarão-baleia", "Baleia-azul", "Girafa"],
    correct: 2
  },
  {
    text:    "O que as plantas precisam para fazer fotossíntese?",
    options: [
      "Luz solar, água e gás carbônico",
      "Luz solar, sal e oxigênio",
      "Água, sal e nitrogênio",
      "Luz solar, fogo e ar"
    ],
    correct: 0
  },
  {
    text:    "Quantas patas tem uma aranha?",
    options: ["4", "6", "8", "10"],
    correct: 2
  },
  {
    text:    "Qual é o animal terrestre mais rápido do mundo?",
    options: ["Leão", "Guepardo", "Leopardo", "Cavalo"],
    correct: 1
  },
  {
    text:    "De onde vêm os raios e trovões?",
    options: [
      "Do choque de nuvens de pedra",
      "Da descarga elétrica entre nuvens ou nuvem e solo",
      "Do aquecimento rápido da chuva",
      "De vulcões na atmosfera"
    ],
    correct: 1
  },
  {
    text:    "Qual é o maior oceano do mundo?",
    options: ["Atlântico", "Índico", "Ártico", "Pacífico"],
    correct: 3
  },
  {
    text:    "Como se chamam os animais que podem viver tanto na água quanto na terra?",
    options: ["Répteis", "Anfíbios", "Mamíferos", "Invertebrados"],
    correct: 1
  },

  // ---- Ciência ---------------------------------------------------------------
  {
    text:    "Qual é o osso mais longo do corpo humano?",
    options: ["Úmero (braço)", "Fêmur (coxa)", "Tíbia (perna)", "Vértebra (costas)"],
    correct: 1
  },
  {
    text:    "Em que estado físico a água vira vapor?",
    options: ["Sólido", "Líquido", "Gasoso", "Plasma"],
    correct: 2
  },
  {
    text:    "Quantos dentes tem um adulto humano (sem os sisos)?",
    options: ["28", "30", "32", "36"],
    correct: 0
  },
  {
    text:    "O que é a gravidade?",
    options: [
      "A força que atrai os objetos uns para os outros",
      "A força que faz o vento soprar",
      "A energia gerada pelo Sol",
      "A pressão da atmosfera sobre nós"
    ],
    correct: 0
  },
  {
    text:    "Qual cor tem o maior comprimento de onda na luz visível?",
    options: ["Violeta", "Azul", "Verde", "Vermelho"],
    correct: 3
  },
  {
    text:    "Qual é o elemento químico mais abundante no universo?",
    options: ["Oxigênio", "Carbono", "Hidrogênio", "Hélio"],
    correct: 2
  },
  {
    text:    "O que estuda a Paleontologia?",
    options: [
      "Os planetas e estrelas",
      "Os fósseis e seres vivos do passado",
      "As rochas e minerais",
      "Os oceanos e rios"
    ],
    correct: 1
  }
];

/* Export for test runners (Node/CommonJS) */
if (typeof module !== 'undefined') {
  module.exports = { QUESTIONS };
}

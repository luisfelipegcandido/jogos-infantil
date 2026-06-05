# Documento de Requisitos

## Introdução

O **Catálogo de Jogos Infantil** é uma plataforma web estática voltada para meninos de 8 a 10 anos, hospedada no GitHub Pages. O site reúne jogos simples desenvolvidos em JavaScript, organizados por categorias, com visual moderno e atraente para a faixa etária. A plataforma é totalmente responsiva, intuitiva, e estruturada para facilitar a adição de novos jogos no futuro. Nenhum dado pessoal do usuário é coletado.

---

## Glossário

- **Plataforma**: O site web do Catálogo de Jogos Infantil como um todo.
- **Catálogo**: A seção que lista todos os jogos disponíveis, podendo ser filtrada por categoria.
- **Jogo**: Aplicação interativa em JavaScript executada diretamente no navegador, sem necessidade de instalação ou login.
- **Categoria**: Agrupamento temático de jogos (ex.: Ação, Memória, Quebra-Cabeça, Raciocínio).
- **Card de Jogo**: Componente visual que representa um jogo no catálogo, contendo título, imagem de capa, breve descrição e link para jogar.
- **Menu de Navegação**: Barra ou painel de links que permite ao usuário acessar as diferentes seções da Plataforma.
- **Página de Jogo**: Página dedicada a um único Jogo, onde ele é executado em tela cheia ou em área ampla.
- **Política de Privacidade**: Página estática com declaração sobre não coleta de dados e finalidade de entretenimento.
- **GitHub Pages**: Serviço de hospedagem estática gratuito do GitHub usado para publicar a Plataforma.
- **Layout Responsivo**: Design que se adapta automaticamente a diferentes tamanhos de tela (desktop, tablet, mobile).

---

## Requisitos

---

### Requisito 1: Estrutura de Navegação Principal

**User Story:** Como um menino de 8 a 10 anos, eu quero ter um menu claro e simples, para que eu consiga encontrar rapidamente o que procuro no site.

#### Critérios de Aceitação

1. THE Plataforma SHALL exibir um Menu de Navegação visível em todas as páginas, contendo links para: Início, Catálogo, Categorias e Política de Privacidade.
2. WHEN o usuário acessa a Plataforma em um dispositivo com largura de tela inferior a 768px, THE Menu de Navegação SHALL se transformar em um menu de hambúrguer expansível (ícone de três linhas).
3. WHEN o usuário toca no ícone de hambúrguer, THE Menu de Navegação SHALL expandir exibindo todos os links de navegação de forma vertical.
4. WHEN o usuário clica em qualquer link do Menu de Navegação, THE Plataforma SHALL navegar para a seção ou página correspondente em até 500ms.
5. THE Menu de Navegação SHALL destacar visualmente o link da página atualmente ativa.

---

### Requisito 2: Página Inicial (Home)

**User Story:** Como um menino de 8 a 10 anos, eu quero ver uma página inicial atraente e animada, para que eu fique empolgado para explorar e jogar.

#### Critérios de Aceitação

1. THE Plataforma SHALL exibir uma página inicial com um banner de destaque contendo o nome do site, um slogan chamativo e um botão de chamada para ação "Ver Jogos".
2. WHEN o usuário clica no botão "Ver Jogos", THE Plataforma SHALL navegar para a seção do Catálogo.
3. THE Plataforma SHALL exibir na página inicial uma seção "Jogos em Destaque" contendo até 4 Cards de Jogo dos jogos mais recentes ou escolhidos editorialmente.
4. THE Plataforma SHALL exibir na página inicial uma seção "Categorias" com ícones visuais para cada Categoria disponível.
5. WHEN o usuário clica em um ícone de Categoria na página inicial, THE Plataforma SHALL navegar para o Catálogo já filtrado pela Categoria selecionada.
6. THE Plataforma SHALL utilizar animações CSS suaves (transições de entrada de elementos) que não causem distração excessiva nem prejudiquem a performance.

---

### Requisito 3: Catálogo de Jogos com Filtro por Categoria

**User Story:** Como um menino de 8 a 10 anos, eu quero navegar pelos jogos por categoria, para que eu encontre facilmente o tipo de jogo que quero jogar.

#### Critérios de Aceitação

1. THE Catálogo SHALL exibir todos os Jogos disponíveis como Cards de Jogo em um layout de grade responsivo.
2. THE Catálogo SHALL exibir botões de filtro para cada Categoria disponível, além de uma opção "Todos".
3. WHEN o usuário seleciona uma Categoria, THE Catálogo SHALL exibir somente os Cards de Jogo pertencentes à Categoria selecionada.
4. WHEN o usuário seleciona "Todos", THE Catálogo SHALL exibir todos os Cards de Jogo disponíveis.
5. THE Catálogo SHALL atualizar a exibição dos Cards de Jogo sem recarregar a página (filtragem client-side).
6. WHEN nenhum jogo está disponível para uma Categoria selecionada, THE Catálogo SHALL exibir uma mensagem informativa como "Nenhum jogo encontrado nesta categoria. Novos jogos em breve!".
7. THE Card de Jogo SHALL exibir: título do jogo, imagem de capa, categoria, breve descrição (máximo 80 caracteres) e um botão "Jogar".
8. WHEN o usuário clica no botão "Jogar" em um Card de Jogo, THE Plataforma SHALL navegar para a Página de Jogo correspondente.

---

### Requisito 4: Página de Jogo

**User Story:** Como um menino de 8 a 10 anos, eu quero jogar sem distrações em uma tela dedicada, para que eu possa me concentrar e me divertir.

#### Critérios de Aceitação

1. THE Página de Jogo SHALL exibir o Jogo em uma área de jogo centralizada e de tamanho adequado para a tela disponível.
2. THE Página de Jogo SHALL exibir o título do Jogo, a Categoria e uma breve descrição acima da área de jogo.
3. THE Página de Jogo SHALL exibir um botão "Voltar ao Catálogo" que permite ao usuário retornar ao Catálogo sem perder o estado do filtro anterior.
4. WHEN o usuário acessa a Página de Jogo em dispositivo móvel, THE Página de Jogo SHALL ajustar a área de jogo para ocupar a largura total disponível mantendo a proporção original do Jogo.
5. WHEN o Jogo é carregado, THE Página de Jogo SHALL exibir um indicador visual de carregamento até que o Jogo esteja pronto para interação.

---

### Requisito 5: Jogos Iniciais — Nave Espacial (Ação)

**User Story:** Como um menino de 8 a 10 anos, eu quero jogar um jogo de nave espacial, para que eu me divirta atirando em asteroides.

#### Critérios de Aceitação

1. THE Jogo "Nave Espacial" SHALL pertencer à Categoria "Ação".
2. WHEN o jogo é iniciado, THE Jogo "Nave Espacial" SHALL exibir uma nave controlável pelo teclado (setas ou WASD) ou por toque na tela em dispositivos móveis.
3. WHEN asteroides ou inimigos colidem com a nave, THE Jogo "Nave Espacial" SHALL reduzir o número de vidas do jogador em 1.
4. WHEN o número de vidas do jogador chega a 0, THE Jogo "Nave Espacial" SHALL exibir a tela de Game Over com a pontuação final e opção de reiniciar.
5. THE Jogo "Nave Espacial" SHALL exibir a pontuação atual e o número de vidas restantes em tempo real durante a partida.
6. THE Jogo "Nave Espacial" SHALL aumentar progressivamente a velocidade e frequência dos obstáculos conforme a pontuação aumenta.

---

### Requisito 6: Jogos Iniciais — Jogo da Memória (Memória)

**User Story:** Como um menino de 8 a 10 anos, eu quero jogar um jogo da memória com personagens legais, para que eu treine minha memória me divertindo.

#### Critérios de Aceitação

1. THE Jogo "Memória" SHALL pertencer à Categoria "Memória".
2. THE Jogo "Memória" SHALL exibir um tabuleiro com pares de cartas viradas para baixo com ícones ou emojis temáticos (espaço, animais, esportes).
3. WHEN o usuário clica em duas cartas, THE Jogo "Memória" SHALL virar ambas e verificar se formam um par.
4. WHEN as duas cartas viradas formam um par, THE Jogo "Memória" SHALL manter ambas viradas para cima e incrementar a pontuação.
5. WHEN as duas cartas viradas não formam um par, THE Jogo "Memória" SHALL virar ambas de volta após 1 segundo.
6. WHEN todos os pares são encontrados, THE Jogo "Memória" SHALL exibir uma tela de vitória com o número de tentativas realizadas e opção de reiniciar.
7. THE Jogo "Memória" SHALL oferecer ao menos dois níveis de dificuldade: Fácil (8 pares) e Difícil (16 pares).

---

### Requisito 7: Jogos Iniciais — Quiz de Conhecimentos (Raciocínio)

**User Story:** Como um menino de 8 a 10 anos, eu quero responder perguntas curiosas sobre ciência e natureza, para que eu aprenda enquanto me divirto.

#### Critérios de Aceitação

1. THE Jogo "Quiz" SHALL pertencer à Categoria "Raciocínio".
2. THE Jogo "Quiz" SHALL exibir perguntas de múltipla escolha com 4 alternativas por pergunta, com temática de ciência, natureza e curiosidades do espaço.
3. WHEN o usuário seleciona uma alternativa, THE Jogo "Quiz" SHALL indicar visualmente se a resposta está correta (verde) ou incorreta (vermelho) e revelar a resposta correta quando errada.
4. THE Jogo "Quiz" SHALL apresentar um banco de ao menos 20 perguntas embaralhadas aleatoriamente a cada partida.
5. WHEN uma rodada de 10 perguntas é concluída, THE Jogo "Quiz" SHALL exibir a pontuação final (ex.: "7 de 10 corretas") e uma mensagem motivacional.
6. THE Jogo "Quiz" SHALL exibir um temporizador de 15 segundos por pergunta.
7. WHEN o temporizador chega a 0, THE Jogo "Quiz" SHALL avançar automaticamente para a próxima pergunta contando a resposta como incorreta.

---

### Requisito 8: Jogos Iniciais — Quebra-Cabeça Deslizante (Quebra-Cabeça)

**User Story:** Como um menino de 8 a 10 anos, eu quero resolver um quebra-cabeça de peças deslizantes, para que eu exercite o raciocínio lógico.

#### Critérios de Aceitação

1. THE Jogo "Quebra-Cabeça Deslizante" SHALL pertencer à Categoria "Quebra-Cabeça".
2. THE Jogo "Quebra-Cabeça Deslizante" SHALL exibir um tabuleiro 3x3 com 8 peças numeradas e 1 espaço vazio, embaralhadas aleatoriamente ao iniciar.
3. WHEN o usuário clica em uma peça adjacente ao espaço vazio, THE Jogo "Quebra-Cabeça Deslizante" SHALL mover a peça para o espaço vazio.
4. WHEN o usuário toca em uma peça adjacente ao espaço vazio em dispositivo móvel, THE Jogo "Quebra-Cabeça Deslizante" SHALL mover a peça para o espaço vazio.
5. WHEN todas as peças estão na posição correta, THE Jogo "Quebra-Cabeça Deslizante" SHALL exibir uma animação de vitória, o número de movimentos realizados e opção de reiniciar.
6. THE Jogo "Quebra-Cabeça Deslizante" SHALL exibir o contador de movimentos em tempo real durante a partida.
7. THE Jogo "Quebra-Cabeça Deslizante" SHALL garantir que o embaralhamento inicial sempre gere uma configuração com solução possível.

---

### Requisito 9: Layout Responsivo e Acessível

**User Story:** Como um menino de 8 a 10 anos, eu quero usar o site tanto no celular quanto no computador, para que eu possa jogar em qualquer dispositivo que tiver à mão.

#### Critérios de Aceitação

1. THE Plataforma SHALL funcionar corretamente em telas com largura mínima de 320px (smartphones compactos) e máxima de 1920px (monitores wide).
2. THE Plataforma SHALL utilizar unidades relativas (rem, %, vw, vh) e media queries para garantir o Layout Responsivo em todos os breakpoints: 320px, 480px, 768px, 1024px e 1280px.
3. THE Plataforma SHALL utilizar fontes com tamanho mínimo de 16px no corpo do texto para garantir legibilidade para a faixa etária alvo.
4. THE Plataforma SHALL apresentar elementos interativos (botões, links, cards) com área de toque mínima de 44x44px conforme recomendação de usabilidade.
5. THE Plataforma SHALL utilizar contraste de cor mínimo de 4.5:1 entre texto e fundo nos componentes principais.
6. THE Plataforma SHALL funcionar nos navegadores: Chrome (versão 90+), Firefox (versão 88+), Safari (versão 14+) e Edge (versão 90+).

---

### Requisito 10: Visual e Identidade Moderna para o Público-Alvo

**User Story:** Como um menino de 8 a 10 anos, eu quero que o site tenha uma aparência moderna e empolgante, para que eu me sinta atraído a explorar e voltar sempre.

#### Critérios de Aceitação

1. THE Plataforma SHALL utilizar uma paleta de cores primária com tons vibrantes como azul elétrico, roxo neon e verde limão, com fundo escuro (dark mode nativo), seguindo a tendência de jogos modernos para a faixa etária.
2. THE Plataforma SHALL utilizar uma tipografia legível e com personalidade, como fontes sans-serif arredondadas (ex.: Nunito, Fredoka One via Google Fonts).
3. THE Plataforma SHALL exibir ícones e ilustrações vetoriais temáticas (espaço, games, aventura) como elementos decorativos nas páginas principais.
4. THE Plataforma SHALL utilizar efeitos de hover nos Cards de Jogo (elevação e brilho suave) para indicar interatividade.
5. THE Plataforma SHALL aplicar um tema visual consistente (cores, tipografia, espaçamentos) em todas as páginas utilizando variáveis CSS (custom properties).

---

### Requisito 11: Estrutura de Código Extensível para Novos Jogos

**User Story:** Como desenvolvedor, eu quero uma estrutura de projeto organizada, para que eu consiga adicionar novos jogos no futuro com o mínimo de esforço.

#### Critérios de Aceitação

1. THE Plataforma SHALL organizar cada Jogo em seu próprio diretório dentro de `games/{nome-do-jogo}/`, contendo no mínimo: `index.html`, `game.js` e `style.css`.
2. THE Plataforma SHALL manter um arquivo de configuração central `games/catalog.js` (ou equivalente em JSON) que lista todos os jogos com seus metadados: id, título, descrição, categoria, imagem de capa e caminho.
3. WHEN um novo objeto de jogo é adicionado ao arquivo de configuração central, THE Catálogo SHALL exibir o novo Card de Jogo automaticamente sem necessidade de alteração em outros arquivos HTML.
4. THE Plataforma SHALL documentar em um arquivo `README.md` na raiz do projeto o passo a passo para adicionar um novo jogo ao catálogo.
5. THE Plataforma SHALL separar os estilos globais em `css/style.css` e os estilos de cada jogo no diretório do respectivo jogo.

---

### Requisito 12: Política de Privacidade

**User Story:** Como responsável por uma criança, eu quero ler a política de privacidade do site, para que eu tenha certeza de que nenhum dado do meu filho é coletado.

#### Critérios de Aceitação

1. THE Plataforma SHALL exibir uma página de Política de Privacidade acessível a partir do Menu de Navegação e do rodapé em todas as páginas.
2. THE Política de Privacidade SHALL declarar explicitamente que a Plataforma não coleta, armazena, processa ou compartilha nenhuma informação pessoal dos usuários.
3. THE Política de Privacidade SHALL declarar que não utiliza cookies, rastreadores, analytics ou qualquer tecnologia de monitoramento de comportamento.
4. THE Política de Privacidade SHALL declarar que o conteúdo da Plataforma é destinado exclusivamente para entretenimento e diversão.
5. THE Política de Privacidade SHALL declarar que todos os jogos são executados localmente no navegador do usuário, sem envio de dados a servidores externos.
6. THE Política de Privacidade SHALL exibir a data da última atualização do documento.

---

### Requisito 13: Publicação no GitHub Pages

**User Story:** Como desenvolvedor, eu quero que o site seja publicado no GitHub Pages, para que ele fique disponível gratuitamente na internet sem necessidade de servidor.

#### Critérios de Aceitação

1. THE Plataforma SHALL ser composta exclusivamente por arquivos estáticos (HTML, CSS, JavaScript) sem dependência de backend, banco de dados ou build tools obrigatórias.
2. THE Plataforma SHALL ter um arquivo `index.html` na raiz do repositório como ponto de entrada principal, compatível com o GitHub Pages.
3. THE Plataforma SHALL utilizar caminhos relativos em todos os links internos, imagens e scripts para garantir funcionamento correto tanto em desenvolvimento local quanto no GitHub Pages com subdiretório de repositório.
4. THE Plataforma SHALL incluir no `README.md` as instruções de como fazer o deploy no GitHub Pages (ativação via Settings > Pages).

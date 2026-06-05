# 🎮 Catálogo de Jogos Infantil

Plataforma web estática com jogos interativos para meninos de 8 a 10 anos.  
Sem instalação, sem login, sem coleta de dados — tudo roda direto no navegador.

**Acesse agora:** `https://<seu-usuario>.github.io/<nome-do-repositorio>/`

---

## 📁 Estrutura do Projeto

```
/
├── index.html              # SPA principal (home, catálogo, privacidade)
├── README.md               # Este arquivo
├── css/
│   └── style.css           # Estilos globais e variáveis CSS
├── js/
│   ├── router.js           # Roteamento por hash (#section)
│   ├── catalog.js          # Renderização e filtragem dos cards
│   └── ui.js               # Menu hambúrguer, animações, utilitários
├── games/
│   ├── catalog.js          # ⭐ Configuração central de todos os jogos
│   ├── nave-espacial/      # Jogo: Nave Espacial (Ação)
│   │   ├── index.html
│   │   ├── game.js
│   │   └── style.css
│   ├── memoria/            # Jogo: Jogo da Memória (Memória)
│   ├── quiz/               # Jogo: Quiz de Conhecimentos (Raciocínio)
│   └── puzzle-deslizante/  # Jogo: Quebra-Cabeça Deslizante (Quebra-Cabeça)
└── assets/
    ├── cover-placeholder.png   # Imagem de fallback para capas ausentes
    └── ...                     # Ícones e ilustrações decorativas
```

---

## ➕ Como Adicionar um Novo Jogo

Adicionar um jogo ao catálogo leva apenas **3 passos** — nenhum outro arquivo HTML precisa ser modificado.

### Passo 1 — Crie o diretório do jogo

```
games/
└── meu-novo-jogo/
    ├── index.html   # Página do jogo
    ├── game.js      # Lógica do jogo
    └── style.css    # Estilos específicos do jogo
```

Use o template abaixo para o `index.html` do jogo:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nome do Jogo — Catálogo de Jogos Infantil</title>
  <link rel="stylesheet" href="../../css/style.css" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header class="game-header">
    <a class="btn btn--secondary" href="../../index.html#catalogo">
      ← Voltar ao Catálogo
    </a>
    <div class="game-header__info">
      <h1>Nome do Jogo</h1>
      <p class="game-header__category">Categoria</p>
      <p class="game-header__description">Descrição curta do jogo.</p>
    </div>
  </header>

  <main class="game-container">
    <!-- Indicador de loading (removido pelo game.js quando pronto) -->
    <div class="game-loading" id="game-loading" aria-label="Carregando jogo…">
      <div class="spinner" aria-hidden="true"></div>
      <p>Carregando…</p>
    </div>

    <!-- Área do jogo -->
    <div id="game-area">
      <!-- Seu jogo aqui -->
    </div>
  </main>

  <script src="game.js" defer></script>
</body>
</html>
```

### Passo 2 — Adicione uma imagem de capa

Salve a capa do jogo em `games/meu-novo-jogo/cover.png`.

- Tamanho recomendado: **400 × 225 px** (proporção 16:9)
- Formato: PNG ou JPEG
- Se não tiver capa, o site exibirá automaticamente `assets/cover-placeholder.png`

### Passo 3 — Registre o jogo em `games/catalog.js`

Abra `games/catalog.js` e adicione um objeto ao array `GAMES`:

```js
const GAMES = [
  // ... jogos existentes ...
  {
    id:          "meu-novo-jogo",                          // kebab-case único
    title:       "Meu Novo Jogo",                          // exibido no card
    description: "Descrição curta com até 80 caracteres.", // máx 80 chars
    category:    "Acao",                                   // veja categorias abaixo
    cover:       "games/meu-novo-jogo/cover.png",          // caminho da capa
    path:        "games/meu-novo-jogo/index.html",         // caminho do jogo
    featured:    true                                      // opcional: aparece em Destaques
  }
];
```

**Categorias disponíveis:**

| `category`      | Exibido como   | Ícone |
|-----------------|----------------|-------|
| `"Acao"`        | Ação           | 🚀    |
| `"Memoria"`     | Memória        | 🧠    |
| `"Raciocinio"`  | Raciocínio     | 💡    |
| `"Quebra-Cabeca"` | Quebra-Cabeça | 🧩   |

> **Pronto!** O novo card aparecerá automaticamente no catálogo na próxima vez que o site for carregado, sem precisar alterar nenhum outro arquivo.

---

## 🚀 Deploy no GitHub Pages

### Pré-requisitos

- Uma conta no [GitHub](https://github.com)
- O repositório criado (pode ser público ou privado com GitHub Pro)

### Passo a passo

1. **Faça push de todos os arquivos** para o branch `main` (ou `master`) do seu repositório:

   ```bash
   git init
   git add .
   git commit -m "Primeiro deploy do Catálogo de Jogos Infantil"
   git branch -M main
   git remote add origin https://github.com/<seu-usuario>/<nome-do-repositorio>.git
   git push -u origin main
   ```

2. **Ative o GitHub Pages:**
   - Acesse seu repositório no GitHub
   - Clique em **Settings** (Configurações)
   - No menu lateral, clique em **Pages**
   - Em **Source**, selecione o branch `main` e a pasta `/ (root)`
   - Clique em **Save**

3. **Aguarde o deploy** (geralmente leva 1 a 2 minutos).

4. **Acesse o site** no endereço exibido na página de configurações:
   ```
   https://<seu-usuario>.github.io/<nome-do-repositorio>/
   ```

### Atualizando o site

Para publicar qualquer alteração, basta fazer commit e push para o branch configurado:

```bash
git add .
git commit -m "Adiciona novo jogo: Meu Novo Jogo"
git push
```

O GitHub Pages atualizará o site automaticamente em alguns minutos.

---

## 🛠️ Desenvolvimento Local

O projeto não exige build tools. Basta servir os arquivos com qualquer servidor HTTP local:

```bash
# Usando Python (pré-instalado em macOS/Linux)
python3 -m http.server 8080

# Usando Node.js (npx)
npx serve .

# Usando a extensão Live Server do VS Code
# Clique com botão direito em index.html → "Open with Live Server"
```

Depois abra `http://localhost:8080` no navegador.

> ⚠️ **Não abra `index.html` diretamente** como arquivo (`file://`). Algumas funcionalidades de JavaScript (como `fetch`) não funcionam fora de um servidor HTTP.

---

## 🧪 Testes

O projeto usa [Vitest](https://vitest.dev/) e [fast-check](https://github.com/dubzzz/fast-check) para testes unitários e baseados em propriedades.

```bash
# Instalar dependências de desenvolvimento
npm install

# Executar todos os testes (modo único, sem watch)
npm test

# Executar testes em modo watch (durante desenvolvimento)
npm run test:watch
```

---

## 🎨 Personalização Visual

As cores, tipografia e espaçamentos são controlados por variáveis CSS em `css/style.css`:

```css
:root {
  --color-blue:   #00AAFF;  /* Azul elétrico */
  --color-purple: #AA00FF;  /* Roxo neon */
  --color-green:  #AAFF00;  /* Verde limão */
  --color-bg:     #0A0A14;  /* Fundo escuro */
  /* ... */
}
```

Altere essas variáveis para personalizar o visual do site inteiro de uma só vez.

---

## 📋 Requisitos de Compatibilidade

| Navegador | Versão mínima |
|-----------|---------------|
| Chrome    | 90+           |
| Firefox   | 88+           |
| Safari    | 14+           |
| Edge      | 90+           |

Dispositivos: telas de **320px a 1920px** de largura.

---

## 🔒 Privacidade

Este site não coleta nenhum dado pessoal. Não há cookies, analytics, publicidade nem rastreadores. Todos os jogos rodam localmente no navegador. Veja a [Política de Privacidade](index.html#privacidade) completa no site.

---

## 📄 Licença

Projeto de código aberto. Consulte o arquivo `LICENSE` para detalhes.

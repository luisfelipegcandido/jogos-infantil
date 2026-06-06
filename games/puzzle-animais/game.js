const images = [
    './assets/leao.jpeg',
    './assets/elefante.jpeg',
    './assets/girafa.jpeg',
    './assets/panda.jpeg',
    './assets/golfinho.jpeg'
];
const board = document.getElementById("board");
const movesEl = document.getElementById("moves");
const difficulties = {
    facil: 3,
    medio: 4,
    dificil: 5
};
let size = 3;
let piecesSize = 9;
let currentImage = '';
let lastImage = '';
let pieces = [];
let selected = null;
let moves = 0;

function chooseRandomImage() {
    let image;
    do {
        image = images[Math.floor(Math.random() * images.length)];
    } while (image === lastImage && images.length > 1);
    lastImage = image;
    return image;
}

function createPieces() {
    pieces = [];
    for (let i = 0; i < piecesSize; i++){
        pieces.push(i);
    }
    shuffle(pieces);
    render();
}

function shuffle(array) {
    for (let i = array.length-1; i > 0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function render() {
    board.innerHTML = '';
    pieces.forEach((piece, index) => {
        const div = document.createElement('div');
        div.className = 'piece';
        const row = Math.floor(piece / size);
        const col = piece % size;
        div.style.backgroundImage = `url(${currentImage})`;
        div.style.backgroundSize = '300% 300%';
        div.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        div.onclick = () => selectPiece(index);
        board.appendChild(div);
    });
}

function selectPiece(index) {
    if (selected === null) {
        selected = index;
        board.children[index].classList.add("selected");
        return;
    }
    [pieces[selected], pieces[index]] = [pieces[index], pieces[selected]];
    selected = null;
    moves++;
    movesEl.textContent = moves;
    render();
    checkVictory();
}

function checkVictory() {
    for (let i=0; i < piecesSize; i++) {
        if (pieces[i] !== i){
            return;
        }
    }
    document.getElementById("victory").classList.remove("hidden");
}

function newGame() {
    moves = 0;
    movesEl.textContent = 0;
    document.getElementById('victory').classList.add('hidden');
    currentImage = chooseRandomImage();
    createPieces();
}

document.getElementById("new-game").addEventListener("click", newGame);
document.getElementById("play-again").addEventListener("click", newGame);

newGame();
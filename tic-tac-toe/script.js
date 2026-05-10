const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board;
let current;
let active;

function winner() {
  for (const line of wins) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

function render() {
  boardEl.innerHTML = "";
  board.forEach((value, index) => {
    const button = document.createElement("button");
    button.className = `cell ${value === "O" ? "o" : ""}`;
    button.textContent = value;
    button.setAttribute("aria-label", `Cell ${index + 1}`);
    button.addEventListener("click", () => play(index));
    boardEl.appendChild(button);
  });
}

function play(index) {
  if (!active || board[index]) return;
  board[index] = current;
  const win = winner();
  if (win) {
    active = false;
    render();
    win.forEach(cellIndex => boardEl.children[cellIndex].classList.add("win"));
    statusEl.textContent = `${current} wins.`;
    return;
  }
  if (board.every(Boolean)) {
    active = false;
    render();
    statusEl.textContent = "Draw.";
    return;
  }
  current = current === "X" ? "O" : "X";
  render();
  statusEl.textContent = `${current}'s turn.`;
}

function reset() {
  board = Array(9).fill("");
  current = "X";
  active = true;
  statusEl.textContent = "X starts.";
  render();
}

resetBtn.addEventListener("click", reset);
reset();

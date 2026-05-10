const boardEl = document.getElementById("board");
const difficultyEl = document.getElementById("difficulty");
const messageEl = document.getElementById("message");
const newPuzzleBtn = document.getElementById("newPuzzle");
const checkPuzzleBtn = document.getElementById("checkPuzzle");
const solvePuzzleBtn = document.getElementById("solvePuzzle");

let solution = [];
let puzzle = [];

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pattern(row, col) {
  return (row * 3 + Math.floor(row / 3) + col) % 9;
}

function makeSolution() {
  const rows = shuffle([0, 1, 2]).flatMap(group => shuffle([0, 1, 2]).map(row => group * 3 + row));
  const cols = shuffle([0, 1, 2]).flatMap(group => shuffle([0, 1, 2]).map(col => group * 3 + col));
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  return rows.map(row => cols.map(col => nums[pattern(row, col)]));
}

function makePuzzle(fullBoard, level) {
  const blanks = { easy: 36, medium: 46, hard: 54 }[level];
  const next = fullBoard.map(row => [...row]);
  const cells = shuffle(Array.from({ length: 81 }, (_, index) => index));
  cells.slice(0, blanks).forEach(index => {
    next[Math.floor(index / 9)][index % 9] = 0;
  });
  return next;
}

function renderBoard() {
  boardEl.innerHTML = "";
  puzzle.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      const input = document.createElement("input");
      input.className = "cell";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.dataset.row = rowIndex;
      input.dataset.col = colIndex;
      if (value) {
        input.value = value;
        input.disabled = true;
        input.classList.add("given");
      }
      input.addEventListener("input", () => {
        input.value = input.value.replace(/[^1-9]/g, "").slice(0, 1);
        input.classList.remove("invalid");
      });
      boardEl.appendChild(input);
    });
  });
}

function generate() {
  solution = makeSolution();
  puzzle = makePuzzle(solution, difficultyEl.value);
  messageEl.textContent = "Fill the empty cells with numbers 1-9.";
  renderBoard();
}

function checkPuzzle() {
  let complete = true;
  let mistakes = 0;
  document.querySelectorAll(".cell").forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const value = Number(cell.value);
    cell.classList.remove("invalid");
    if (!value) complete = false;
    if (value && value !== solution[row][col]) {
      mistakes += 1;
      cell.classList.add("invalid");
    }
  });
  if (mistakes) messageEl.textContent = `${mistakes} cell${mistakes === 1 ? "" : "s"} need another look.`;
  else if (complete) messageEl.textContent = "Perfect solve.";
  else messageEl.textContent = "No mistakes so far.";
}

function solvePuzzle() {
  document.querySelectorAll(".cell").forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    cell.value = solution[row][col];
    cell.classList.remove("invalid");
  });
  messageEl.textContent = "Solved puzzle shown.";
}

newPuzzleBtn.addEventListener("click", generate);
checkPuzzleBtn.addEventListener("click", checkPuzzle);
solvePuzzleBtn.addEventListener("click", solvePuzzle);

generate();

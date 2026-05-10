const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

const gridSize = 21;
const cell = canvas.width / gridSize;
let snake;
let food;
let direction;
let nextDirection;
let score;
let timer = null;
let best = Number(localStorage.getItem("snakeBest") || 0);

bestEl.textContent = best;

function randomFood() {
  let spot;
  do {
    spot = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (snake.some(part => part.x === spot.x && part.y === spot.y));
  return spot;
}

function reset() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  score = 0;
  food = randomFood();
  scoreEl.textContent = score;
  statusEl.textContent = "Press Start. Use arrow keys or WASD.";
  stop();
  draw();
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
}

function draw() {
  ctx.fillStyle = "#071311";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#12302b";
  for (let i = 0; i <= gridSize; i += 1) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, canvas.height);
    ctx.moveTo(0, i * cell);
    ctx.lineTo(canvas.width, i * cell);
    ctx.stroke();
  }
  drawCell(food.x, food.y, "#f97316");
  snake.forEach((part, index) => drawCell(part.x, part.y, index === 0 ? "#5eead4" : "#14b8a6"));
}

function step() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };
  const hitWall = head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
  const hitSelf = snake.some(part => part.x === head.x && part.y === head.y);
  if (hitWall || hitSelf) {
    stop();
    statusEl.textContent = "Game over. Reset or start again.";
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > best) {
      best = score;
      localStorage.setItem("snakeBest", best);
      bestEl.textContent = best;
    }
    food = randomFood();
  } else {
    snake.pop();
  }
  draw();
}

function start() {
  if (!timer) {
    statusEl.textContent = "Running.";
    timer = setInterval(step, 115);
  }
}

function stop() {
  clearInterval(timer);
  timer = null;
}

function setDirection(next) {
  if (next.x + direction.x === 0 && next.y + direction.y === 0) return;
  nextDirection = next;
}

document.addEventListener("keydown", event => {
  const keys = {
    ArrowUp: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };
  if (keys[event.key]) setDirection(keys[event.key]);
});

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", () => {
  stop();
  statusEl.textContent = "Paused.";
});
resetBtn.addEventListener("click", reset);

reset();

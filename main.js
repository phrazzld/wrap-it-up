// == main.js ==
import { enemymanager } from './enemymanager.js';
import { level } from './levels.js';
import { playerclass } from './player.js';
import { scoreboard } from './scoreboard.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// audio
const backgroundMusic = new Audio('assets/audio/soundtrack.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

const gameOverSound = new Audio('assets/audio/game-over-00.mp3');
gameOverSound.volume = 0.7;

function resizecanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizecanvas);
resizecanvas();

let gamestate = 'menu';
const keys = { left: false, right: false, up: false };
const gravity = 0.4;
const jumppower = 15;
let camera = { x: 0 };

const player = new playerclass();
const gamelevel = new level({ maxhorizontal: 250, maxvertical: 80 });
const enemies = new enemymanager();
const scoreboardobj = new scoreboard();

// fewer flakes
const snowflakes = [];
let snowtimer = 0;

document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'Space') keys.up = true;

  if ((gamestate === 'menu' && e.code === 'Enter') || (gamestate === 'gameover' && e.code === 'Enter')) {
    backgroundMusic.play();
    initgame();
    gamestate = 'playing';
  }
  if (gamestate === 'gameover' && e.code === 'KeyR') {
    gamestate = 'menu';
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'Space') keys.up = false;
});

function initgame() {
  player.reset();
  camera.x = 0;
  scoreboardobj.reset();
  gamelevel.platforms = [];
  gamelevel.gifts = [];
  gamelevel.generatedchunks = 0;
  gamelevel.init();
  enemies.reset();
}

function update() {
  if (gamestate !== 'playing') return;

  // update player
  player.update(keys, gravity, jumppower);
  // check collisions with platforms & gifts
  gamelevel.collideplayer(player, scoreboardobj);
  // spawn new chunks
  gamelevel.update(player.x);
  // update scoreboard effects
  scoreboardobj.update();
  // update enemies
  enemies.update(1, gamelevel, gravity, player, scoreboardobj);

  // camera
  const midscreen = canvas.width * 0.5;
  if (player.x - camera.x > midscreen) {
    camera.x = player.x - midscreen;
  }

  // dynamically determine bottom of screen
  const bottom = canvas.height - player.h;
  // if player falls off screen, game over
  if (player.y > bottom) {
    gameOverSound.play();
    gamestate = 'gameover';
  }

  // if out of health, game over
  if (player.health <= 0) {
    gameOverSound.play();
    gamestate = 'gameover';
  }

  // spawn moderate snow
  snowtimer++;
  if (snowtimer > 30) {
    snowtimer = 0;
    snowflakes.push({
      x: Math.random() * canvas.width + camera.x,
      y: -10,
      vy: 1 + Math.random() * 1,
      size: 2 + Math.random() * 2
    });
  }
  for (let flake of snowflakes) {
    flake.y += flake.vy;
  }
  for (let i = snowflakes.length - 1; i >= 0; i--) {
    if (snowflakes[i].y > canvas.height + 10) {
      snowflakes.splice(i, 1);
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gamestate === 'menu') {
    drawmenu();
    return;
  }
  if (gamestate === 'gameover') {
    drawgameover();
    backgroundMusic.currentTime = 0;
    backgroundMusic.pause();
    return;
  }

  ctx.fillStyle = '#223';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw level
  gamelevel.draw(ctx, camera);

  // draw enemies
  ctx.fillStyle = '#0f0';
  for (let e of enemies.enemies) {
    ctx.fillRect(e.x - camera.x, e.y, e.w, e.h);
  }

  // draw player (red block)
  ctx.save();
  ctx.translate(player.x - camera.x + player.w / 2, player.y + player.h / 2);
  ctx.scale(player.direction, 1);
  ctx.fillStyle = '#f22';
  ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
  ctx.restore();

  // snow
  ctx.fillStyle = '#fff';
  for (let flake of snowflakes) {
    ctx.beginPath();
    ctx.arc(flake.x - camera.x, flake.y, flake.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // scoreboard
  scoreboardobj.draw(ctx, player);
}

function drawmenu() {
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '30px sans-serif';
  ctx.fillText('press enter for an infinite xmas run', 50, 100);
  ctx.fillText('collect unwrapped gifts, avoid the rogue toys', 50, 160);
}

function drawgameover() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f22';
  ctx.font = '40px sans-serif';
  ctx.fillText('game over dude', 50, 100);
  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';
  ctx.fillText('score: ' + scoreboardobj.score, 50, 160);
  ctx.fillText('press enter to play again', 50, 220);
  ctx.fillText('press r to return to the main menu', 50, 260);
}

// main loop
function gameloop() {
  update();
  draw();
  requestAnimationFrame(gameloop);
}

gameloop();

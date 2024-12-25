// == main.js ==
import { enemymanager } from './enemymanager.js';
import { level } from './levels.js';
import { playerclass } from './player.js';
import { scoreboard } from './scoreboard.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const bgImage = new Image();
bgImage.src = 'assets/images/background.png';

const menuImage = new Image();
menuImage.src = 'assets/images/menu.png';

const gameOverImage = new Image();
gameOverImage.src = 'assets/images/game-over.png';

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

  // spawn MORE snow
  snowtimer++;
  if (snowtimer > 15) {                // 1) spawn more frequently (was 30 before)
    snowtimer = 0;
    for (let i = 0; i < 3; i++) {      // 2) spawn multiple flakes at once
      snowflakes.push({
        x: Math.random() * canvas.width + camera.x,
        y: -10,
        vy: 1 + Math.random() * 1,
        size: 2 + Math.random() * 2
      });
    }
  }

  // update flakes
  for (let flake of snowflakes) {
    flake.y += flake.vy;
  }
  // remove offscreen
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

  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

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
  ctx.drawImage(menuImage, 0, 0, canvas.width, canvas.height);

  // add a subtle frosty overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // text styling
  ctx.fillStyle = '#c00';  // bright holiday red
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.shadowBlur = 6;

  ctx.font = '60px "Mountains of Christmas", cursive';
  ctx.fillText('merry infinite xmas run!', 50, 100);

  // instructions
  ctx.font = '40px "Mountains of Christmas", cursive';
  ctx.shadowBlur = 3;
  ctx.fillStyle = '#050'; // a jolly green
  ctx.fillText('press enter to begin your jolly quest', 50, 180);
  ctx.fillText('collect gifts, dodge rogue toys, spread cheer', 50, 230);

  // reset shadow so subsequent draws aren’t blurred
  ctx.shadowColor = 'transparent';
}

function drawgameover() {
  // draw background
  ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);

  // lighter overlay, maybe a bit stronger to highlight the end-of-game
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // big red text with white shadow
  ctx.fillStyle = '#c00';
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.shadowBlur = 5;
  ctx.font = '60px "Mountains of Christmas", cursive';
  ctx.fillText('the holiday hustle is over!', 50, 100);

  // smaller text
  ctx.shadowBlur = 2;
  ctx.font = '40px "Mountains of Christmas", cursive';
  ctx.fillStyle = '#000';
  ctx.fillText('score: ' + scoreboardobj.score, 50, 160);
  ctx.font = '30px "Mountains of Christmas", cursive';
  ctx.fillText('press enter to try again', 50, 220);
  ctx.fillText('press r to return to the main menu', 50, 260);

  // reset shadow
  ctx.shadowColor = 'transparent';
  backgroundMusic.currentTime = 0;
  backgroundMusic.pause();
}

// main loop
function gameloop() {
  update();
  draw();
  requestAnimationFrame(gameloop);
}

gameloop();

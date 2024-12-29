// == main.js ==
import { enemymanager } from './enemymanager.js';
import { leaderboard } from './leaderboard.js';
import { level } from './levels.js';
import { playerclass } from './player.js';
import { scoreboard } from './scoreboard.js';
const gameleaderboard = new leaderboard();

let username = '';
let maxnamechars = 10;
let enteringname = false;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const bgImage = new Image();
bgImage.src = 'assets/images/background.webp';

const menuImage = new Image();
menuImage.src = 'assets/images/menu.webp';

const gameOverImage = new Image();
gameOverImage.src = 'assets/images/game-over.webp';

const groundEnemySprite = new Image();
groundEnemySprite.src = 'assets/sprites/ground-enemy.png';

const airEnemySprite = new Image();
airEnemySprite.src = 'assets/sprites/ghost-enemy.png';

const playerSprite = new Image();
playerSprite.src = 'assets/sprites/player.png';

// audio
const backgroundMusic = new Audio('assets/audio/soundtrack.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;

const menuMusic = new Audio('assets/audio/menu.mp3');
menuMusic.loop = true;
menuMusic.volume = 0.4;

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
export const scoreboardobj = new scoreboard();

// fewer flakes
const snowflakes = [];
let snowtimer = 0;

document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'ArrowUp' || e.code === 'Space') keys.up = true;

  if (gamestate === 'menu') {
    // existing logic to start the game
    if (e.code === 'Enter') {
      initgame();
      gamestate = 'playing';
    }
  } else if (gamestate === 'gameover') {
    // if we're not currently in name entry
    if (!enteringname) {
      if (e.code === 'Enter') {
        // either go to nameentry or skip it
        enteringname = true;
        username = '';
      } else if (e.code === 'KeyR') {
        gamestate = 'menu';
      }
    } else {
      // user is typing the name
      if (e.code === 'Enter') {
        // finalize
        if (username.trim().length > 0) {
          gameleaderboard.addscore(username.trim(), scoreboardobj.score);
        }
        enteringname = false;
        gamestate = 'menu';
      } else if (e.code === 'Escape' || e.code === 'KeyR') {
        // bail out
        enteringname = false;
        gamestate = 'menu';
      } else if (e.code === 'Backspace') {
        // remove last char
        username = username.slice(0, -1);
      } else {
        // add typed char if it's a letter, digit, etc.
        if (e.key.length === 1 && username.length < maxnamechars) {
          username += e.key;
        }
      }
    }
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
  if (e.code === 'ArrowUp' || e.code === 'Space') keys.up = false;
});

function initgame() {
  menuMusic.currentTime = 0;
  menuMusic.pause();
  backgroundMusic.play();
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
    backgroundMusic.currentTime = 0;
    backgroundMusic.pause();
    menuMusic.currentTime = 0;
    menuMusic.play();
  }

  // if out of health, game over
  if (player.health <= 0) {
    gameOverSound.play();
    gamestate = 'gameover';
    backgroundMusic.currentTime = 0;
    backgroundMusic.pause();
    menuMusic.currentTime = 0;
    menuMusic.play();
  }

  // spawn MORE snow
  snowtimer++;
  const score = scoreboardobj.score
  let snowspawn = 30;
  if (score < 5) {
    snowspawn = 15;
  } else if (score < 10) {
    snowspawn = 10;
  } else if (score < 15) {
    snowspawn = 5;
  } else if (score < 20) {
    snowspawn = 3;
  } else {
    snowspawn = 1;
  }

  if (snowtimer > snowspawn) {                // 1) spawn more frequently (was 30 before)
    snowtimer = 0;
    for (let i = 0; i < 5; i++) {      // 2) spawn multiple flakes at once
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
  for (let e of enemies.enemies.filter(e => e.type === 'patrol')) {
    ctx.drawImage(
      groundEnemySprite,
      e.x - camera.x,
      e.y,
      e.w,
      e.h
    );
  }
  for (let e of enemies.enemies.filter(e => e.type === 'helicopter')) {
    ctx.drawImage(
      airEnemySprite,
      e.x - camera.x,
      e.y,
      e.w,
      e.h
    );
  }

  ctx.drawImage(
    playerSprite,
    player.x - camera.x,
    player.y,
    player.w,
    player.h
  );

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

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#c00';
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.shadowBlur = 6;

  ctx.font = '60px "Mountains of Christmas", cursive';
  ctx.fillText('merry infinite xmas run!', 50, 100);

  ctx.font = '40px "Mountains of Christmas", cursive';
  ctx.shadowBlur = 3;
  ctx.fillStyle = '#050';
  ctx.fillText('press enter to begin your jolly quest', 50, 180);

  // render leaderboard
  ctx.font = '30px "Mountains of Christmas", cursive';
  ctx.fillStyle = '#000';
  ctx.fillText('leaderboard:', 50, 260);

  const topscores = gameleaderboard.gettopscores();
  for (let i = 0; i < topscores.length; i++) {
    ctx.fillText(
      `${i + 1}. ${topscores[i].name} - ${topscores[i].score}`,
      50,
      300 + i * 30
    );
  }
}

function drawgameover() {
  // draw background, etc.
  ctx.drawImage(gameOverImage, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#c00';
  ctx.shadowColor = 'rgba(255,255,255,0.8)';
  ctx.shadowBlur = 5;
  ctx.font = '60px "Mountains of Christmas", cursive';
  ctx.fillText('the holiday hustle is over!', 50, 100);

  ctx.shadowBlur = 2;
  ctx.font = '40px "Mountains of Christmas", cursive';
  ctx.fillStyle = '#000';
  ctx.fillText('score: ' + scoreboardobj.score, 50, 160);

  // instructions
  if (!enteringname) {
    ctx.fillText('press enter to submit your score', 50, 220);
  } else {
    ctx.fillText('enter your name (then press enter):', 50, 220);
    // show typed name
    ctx.fillText(username + '_', 50, 260);
    ctx.font = '30px "Mountains of Christmas", cursive';
    ctx.fillText('press backspace to erase, esc to cancel', 50, 320);
  }
  // reset shadow
  ctx.shadowColor = 'transparent';
}

// main loop
function gameloop() {
  update();
  draw();
  requestAnimationFrame(gameloop);
}

gameloop();

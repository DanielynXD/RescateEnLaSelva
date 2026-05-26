import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/gameConfig.js';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import StoryScene from './scenes/StoryScene.js';
import GameScene from './scenes/GameScene.js';
import PauseScene from './scenes/PauseScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import WinScene from './scenes/WinScene.js';

import './style.css';

window.addEventListener('error', (event) => {
  const box = document.createElement('div');
  box.style.position = 'fixed';
  box.style.left = '10px';
  box.style.bottom = '10px';
  box.style.right = '10px';
  box.style.zIndex = '99999';
  box.style.background = 'rgba(120,0,0,0.92)';
  box.style.color = 'white';
  box.style.fontFamily = 'Arial';
  box.style.padding = '12px';
  box.style.border = '2px solid white';
  box.textContent = 'Error del juego: ' + (event.message || 'error desconocido');
  document.body.appendChild(box);
});

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#111111',
  pixelArt: false,
  roundPixels: true,
  fps: {
    target: 60,
    min: 45,
    smoothStep: true
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },
  scene: [BootScene, MenuScene, StoryScene, GameScene, PauseScene, GameOverScene, WinScene]
};

window.rescateSelvaGame = new Phaser.Game(config);

import Phaser from 'phaser';
import StorageManager from '../managers/StorageManager.js';
import AudioManager from '../managers/AudioManager.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.score = data.score || 0;
    this.level = data.level || 1;
  }

  create() {
    AudioManager.initScene(this);

    // Primero se muestra solo la imagen por 5 segundos.
    this.add.image(480, 270, 'game_over_bg').setDisplaySize(960, 540);

    this.time.delayedCall(5000, () => {
      this.showGameOverInfo();
    });
  }

  showGameOverInfo() {
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.48);

    this.add.text(480, 130, 'GAME OVER', {
      fontFamily: 'Arial Black', fontSize: '64px', color: '#ff3333', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(480, 225, `Puntaje: ${this.score}\nRecord: ${StorageManager.getHighScore()}\nLlegaste al nivel: ${this.level}`, {
      fontFamily: 'Arial', fontSize: '25px', color: '#ffffff', stroke: '#000000', strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);

    this.createButton(480, 350, 'REINTENTAR', () => this.scene.start('GameScene', { level: 1, score: 0 }));
    this.createButton(480, 420, 'MENU', () => this.scene.start('MenuScene'));
  }

  createButton(x, y, label, callback) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#ffffff', backgroundColor: '#244d13', padding: { x: 28, y: 12 }, stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      AudioManager.sfx('menu');
      callback();
    });
  }
}

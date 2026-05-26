import Phaser from 'phaser';
import StorageManager from '../managers/StorageManager.js';
import AudioManager from '../managers/AudioManager.js';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene');
  }

  init(data) {
    this.score = data.score || 0;
  }

  create() {
    AudioManager.initScene(this);
    AudioManager.stopMusic();
    AudioManager.sfx('win');

    // Primero se muestra solo la imagen por 5 segundos.
    this.add.image(480, 270, 'win_bg').setDisplaySize(960, 540);

    this.time.delayedCall(5000, () => {
      this.showWinInfo();
    });
  }

  showWinInfo() {
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.35);

    this.add.text(480, 85, '¡VALERIA HA SIDO RESCATADA!', {
      fontFamily: 'Arial Black', fontSize: '38px', color: '#d7ff5a', stroke: '#000000', strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(480, 185,
      'Leo derroto a Murk, Brakus y al Dr. Mortis.\nLa selva experimental queda libre de sus criaturas mutadas.', {
      fontFamily: 'Arial', fontSize: '23px', color: '#ffffff', stroke: '#000000', strokeThickness: 4,
      align: 'center', wordWrap: { width: 780 }
    }).setOrigin(0.5);

    this.add.text(480, 295, `Puntaje final: ${this.score}\nRecord guardado: ${StorageManager.getHighScore()}`, {
      fontFamily: 'Arial', fontSize: '25px', color: '#ffffff', stroke: '#000000', strokeThickness: 4,
      align: 'center'
    }).setOrigin(0.5);

    this.createButton(480, 400, 'JUGAR OTRA VEZ', () => this.scene.start('GameScene', { level: 1, score: 0 }));
    this.createButton(480, 470, 'MENU', () => this.scene.start('MenuScene'));
  }

  createButton(x, y, label, callback) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial Black', fontSize: '26px', color: '#ffffff', backgroundColor: '#244d13', padding: { x: 24, y: 10 }, stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      AudioManager.sfx('menu');
      callback();
    });
  }
}

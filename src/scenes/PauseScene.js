import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager.js';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.pauseData = data;
  }

  create() {
    AudioManager.initScene(this);
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.68);
    this.add.text(480, 135, 'PAUSA', {
      fontFamily: 'Arial Black', fontSize: '54px', color: '#d7ff5a', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5);

    this.createButton(480, 245, 'CONTINUAR', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });

    this.createButton(480, 315, AudioManager.isMuted() ? 'ACTIVAR SONIDO' : 'SILENCIAR', (button) => {
      const muted = AudioManager.toggleMute();
      button.setText(muted ? 'ACTIVAR SONIDO' : 'SILENCIAR');
    });

    this.createButton(480, 385, 'SALIR AL MENU', () => {
      this.scene.stop('GameScene');
      this.scene.start('MenuScene');
    });

    this.input.keyboard.on('keydown-P', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }

  createButton(x, y, label, callback) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial Black', fontSize: '25px', color: '#ffffff', backgroundColor: '#244d13', padding: { x: 24, y: 10 }, stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on('pointerover', () => button.setStyle({ backgroundColor: '#3f7f20' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#244d13' }));
    button.on('pointerdown', () => {
      AudioManager.sfx('menu');
      callback(button);
    });
    return button;
  }
}

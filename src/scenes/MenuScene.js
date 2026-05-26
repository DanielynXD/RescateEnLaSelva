import Phaser from 'phaser';
import StorageManager from '../managers/StorageManager.js';
import AudioManager from '../managers/AudioManager.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    AudioManager.initScene(this);
    this.add.image(480, 270, 'bg_jungle').setDisplaySize(960, 540);
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.42);

    this.add.text(480, 76, 'RESCATE EN LA SELVA', {
      fontFamily: 'Arial Black', fontSize: '48px', color: '#d7ff5a', stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(480, 132, 'Derrota a los 3 jefes y salva a Valeria', {
      fontFamily: 'Arial', fontSize: '24px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    this.createButton(480, 232, 'JUGAR', (button) => {
      button.disableInteractive();
      button.setText('CARGANDO...');
      this.add.rectangle(480, 270, 960, 540, 0x000000, 0.30).setDepth(300);
      this.add.text(480, 270, 'Cargando nivel 1...', {
        fontFamily: 'Arial Black', fontSize: '30px', color: '#ffffff',
        stroke: '#000000', strokeThickness: 5
      }).setOrigin(0.5).setDepth(301);

      // Primero cambiamos de escena. Luego el audio se inicia dentro del nivel.
      this.time.delayedCall(80, () => {
        this.scene.start('GameScene', { level: 1, score: 0 });
      });
    });

    this.createButton(480, 304, 'VER HISTORIA', () => {
      this.scene.start('StoryScene');
    });

    this.createButton(480, 376, AudioManager.isMuted() ? 'ACTIVAR SONIDO' : 'SILENCIAR SONIDO', (button) => {
      AudioManager.init();
      const muted = AudioManager.toggleMute();
      button.setText(muted ? 'ACTIVAR SONIDO' : 'SILENCIAR SONIDO');
    }, 22);

    this.add.text(480, 430, `Record: ${StorageManager.getHighScore()}   |   Nivel alcanzado: ${StorageManager.getStageReached()}`, {
      fontFamily: 'Arial', fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(480, 478, 'Controles: A/D o flechas = mover | W/Espacio = saltar | J/X = machete | P = pausa', {
      fontFamily: 'Arial', fontSize: '17px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('GameScene', { level: 1, score: 0 });
    });
  }

  createButton(x, y, label, callback, fontSize = 28) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial Black', fontSize: `${fontSize}px`, color: '#ffffff', backgroundColor: '#244d13', padding: { x: 28, y: 12 }, stroke: '#000000', strokeThickness: 4
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

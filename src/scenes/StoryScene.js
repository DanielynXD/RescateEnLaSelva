import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager.js';

export default class StoryScene extends Phaser.Scene {
  constructor() {
    super('StoryScene');
  }

  create() {
    AudioManager.initScene(this);
    this.slides = ['historia_1', 'historia_2', 'historia_3', 'historia_4'];
    this.texts = [
      'Leo y Valeria se encontraban conversando tranquilamente sobre los examenes frente a la FIS.',
      'De repente aparecio el Dr. Mortis y dijo que Valeria era justo la pieza que necesitaba para completar su experimento.',
      'El doctor atrapo a Valeria y se preparo para llevarsela a su laboratorio oculto en la selva.',
      'Leo quedo destrozado al ver como se llevaban a Valeria, pero no se rindio: iria a buscarla porque la ama.'
    ];
    this.index = 0;
    this.autoEvent = null;

    this.image = this.add.image(480, 270, this.slides[this.index]).setDisplaySize(960, 540);
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.08);

    this.overlay = this.add.rectangle(480, 461, 920, 118, 0x000000, 0.72)
      .setStrokeStyle(2, 0xd7ff5a, 0.75);

    this.caption = this.add.text(480, 436, this.texts[this.index], {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: 850 }
    }).setOrigin(0.5);

    this.progress = this.add.text(480, 506, 'Escena 1 / 4', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#d7ff5a',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.nextButton = this.createButton(780, 506, 'SIGUIENTE', () => this.nextSlide());
    this.skipButton = this.createButton(820, 36, 'SALTAR HISTORIA', () => this.goToMenu(), 18);

    this.add.text(160, 506, 'ESPACIO = siguiente | S = saltar', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.input.keyboard.on('keydown-SPACE', () => this.nextSlide());
    this.input.keyboard.on('keydown-S', () => this.goToMenu());

    this.resetAutoAdvance();
  }

  createButton(x, y, label, callback, fontSize = 20) {
    const button = this.add.text(x, y, label, {
      fontFamily: 'Arial Black',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      backgroundColor: '#244d13',
      padding: { x: 15, y: 8 },
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setStyle({ backgroundColor: '#3f7f20' }));
    button.on('pointerout', () => button.setStyle({ backgroundColor: '#244d13' }));
    button.on('pointerdown', () => {
      AudioManager.sfx('menu');
      callback();
    });
    return button;
  }

  resetAutoAdvance() {
    if (this.autoEvent) this.autoEvent.remove(false);
    this.autoEvent = this.time.delayedCall(6800, () => this.nextSlide());
  }

  nextSlide() {
    this.index += 1;
    if (this.index >= this.slides.length) {
      this.goToMenu();
      return;
    }

    this.image.setTexture(this.slides[this.index]);
    this.caption.setText(this.texts[this.index]);
    this.progress.setText(`Escena ${this.index + 1} / ${this.slides.length}`);

    if (this.index === this.slides.length - 1) {
      this.nextButton.setText('IR AL MENU');
    }

    this.resetAutoAdvance();
  }

  goToMenu() {
    if (this.autoEvent) this.autoEvent.remove(false);
    this.scene.start('MenuScene');
  }
}

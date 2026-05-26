import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig.js';
import StorageManager from '../managers/StorageManager.js';
import AudioManager from '../managers/AudioManager.js';

export default class Hud {
  constructor(scene, data) {
    this.scene = scene;
    this.data = data;
    this.graphics = scene.add.graphics().setDepth(100).setScrollFactor(0);

    this.playerLabel = scene.add.text(36, 42, 'LEO', {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0, 0.5).setDepth(101).setScrollFactor(0);

    this.bossLabel = scene.add.text(GAME_WIDTH - 335, 84, data.bossName.toUpperCase(), {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0, 0.5).setDepth(101).setScrollFactor(0);

    this.scoreText = scene.add.text(28, 78, 'Puntaje: 0', {
      fontFamily: 'Arial', fontSize: '22px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setDepth(101).setScrollFactor(0);

    this.levelText = scene.add.text(28, 106, `Nivel ${data.level}: ${data.bossName}`, {
      fontFamily: 'Arial', fontSize: '18px', color: '#d7ff5a', stroke: '#000000', strokeThickness: 4
    }).setDepth(101).setScrollFactor(0);

    this.tipText = scene.add.text(GAME_WIDTH / 2, 24, data.intro, {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0).setDepth(101).setScrollFactor(0);

    scene.time.delayedCall(4500, () => this.tipText.setVisible(false));

    this.fpsText = scene.add.text(GAME_WIDTH - 132, 510, 'FPS: --', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setDepth(101).setScrollFactor(0);

    this.pauseButton = scene.add.text(GAME_WIDTH - 74, 18, 'II', {
      fontFamily: 'Arial', fontSize: '28px', color: '#ffffff', backgroundColor: '#000000aa', padding: { x: 12, y: 6 }
    }).setInteractive({ useHandCursor: true }).setDepth(102).setScrollFactor(0);

    this.muteButton = scene.add.text(GAME_WIDTH - 134, 18, AudioManager.isMuted() ? 'MUTE' : 'SON', {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffffff', backgroundColor: '#000000aa', padding: { x: 10, y: 9 }
    }).setInteractive({ useHandCursor: true }).setDepth(102).setScrollFactor(0);

    this.pauseButton.on('pointerdown', () => scene.openPause());
    this.muteButton.on('pointerdown', () => {
      const muted = AudioManager.toggleMute();
      this.muteButton.setText(muted ? 'MUTE' : 'SON');
    });
  }

  update(playerHealth, playerMax, bossHealth, bossMax, score, vulnerable) {
    const playerRatio = Phaser.Math.Clamp(playerHealth / playerMax, 0, 1);
    const bossRatio = Phaser.Math.Clamp(bossHealth / bossMax, 0, 1);

    this.graphics.clear();
    this.drawBar(28, 28, 260, 28, playerRatio, 0x222222, 0x2cff4b);
    this.drawBar(GAME_WIDTH - 345, 72, 300, 24, bossRatio, 0x222222, 0xff5a2a);

    if (vulnerable) {
      this.graphics.lineStyle(3, 0xffff00, 1);
      this.graphics.strokeRoundedRect(GAME_WIDTH - 348, 69, 306, 30, 8);
    }

    this.scoreText.setText(`Puntaje: ${score}  |  Record: ${StorageManager.getHighScore()}`);
    this.fpsText.setText(`FPS: ${Math.round(this.scene.game.loop.actualFps)}`);
  }

  drawBar(x, y, w, h, ratio, bgColor, fillColor) {
    this.graphics.fillStyle(0x000000, 0.85);
    this.graphics.fillRoundedRect(x - 4, y - 4, w + 8, h + 8, 8);
    this.graphics.fillStyle(bgColor, 1);
    this.graphics.fillRoundedRect(x, y, w, h, 5);
    this.graphics.fillStyle(fillColor, 1);
    this.graphics.fillRoundedRect(x, y, w * ratio, h, 5);
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.graphics.strokeRoundedRect(x, y, w, h, 5);
  }
}

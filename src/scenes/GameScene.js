import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, PLAYER_CONFIG } from '../config/gameConfig.js';
import { BOSS_DATA } from '../data/bossData.js';
import Player from '../objects/Player.js';
import BossController from '../objects/BossController.js';
import Hud from '../ui/Hud.js';
import TouchControls from '../ui/TouchControls.js';
import StorageManager from '../managers/StorageManager.js';
import AudioManager from '../managers/AudioManager.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.gameFinished = false;
  }

  create() {
    AudioManager.initScene(this);
    AudioManager.playMusic(this);
    this.configBoss = BOSS_DATA[this.level];

    this.createArena();
    this.createInput();
    this.createGroups();

    // Leo siempre inicia al lado izquierdo. Es el unico personaje que camina.
    this.player = new Player(this, 130, GROUND_Y);
    this.physics.add.collider(this.player, this.platforms);

    // El jefe siempre aparece al lado derecho.
    this.boss = new BossController(this, this.configBoss, {
      enemyProjectiles: this.enemyProjectiles
    });

    this.physics.add.overlap(this.player, this.boss.sprite, () => this.boss.handleContactDamage(this.player));
    this.physics.add.overlap(this.player, this.enemyProjectiles, this.onPlayerHitByProjectile, null, this);

    this.touchControls = new TouchControls(this);
    this.hud = new Hud(this, {
      level: this.level,
      bossName: this.configBoss.name,
      intro: this.configBoss.intro
    });

    this.createLevelText();
  }

  createArena() {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg_jungle').setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.14);

    this.platforms = this.physics.add.staticGroup();

    // Suelo visual y colision alineados.
    // IMPORTANTE: la imagen platform_log.png fue recortada sin margen transparente.
    // Por eso, el borde superior visible del suelo coincide exactamente con GROUND_Y.
    this.groundVisual = this.add.image(GAME_WIDTH / 2, GROUND_Y + 88, 'platform_log')
      .setDisplaySize(1040, 176)
      .setDepth(9);

    // Colision invisible: su borde superior coincide con el borde superior visible del suelo.
    // Esto evita que Leo quede parado sobre un piso invisible y parezca que flota.
    this.groundCollider = this.add.rectangle(GAME_WIDTH / 2, GROUND_Y + 18, 980, 36, 0xffffff, 0);
    this.physics.add.existing(this.groundCollider, true);
    this.platforms.add(this.groundCollider);
  }

  addPlatform(x, y, scaleX, scaleY, isGround = false) {
    const platform = this.platforms.create(x, y, 'platform_log');
    platform.setScale(scaleX, scaleY).refreshBody();
    platform.setDepth(9);

    if (isGround) {
      platform.body.setSize(platform.width * scaleX * 0.95, 28);
      platform.body.setOffset(platform.width * (1 - scaleX) / 2, platform.height * scaleY * 0.24);
    }
    platform.refreshBody();
    return platform;
  }

  createLevelText() {
    const levelInfo = {
      1: 'Murk: sube y baja. Lanza 3 bolas de veneno cada 5 segundos.',
      2: 'Brakus: se queda quieto. Lanza fuego cada 5 segundos.',
      3: 'Dr. Mortis: dispara rayo cada 5 segundos y caen 3 rocas.'
    }[this.level];

    this.add.text(480, 505, levelInfo, {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(90);
  }

  createInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      j: Phaser.Input.Keyboard.KeyCodes.J,
      x: Phaser.Input.Keyboard.KeyCodes.X,
      p: Phaser.Input.Keyboard.KeyCodes.P
    });
  }

  createGroups() {
    this.enemyProjectiles = this.physics.add.group({ allowGravity: false });
    this.playerAttackGroup = this.physics.add.group({ allowGravity: false, immovable: true });
  }

  update() {
    if (this.gameFinished) return;

    const oneFrameButtons = this.touchControls.consumeOneFrameButtons();
    const touchState = {
      ...this.touchControls.state,
      jumpPressed: oneFrameButtons.jumpPressed
    };

    this.player.updateMovement(this.cursors, this.keys, touchState);

    const attackPressed = Phaser.Input.Keyboard.JustDown(this.keys.j)
      || Phaser.Input.Keyboard.JustDown(this.keys.x)
      || oneFrameButtons.attackPressed;
    if (attackPressed) {
      this.performPlayerAttack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.p)) {
      this.openPause();
    }

    this.boss.update();
    this.cleanupProjectiles();
    this.hud.update(
      this.player.health,
      this.player.maxHealth,
      this.boss.health,
      this.boss.maxHealth,
      this.score,
      this.boss.vulnerable
    );

    if (this.player.health <= 0) {
      this.onPlayerDefeated();
    }
  }

  performPlayerAttack() {
    if (!this.player.startAttack()) return;

    const dir = this.player.facing === 'left' ? -1 : 1;
    const hitboxX = this.player.x + dir * 62;
    const hitboxY = this.player.y - 95;

    const slash = this.add.sprite(hitboxX, hitboxY, 'slash_1')
      .setScale(dir, 1)
      .setDepth(35);
    slash.play('slash_anim');
    slash.on('animationcomplete', () => slash.destroy());

    const hitbox = this.add.rectangle(hitboxX, hitboxY, 112, 132, 0xffffff, 0);
    this.physics.add.existing(hitbox);
    hitbox.body.setAllowGravity(false);
    hitbox.body.setImmovable(true);

    this.physics.add.overlap(hitbox, this.boss.sprite, () => {
      if (this.boss.takeDamage(PLAYER_CONFIG.attackDamage)) {
        this.score += this.boss.vulnerable ? 150 : 50;
      }
      if (hitbox.active) hitbox.destroy();
    });

    this.time.delayedCall(150, () => {
      if (hitbox.active) hitbox.destroy();
    });
  }

  onPlayerHitByProjectile(player, projectile) {
    if (!projectile.active) return;
    const damage = projectile.damage || 10;
    player.takeDamage(damage);
    if (!projectile.texture.key.startsWith('fire') && projectile.texture.key !== 'laser') {
      projectile.destroy();
    }
  }

  cleanupProjectiles() {
    this.enemyProjectiles.getChildren().forEach((projectile) => {
      if (!projectile || !projectile.active) return;
      if (projectile.x < -180 || projectile.x > GAME_WIDTH + 180 || projectile.y > GAME_HEIGHT + 180 || projectile.y < -190) {
        projectile.destroy();
      }
    });
  }

  onBossDefeated() {
    if (this.gameFinished) return;
    this.gameFinished = true;
    this.score += this.level * 1000 + this.player.health * 5;
    StorageManager.saveHighScore(this.score);
    StorageManager.saveStageReached(Math.min(this.level + 1, 3));
    AudioManager.sfx(this.level === 3 ? 'win' : 'boss');

    this.time.delayedCall(900, () => {
      if (this.level >= 3) {
        this.scene.start('WinScene', { score: this.score });
      } else {
        this.scene.start('GameScene', { level: this.level + 1, score: this.score });
      }
    });
  }

  onPlayerDefeated() {
    if (this.gameFinished) return;
    this.gameFinished = true;
    StorageManager.saveHighScore(this.score);
    this.scene.start('GameOverScene', { score: this.score, level: this.level });
  }

  openPause() {
    if (this.gameFinished) return;
    this.scene.pause();
    this.scene.launch('PauseScene', { level: this.level, score: this.score });
  }
}

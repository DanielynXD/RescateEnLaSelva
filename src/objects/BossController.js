import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager.js';
import { GAME_WIDTH } from '../config/gameConfig.js';

export default class BossController {
  constructor(scene, config, groups) {
    this.scene = scene;
    this.config = config;
    this.groups = groups;
    this.health = config.health;
    this.maxHealth = config.health;
    this.vulnerable = true;
    this.isDead = false;
    this.contactCooldown = false;
    this.attackEvent = null;
    this.murkTween = null;

    this.sprite = scene.physics.add.sprite(config.x, config.y, config.spriteKey)
      .setOrigin(0.5, 1)
      .setScale(config.scale)
      .setDepth(20);

    this.sprite.body.setAllowGravity(false);
    this.sprite.setCollideWorldBounds(false);
    this.configureBody();

    if (config.idleAnim) {
      this.sprite.play(config.idleAnim);
    }

    if (config.pattern === 'venomStatic') {
      this.startMurkVerticalMovement();
    }

    this.startPattern();
  }

  configureBody() {
    if (!this.sprite?.body) return;
    const baseWidth = this.config.body?.width || this.sprite.width * 0.6;
    const baseHeight = this.config.body?.height || this.sprite.height * 0.6;
    const offsetY = this.config.body?.offsetY || this.sprite.height - baseHeight;
    this.sprite.body.setSize(baseWidth, baseHeight);
    this.sprite.body.setOffset((this.sprite.width - baseWidth) / 2, offsetY);
  }

  startPattern() {
    const firstAttackDelay = 1800;
    this.scene.time.delayedCall(firstAttackDelay, () => {
      if (this.isDead) return;
      this.executeCurrentPattern();
      this.attackEvent = this.scene.time.addEvent({
        delay: this.config.attackInterval || 5000,
        loop: true,
        callback: () => this.executeCurrentPattern()
      });
    });
  }

  executeCurrentPattern() {
    if (this.isDead) return;
    if (this.config.pattern === 'venomStatic') this.patternVenomStatic();
    if (this.config.pattern === 'fireStatic') this.patternFireStatic();
    if (this.config.pattern === 'laserStatic') this.patternLaserStatic();
  }

  startMurkVerticalMovement() {
    // Murk se queda en el lado derecho, solo sube y baja.
    this.murkTween = this.scene.tweens.add({
      targets: this.sprite,
      y: 350,
      duration: 1300,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }

  setTemporaryInvulnerable(duration = 1200) {
    this.vulnerable = false;
    this.scene.time.delayedCall(duration, () => {
      if (!this.isDead) this.vulnerable = true;
    });
  }

  patternVenomStatic() {
    this.setTemporaryInvulnerable(1050);
    this.sprite.play('murk_attack', true);
    this.scene.time.delayedCall(360, () => this.spawnThreeVenomBalls());
    this.scene.time.delayedCall(1050, () => {
      if (this.isDead) return;
      this.sprite.play('murk_fly', true);
    });
  }

  spawnThreeVenomBalls() {
    if (this.isDead || !this.scene.player?.active) return;
    AudioManager.sfx('boss');
    const targetX = this.scene.player.x;
    const targetY = this.scene.player.y - 95;
    const offsets = [-55, 0, 55];

    offsets.forEach((offset, index) => {
      const key = `venom_${(index % 3) + 1}`;
      const venom = this.groups.enemyProjectiles.create(this.sprite.x - 40, this.sprite.y - 85 + offset * 0.25, key);
      venom.setScale(0.72).setDepth(18);
      venom.body.setAllowGravity(false);
      venom.damage = 10;
      venom.body.setSize(55, 55);
      this.scene.physics.moveTo(venom, targetX, targetY + offset, 245);
      this.scene.tweens.add({ targets: venom, angle: 360, duration: 700, repeat: -1 });
    });
  }

  patternFireStatic() {
    this.setTemporaryInvulnerable(1400);
    this.sprite.setTexture('brakus_aim');
    this.configureBody();

    this.scene.tweens.add({
      targets: this.sprite,
      x: this.config.x + 8,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        if (!this.isDead) this.sprite.x = this.config.x;
      }
    });

    this.scene.time.delayedCall(620, () => this.spawnFireStream());
    this.scene.time.delayedCall(1500, () => {
      if (this.isDead) return;
      this.sprite.setTexture('brakus_rest');
      this.configureBody();
    });
  }

  spawnFireStream() {
    if (this.isDead) return;
    this.sprite.setTexture('brakus_shoot');
    this.configureBody();
    AudioManager.sfx('boss');

    // El fuego sale desde Brakus hacia la izquierda porque el jugador inicia a ese lado.
    const fire = this.groups.enemyProjectiles.create(this.sprite.x - 160, this.sprite.y - 88, 'fire_1');
    fire.setOrigin(1, 0.5);
    fire.setScale(0.74, 0.74);
    fire.body.setAllowGravity(false);
    fire.body.setSize(350, 78);
    fire.damage = 14;
    fire.setDepth(17);

    let frame = 1;
    const event = this.scene.time.addEvent({
      delay: 110,
      repeat: 7,
      callback: () => {
        if (!fire.active) return;
        frame = frame === 4 ? 1 : frame + 1;
        fire.setTexture(`fire_${frame}`);
      }
    });

    this.scene.time.delayedCall(1150, () => {
      event.remove(false);
      if (fire.active) fire.destroy();
    });
  }

  patternLaserStatic() {
    this.setTemporaryInvulnerable(1500);
    this.sprite.play('dr_aim', true);
    this.configureBody();

    const laserY = Phaser.Math.Clamp(this.scene.player.y - 92, 205, 430);
    const warning = this.scene.add.rectangle(455, laserY, 710, 12, 0x00ff66, 0.30).setDepth(16);
    this.scene.tweens.add({ targets: warning, alpha: 0.05, duration: 120, yoyo: true, repeat: 4 });

    this.scene.time.delayedCall(650, () => {
      if (warning.active) warning.destroy();
      this.spawnLaser(laserY);
      this.spawnThreeRocks();
    });

    this.scene.time.delayedCall(1550, () => {
      if (this.isDead) return;
      this.sprite.anims.stop();
      this.sprite.setTexture('dr_idle');
      this.configureBody();
    });
  }

  spawnLaser(y) {
    if (this.isDead) return;
    this.sprite.setTexture('dr_shoot');
    this.configureBody();

    // Rayo recto hacia la izquierda.
    const laser = this.groups.enemyProjectiles.create(455, y, 'laser');
    laser.setOrigin(0.5, 0.5).setScale(0.56, 0.30).setDepth(18);
    laser.body.setAllowGravity(false);
    laser.body.setSize(690, 38);
    laser.damage = 18;
    AudioManager.sfx('boss');

    this.scene.tweens.add({ targets: laser, alpha: 0.45, duration: 80, yoyo: true, repeat: 7 });
    this.scene.time.delayedCall(900, () => {
      if (laser.active) laser.destroy();
    });
  }

  spawnThreeRocks() {
    if (this.isDead) return;
    const baseX = Phaser.Math.Clamp(this.scene.player.x, 120, GAME_WIDTH - 190);
    const positions = [baseX - 95, baseX + 20, baseX + 135];
    positions.forEach((x, i) => {
      this.scene.time.delayedCall(i * 170, () => this.spawnRock(Phaser.Math.Clamp(x, 90, GAME_WIDTH - 120)));
    });
  }

  spawnRock(x) {
    if (this.isDead) return;
    const rock = this.groups.enemyProjectiles.create(x, -42, 'falling_rock');
    rock.setScale(0.62).setDepth(19);
    rock.body.setAllowGravity(true);
    rock.body.setGravityY(660);
    rock.setVelocityY(Phaser.Math.Between(140, 235));
    rock.setAngularVelocity(Phaser.Math.Between(-160, 160));
    rock.damage = 12;
    rock.body.setSize(70, 75);
  }

  takeDamage(amount) {
    if (this.isDead || !this.vulnerable) return false;
    this.health = Math.max(0, this.health - amount);
    this.sprite.setTint(0xffff66);
    AudioManager.sfx('hit');
    this.scene.time.delayedCall(120, () => {
      if (this.sprite?.active) this.sprite.clearTint();
    });

    if (this.health <= 0) {
      this.die();
    }
    return true;
  }

  die() {
    this.isDead = true;
    this.vulnerable = false;
    if (this.attackEvent) this.attackEvent.remove(false);
    if (this.murkTween) this.murkTween.stop();
    this.sprite.setVelocity(0, 0);
    this.sprite.body.enable = false;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      y: this.sprite.y - 40,
      duration: 700,
      onComplete: () => this.scene.onBossDefeated()
    });
  }

  handleContactDamage(player) {
    if (this.isDead || this.contactCooldown) return;
    this.contactCooldown = true;
    player.takeDamage(this.config.touchDamage);
    this.scene.time.delayedCall(750, () => {
      this.contactCooldown = false;
    });
  }

  update() {
    // Los jefes se quedan al lado derecho. Solo Murk se mueve verticalmente mediante tween.
  }
}

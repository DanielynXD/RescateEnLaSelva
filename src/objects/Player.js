import Phaser from 'phaser';
import { PLAYER_CONFIG, GROUND_Y } from '../config/gameConfig.js';
import AudioManager from '../managers/AudioManager.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'leo_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.health = PLAYER_CONFIG.health;
    this.maxHealth = PLAYER_CONFIG.health;
    this.facing = 'right';
    this.isAttacking = false;
    this.isHurt = false;
    this.canAttack = true;
    this.lastGroundY = GROUND_Y;
    this.jumpsUsed = 0;

    this.setOrigin(0.5, 1);
    this.setScale(0.62);
    this.setCollideWorldBounds(true);
    this.body.setGravityY(900);
    this.configureBody();
  }

  configureBody() {
    const bodyWidth = Math.min(this.width * 0.42, 95);
    const bodyHeight = Math.min(this.height * 0.78, 215);
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset((this.width - bodyWidth) / 2, this.height - bodyHeight);
  }

  resetForLevel(x, y) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.health = this.maxHealth;
    this.facing = 'right';
    this.isAttacking = false;
    this.isHurt = false;
    this.canAttack = true;
    this.jumpsUsed = 0;
    this.clearTint();
    this.setTexture('leo_idle');
    this.configureBody();
  }

  updateMovement(cursors, keys, touchState) {
    if (!this.active) return;

    const movingLeft = cursors.left.isDown || keys.a.isDown || touchState.left;
    const movingRight = cursors.right.isDown || keys.d.isDown || touchState.right;
    const wantsJump = Phaser.Input.Keyboard.JustDown(cursors.up)
      || Phaser.Input.Keyboard.JustDown(keys.w)
      || Phaser.Input.Keyboard.JustDown(keys.space)
      || touchState.jumpPressed;

    if (movingLeft) {
      this.setVelocityX(-PLAYER_CONFIG.speed);
      this.facing = 'left';
    } else if (movingRight) {
      this.setVelocityX(PLAYER_CONFIG.speed);
      this.facing = 'right';
    } else {
      this.setVelocityX(0);
    }

    const isOnGround = this.body.blocked.down || this.body.touching.down;

    if (isOnGround) {
      this.jumpsUsed = 0;
    }

    if (wantsJump && this.jumpsUsed < PLAYER_CONFIG.maxJumps) {
      this.setVelocityY(PLAYER_CONFIG.jumpVelocity);
      this.jumpsUsed++;
      AudioManager.sfx('jump');
    }

    if (!this.isAttacking && !this.isHurt) {
      this.updateVisualState(movingLeft, movingRight);
    }

    if (this.y > 620) {
      this.setPosition(120, this.lastGroundY);
      this.takeDamage(10);
    }
  }

  updateVisualState(movingLeft, movingRight) {
    if (!this.body.blocked.down) {
      this.anims.stop();
      this.setTexture('leo_jump');
      this.setFlipX(this.facing === 'left');
      this.configureBody();
      return;
    }

    if (movingLeft || movingRight) {
      // Se usa la misma animacion base y se voltea con flipX.
      // Esto evita que Leo parezca caminar de espaldas.
      this.play('leo_walk_right', true);
      this.setFlipX(this.facing === 'left');
    } else {
      this.anims.stop();
      this.setTexture('leo_idle');
      this.setFlipX(this.facing === 'left');
      this.configureBody();
    }
  }

  startAttack() {
    if (!this.canAttack || this.isAttacking || this.isHurt) return false;

    this.canAttack = false;
    this.isAttacking = true;
    this.setVelocityX(0);
    AudioManager.sfx('slash');

    this.setFlipX(this.facing === 'left');
    this.play('leo_attack_right', true);
    this.configureBody();

    this.scene.time.delayedCall(260, () => {
      this.isAttacking = false;
      this.anims.stop();
      this.setTexture('leo_idle');
      this.setFlipX(this.facing === 'left');
      this.configureBody();
    });

    this.scene.time.delayedCall(PLAYER_CONFIG.attackCooldown, () => {
      this.canAttack = true;
    });

    return true;
  }

  takeDamage(amount) {
    if (this.isHurt || this.health <= 0) return false;

    this.health = Math.max(0, this.health - amount);
    this.isHurt = true;
    this.anims.stop();
    this.setFlipX(this.facing === 'left');
    this.setTexture('leo_hurt');
    this.configureBody();
    this.setTint(0xff5555);
    this.setVelocityX(this.facing === 'left' ? 170 : -170);
    AudioManager.sfx('damage');

    this.scene.tweens.add({
      targets: this,
      alpha: 0.35,
      duration: 90,
      yoyo: true,
      repeat: 5
    });

    this.scene.time.delayedCall(PLAYER_CONFIG.invulnerableTime, () => {
      this.isHurt = false;
      this.alpha = 1;
      this.clearTint();
    });

    return true;
  }
}

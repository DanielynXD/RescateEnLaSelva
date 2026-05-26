import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'Cargando assets...', {
      fontFamily: 'Arial', fontSize: '28px', color: '#ffffff'
    }).setOrigin(0.5);

    this.load.image('bg_jungle', 'assets/fondos/bg_jungle.png');
    this.load.image('game_over_bg', 'assets/fondos/game_over.png');
    this.load.image('win_bg', 'assets/fondos/win.png');
    for (let i = 1; i <= 4; i++) {
      this.load.image(`historia_${i}`, `assets/fondos/historia_${i}.png`);
    }
    this.load.image('platform_log', 'assets/fondos/suelo_alineado.png');

    this.load.audio('sfx_slash', 'assets/audio/slash.wav');
    this.load.audio('sfx_hit', 'assets/audio/hit.wav');
    this.load.audio('sfx_damage', 'assets/audio/damage.wav');
    this.load.audio('sfx_boss', 'assets/audio/boss_attack.wav');
    this.load.audio('sfx_win', 'assets/audio/win.wav');
    this.load.audio('sfx_menu', 'assets/audio/menu_click.wav');
    this.load.audio('sfx_jump', 'assets/audio/jump.wav');
    this.load.audio('music_jungle', 'assets/audio/jungle_ambient.wav');

    this.load.image('leo_idle', 'assets/leo/leo_idle.png');
    this.load.image('leo_idle_left', 'assets/leo/leo_idle_left.png');
    this.load.image('leo_jump', 'assets/leo/leo_jump.png');
    this.load.image('leo_hurt', 'assets/leo/leo_hurt.png');
    for (let i = 1; i <= 3; i++) {
      this.load.image(`leo_walk_${i}`, `assets/leo/leo_walk_${i}.png`);
      this.load.image(`leo_walk_left_${i}`, `assets/leo/leo_walk_left_${i}.png`);
      this.load.image(`slash_${i}`, `assets/leo/slash_${i}.png`);
    }
    for (let i = 1; i <= 4; i++) {
      this.load.image(`leo_attack_${i}`, `assets/leo/leo_attack_${i}.png`);
    }

    this.load.image('murk_rest', 'assets/murk/murk_rest.png');
    this.load.image('murk_aim', 'assets/murk/murk_aim.png');
    this.load.image('murk_shoot', 'assets/murk/murk_shoot.png');
    for (let i = 1; i <= 7; i++) {
      this.load.image(`murk_fly_${i}`, `assets/murk/murk_fly_${i}.png`);
    }
    for (let i = 1; i <= 3; i++) {
      this.load.image(`venom_${i}`, `assets/murk/venom_${i}.png`);
    }

    this.load.image('brakus_aim', 'assets/brakus/brakus_aim.png');
    this.load.image('brakus_rest', 'assets/brakus/brakus_rest.png');
    this.load.image('brakus_shoot', 'assets/brakus/brakus_shoot.png');
    for (let i = 1; i <= 4; i++) {
      this.load.image(`fire_${i}`, `assets/brakus/fire_${i}.png`);
    }

    this.load.image('dr_idle', 'assets/dr_mortis/dr_idle.png');
    this.load.image('dr_laugh', 'assets/dr_mortis/dr_laugh.png');
    this.load.image('dr_no_charge', 'assets/dr_mortis/dr_no_charge.png');
    this.load.image('dr_shoot', 'assets/dr_mortis/dr_shoot.png');
    for (let i = 1; i <= 4; i++) {
      this.load.image(`dr_aim_${i}`, `assets/dr_mortis/dr_aim_${i}.png`);
    }
    this.load.image('laser', 'assets/dr_mortis/laser.png');
    this.load.image('falling_rock', 'assets/dr_mortis/falling_rock.png');
  }

  create() {
    this.createAnimations();
    this.scene.start('StoryScene', { fromStart: true });
  }

  createAnimations() {
    this.anims.create({
      key: 'leo_walk_right',
      frames: [{ key: 'leo_walk_1' }, { key: 'leo_walk_2' }, { key: 'leo_walk_3' }, { key: 'leo_walk_2' }],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'leo_walk_left',
      frames: [{ key: 'leo_walk_left_1' }, { key: 'leo_walk_left_2' }, { key: 'leo_walk_left_3' }, { key: 'leo_walk_left_2' }],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'leo_attack_right',
      frames: [{ key: 'leo_attack_1' }, { key: 'leo_attack_2' }, { key: 'leo_attack_3' }, { key: 'leo_attack_4' }],
      frameRate: 14,
      repeat: 0
    });
    this.anims.create({
      key: 'slash_anim',
      frames: [{ key: 'slash_1' }, { key: 'slash_2' }, { key: 'slash_3' }],
      frameRate: 16,
      repeat: 0
    });
    this.anims.create({
      key: 'murk_fly',
      frames: [1, 2, 3, 4, 5, 6, 7].map((i) => ({ key: `murk_fly_${i}` })),
      frameRate: 9,
      repeat: -1
    });
    this.anims.create({
      key: 'murk_attack',
      frames: [{ key: 'murk_aim' }, { key: 'murk_shoot' }, { key: 'murk_aim' }],
      frameRate: 5,
      repeat: 1
    });
    this.anims.create({
      key: 'dr_aim',
      frames: [1, 2, 3, 4].map((i) => ({ key: `dr_aim_${i}` })),
      frameRate: 6,
      repeat: 1
    });
  }
}

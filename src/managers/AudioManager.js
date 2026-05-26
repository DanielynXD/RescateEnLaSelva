import StorageManager from './StorageManager.js';

// Manager de audio: usa archivos WAV cargados por Phaser.
// Si por alguna razon el navegador bloquea audio, el juego sigue funcionando sin romperse.
export default class AudioManager {
  static scene = null;
  static music = null;
  static muted = StorageManager.isMuted();

  static initScene(scene) {
    this.scene = scene;
    try {
      if (scene?.sound?.locked) {
        scene.sound.once('unlocked', () => this.playMusic(scene));
      }
    } catch (error) {
      console.warn('Audio no inicializado todavia:', error);
    }
  }

  static init(scene = null) {
    if (scene) this.initScene(scene);
  }

  static playMusic(scene = null) {
    if (scene) this.initScene(scene);
    if (!this.scene || this.muted) return;

    try {
      if (this.music && this.music.isPlaying) return;

      this.music = this.scene.sound.add('music_jungle', {
        loop: true,
        volume: 0.13
      });
      this.music.play();
    } catch (error) {
      console.warn('No se pudo reproducir la musica:', error);
    }
  }

  static stopMusic() {
    try {
      if (this.music) {
        this.music.stop();
        this.music.destroy();
        this.music = null;
      }
    } catch (error) {
      console.warn('No se pudo detener la musica:', error);
    }
  }

  static toggleMute() {
    this.muted = !this.muted;
    StorageManager.setMuted(this.muted);

    if (this.muted) {
      this.stopMusic();
    } else {
      this.playMusic();
      this.sfx('menu');
    }

    return this.muted;
  }

  static isMuted() {
    return this.muted;
  }

  static sfx(type = 'hit') {
    if (this.muted || !this.scene?.sound) return;

    const keyByType = {
      slash: 'sfx_slash',
      hit: 'sfx_hit',
      damage: 'sfx_damage',
      boss: 'sfx_boss',
      win: 'sfx_win',
      menu: 'sfx_menu',
      jump: 'sfx_jump'
    };

    const volumeByType = {
      slash: 0.33,
      hit: 0.28,
      damage: 0.28,
      boss: 0.22,
      win: 0.36,
      menu: 0.25,
      jump: 0.20
    };

    const soundKey = keyByType[type] || 'sfx_hit';

    try {
      this.scene.sound.play(soundKey, {
        volume: volumeByType[type] ?? 0.25
      });
    } catch (error) {
      console.warn('No se pudo reproducir efecto:', type, error);
    }
  }
}

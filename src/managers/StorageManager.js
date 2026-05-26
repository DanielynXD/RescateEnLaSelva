const PREFIX = 'rescate_selva_';

export default class StorageManager {
  static getNumber(key, fallback = 0) {
    const value = Number(localStorage.getItem(PREFIX + key));
    return Number.isFinite(value) ? value : fallback;
  }

  static setNumber(key, value) {
    localStorage.setItem(PREFIX + key, String(value));
  }

  static getBoolean(key, fallback = false) {
    const value = localStorage.getItem(PREFIX + key);
    if (value === null) return fallback;
    return value === 'true';
  }

  static setBoolean(key, value) {
    localStorage.setItem(PREFIX + key, String(Boolean(value)));
  }

  static getHighScore() {
    return this.getNumber('high_score', 0);
  }

  static saveHighScore(score) {
    if (score > this.getHighScore()) {
      this.setNumber('high_score', score);
    }
  }

  static getStageReached() {
    return this.getNumber('stage_reached', 1);
  }

  static saveStageReached(level) {
    if (level > this.getStageReached()) {
      this.setNumber('stage_reached', level);
    }
  }

  static isMuted() {
    return this.getBoolean('muted', false);
  }

  static setMuted(value) {
    this.setBoolean('muted', value);
  }
}

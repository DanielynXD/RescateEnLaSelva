export default class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.state = {
      left: false,
      right: false,
      jumpPressed: false,
      attackPressed: false
    };
    this.createButton(40, 446, '◀', 'left');
    this.createButton(120, 446, '▶', 'right');
    this.createButton(760, 446, '▲', 'jump');
    this.createButton(845, 446, '⚔', 'attack');
  }

  createButton(x, y, label, action) {
    const rect = this.scene.add.rectangle(x, y, 66, 62, 0x000000, 0.35)
      .setStrokeStyle(2, 0xffffff, 0.6)
      .setDepth(120)
      .setScrollFactor(0)
      .setInteractive();

    const txt = this.scene.add.text(x, y, label, {
      fontFamily: 'Arial', fontSize: '32px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(121).setScrollFactor(0);

    const press = () => {
      if (action === 'left') this.state.left = true;
      if (action === 'right') this.state.right = true;
      if (action === 'jump') this.state.jumpPressed = true;
      if (action === 'attack') this.state.attackPressed = true;
      rect.setFillStyle(0x2f8cff, 0.45);
    };
    const release = () => {
      if (action === 'left') this.state.left = false;
      if (action === 'right') this.state.right = false;
      rect.setFillStyle(0x000000, 0.35);
    };

    rect.on('pointerdown', press);
    rect.on('pointerup', release);
    rect.on('pointerout', release);
    txt.on('pointerdown', press);
  }

  consumeOneFrameButtons() {
    const pressed = {
      jumpPressed: this.state.jumpPressed,
      attackPressed: this.state.attackPressed
    };
    this.state.jumpPressed = false;
    this.state.attackPressed = false;
    return pressed;
  }
}

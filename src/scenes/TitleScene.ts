import Phaser from 'phaser';
import { COLORS, FONTS } from '../theme';

/**
 * M0 — one scene, one background panel, title text, a start button.
 */
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.indigo, COLORS.indigo, COLORS.night, COLORS.night, 1);
    bg.fillRect(0, 0, width, height);

    // Placeholder sun disc behind the title until real key art exists.
    const sun = this.add.circle(width / 2, height * 0.34, 190, COLORS.saffronDark, 0.18);
    this.tweens.add({
      targets: sun,
      scale: 1.06,
      alpha: 0.8,
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const title = this.add
      .text(width / 2, height * 0.32, 'MYTHIC INDIA', {
        fontFamily: FONTS.display,
        fontSize: '88px',
        color: '#f3e9d2',
        letterSpacing: 10,
      })
      .setOrigin(0.5)
      .setShadow(0, 4, '#000000', 12, false, true);

    this.add
      .text(width / 2, height * 0.32 + 68, 'an episodic journey through living myth', {
        fontFamily: FONTS.body,
        fontSize: '24px',
        fontStyle: 'italic',
        color: '#b8a988',
      })
      .setOrigin(0.5);

    this.createStartButton(width / 2, height * 0.68);

    // Gentle title breathing — cheap "juice" while there is no art.
    this.tweens.add({
      targets: title,
      y: title.y - 6,
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  private createStartButton(x: number, y: number): void {
    const w = 260;
    const h = 64;

    const g = this.add.graphics();
    const draw = (fill: number) => {
      g.clear();
      g.fillStyle(fill, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 14);
      g.lineStyle(2, COLORS.saffron, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 14);
    };
    draw(COLORS.panel);

    const label = this.add
      .text(0, 0, 'BEGIN', {
        fontFamily: FONTS.display,
        fontSize: '28px',
        color: '#e8a13d',
        letterSpacing: 6,
      })
      .setOrigin(0.5);

    const button = this.add.container(x, y, [g, label]);
    button.setSize(w, h);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      draw(COLORS.indigoLight);
      this.tweens.add({ targets: button, scale: 1.05, duration: 120 });
    });
    button.on('pointerout', () => {
      draw(COLORS.panel);
      this.tweens.add({ targets: button, scale: 1, duration: 120 });
    });
    button.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('StoryScene');
      });
    });
  }
}

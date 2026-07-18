import Phaser from 'phaser';
import { COLORS, FONTS } from '../theme';

const CHOICE_HEIGHT = 52;
const CHOICE_GAP = 12;

/**
 * M2 — shows ink choices as buttons above the dialogue box; resolves
 * with the index of the choice the player picks.
 */
export function showChoices(scene: Phaser.Scene, choices: string[]): Promise<number> {
  return new Promise((resolve) => {
    const { width, height } = scene.scale;
    const boxWidth = Math.min(720, width - 120);
    const totalHeight = choices.length * (CHOICE_HEIGHT + CHOICE_GAP);
    const startY = height - 240 - totalHeight;
    const buttons: Phaser.GameObjects.Container[] = [];

    choices.forEach((text, i) => {
      const y = startY + i * (CHOICE_HEIGHT + CHOICE_GAP);

      const g = scene.add.graphics();
      const draw = (fill: number, border: number) => {
        g.clear();
        g.fillStyle(fill, 0.96);
        g.fillRoundedRect(-boxWidth / 2, -CHOICE_HEIGHT / 2, boxWidth, CHOICE_HEIGHT, 10);
        g.lineStyle(2, border, 1);
        g.strokeRoundedRect(-boxWidth / 2, -CHOICE_HEIGHT / 2, boxWidth, CHOICE_HEIGHT, 10);
      };
      draw(COLORS.indigo, COLORS.panelBorder);

      const label = scene.add
        .text(0, 0, text, {
          fontFamily: FONTS.body,
          fontSize: '21px',
          color: '#f3e9d2',
        })
        .setOrigin(0.5);

      const button = scene.add.container(width / 2, y, [g, label]);
      button.setSize(boxWidth, CHOICE_HEIGHT);
      button.setInteractive({ useHandCursor: true });
      button.setAlpha(0);
      buttons.push(button);

      scene.tweens.add({
        targets: button,
        alpha: 1,
        y: y - 4,
        duration: 200,
        delay: i * 70,
        ease: 'Quad.easeOut',
      });

      button.on('pointerover', () => draw(COLORS.indigoLight, COLORS.saffron));
      button.on('pointerout', () => draw(COLORS.indigo, COLORS.panelBorder));
      button.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        void pointer;
        // Keep this tap from also hitting the dialogue box advance handler.
        event.stopPropagation();
        buttons.forEach((b) => b.destroy());
        resolve(i);
      });
    });
  });
}

import Phaser from 'phaser';
import { COLORS, FONTS } from '../theme';

const BOX_HEIGHT = 190;
const MARGIN = 24;
const PORTRAIT_SIZE = 120;
const TYPE_DELAY_MS = 18;

// Placeholder portrait colors per speaker until real art exists.
const PORTRAIT_COLORS: Record<string, number> = {
  You: COLORS.teal,
  Ferryman: COLORS.saffronDark,
};

/**
 * M1 — dialogue box: typewriter text, character name plate, portrait,
 * tap-to-advance (tap once to complete the line, again to advance).
 */
export class DialogueBox extends Phaser.GameObjects.Container {
  private nameText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private namePlate: Phaser.GameObjects.Graphics;
  private portrait: Phaser.GameObjects.Image;
  private advanceHint: Phaser.GameObjects.Text;

  private typing = false;
  private fullLine = '';
  private typeTimer?: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene) {
    const { width, height } = scene.scale;
    super(scene, 0, height - BOX_HEIGHT - MARGIN);
    scene.add.existing(this);

    const boxWidth = width - MARGIN * 2;
    const panel = scene.add.graphics();
    panel.fillStyle(COLORS.panel, 0.94);
    panel.fillRoundedRect(MARGIN, 0, boxWidth, BOX_HEIGHT, 16);
    panel.lineStyle(2, COLORS.panelBorder, 1);
    panel.strokeRoundedRect(MARGIN, 0, boxWidth, BOX_HEIGHT, 16);
    this.add(panel);

    this.portrait = scene.add
      .image(MARGIN + 20 + PORTRAIT_SIZE / 2, BOX_HEIGHT / 2, '')
      .setVisible(false);
    this.add(this.portrait);

    this.namePlate = scene.add.graphics();
    this.add(this.namePlate);

    this.nameText = scene.add
      .text(MARGIN + 24, -16, '', {
        fontFamily: FONTS.display,
        fontSize: '22px',
        color: '#f3e9d2',
      })
      .setOrigin(0, 0.5);
    this.add(this.nameText);

    this.bodyText = scene.add.text(0, 28, '', {
      fontFamily: FONTS.body,
      fontSize: '24px',
      color: '#f3e9d2',
      lineSpacing: 8,
    });
    this.add(this.bodyText);

    this.advanceHint = scene.add
      .text(width - MARGIN - 28, BOX_HEIGHT - 24, '▼', {
        fontFamily: FONTS.ui,
        fontSize: '18px',
        color: '#e8a13d',
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.add(this.advanceHint);
    scene.tweens.add({
      targets: this.advanceHint,
      y: this.advanceHint.y + 6,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Shows one line with a typewriter effect. Resolves when the player
   * advances past it. `speaker` of null means narration (no plate/portrait).
   */
  say(speaker: string | null, text: string): Promise<void> {
    return new Promise((resolve) => {
      this.layoutSpeaker(speaker);
      this.fullLine = text;
      this.bodyText.setText('');
      this.advanceHint.setVisible(false);
      this.typing = true;

      let shown = 0;
      this.typeTimer = this.scene.time.addEvent({
        delay: TYPE_DELAY_MS,
        repeat: text.length - 1,
        callback: () => {
          shown += 1;
          this.bodyText.setText(this.fullLine.slice(0, shown));
          if (shown >= this.fullLine.length) this.finishTyping();
        },
      });

      const onTap = () => {
        if (this.typing) {
          this.finishTyping();
        } else {
          this.scene.input.off('pointerdown', onTap);
          this.scene.input.keyboard?.off('keydown-SPACE', onTap);
          resolve();
        }
      };
      this.scene.input.on('pointerdown', onTap);
      this.scene.input.keyboard?.on('keydown-SPACE', onTap);
    });
  }

  private finishTyping(): void {
    this.typeTimer?.remove();
    this.typing = false;
    this.bodyText.setText(this.fullLine);
    this.advanceHint.setVisible(true);
  }

  private layoutSpeaker(speaker: string | null): void {
    const { width } = this.scene.scale;
    this.namePlate.clear();

    if (speaker) {
      this.portrait.setTexture(portraitTexture(this.scene, speaker)).setVisible(true);
      this.nameText.setText(speaker).setVisible(true);
      const plateWidth = this.nameText.width + 36;
      this.namePlate.fillStyle(COLORS.indigoLight, 1);
      this.namePlate.fillRoundedRect(MARGIN + 6, -32, plateWidth, 32, 8);
      this.namePlate.lineStyle(2, COLORS.panelBorder, 1);
      this.namePlate.strokeRoundedRect(MARGIN + 6, -32, plateWidth, 32, 8);

      const textX = MARGIN + 20 + PORTRAIT_SIZE + 24;
      this.bodyText.setPosition(textX, 28);
      this.bodyText.setStyle({ fontStyle: 'normal', color: '#f3e9d2' });
      this.bodyText.setWordWrapWidth(width - textX - MARGIN - 40);
    } else {
      this.portrait.setVisible(false);
      this.nameText.setVisible(false);
      const textX = MARGIN + 32;
      this.bodyText.setPosition(textX, 32);
      this.bodyText.setStyle({ fontStyle: 'italic', color: '#c9bda0' });
      this.bodyText.setWordWrapWidth(width - textX - MARGIN - 40);
    }
  }
}

/** Generates (once) and returns a placeholder portrait texture for a speaker. */
function portraitTexture(scene: Phaser.Scene, speaker: string): string {
  const key = `portrait-${speaker}`;
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    const color = PORTRAIT_COLORS[speaker] ?? COLORS.indigoLight;
    g.fillStyle(COLORS.night, 1);
    g.fillRoundedRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE, 12);
    g.fillStyle(color, 1);
    g.fillCircle(PORTRAIT_SIZE / 2, PORTRAIT_SIZE / 2, PORTRAIT_SIZE / 2 - 10);
    g.lineStyle(3, COLORS.panelBorder, 1);
    g.strokeRoundedRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE, 12);
    g.generateTexture(key, PORTRAIT_SIZE, PORTRAIT_SIZE);
    g.destroy();

    // Stamp the speaker's initial onto the generated texture.
    const rt = scene.make.renderTexture({ width: PORTRAIT_SIZE, height: PORTRAIT_SIZE }, false);
    const img = scene.make.image({ x: PORTRAIT_SIZE / 2, y: PORTRAIT_SIZE / 2, key }, false);
    const initial = scene.make.text(
      {
        x: PORTRAIT_SIZE / 2,
        y: PORTRAIT_SIZE / 2,
        text: speaker[0]?.toUpperCase() ?? '?',
        style: { fontFamily: FONTS.display, fontSize: '56px', color: '#f3e9d2' },
      },
      false,
    );
    initial.setOrigin(0.5);
    rt.draw(img).draw(initial);
    scene.textures.remove(key);
    rt.saveTexture(key);
    img.destroy();
    initial.destroy();
    rt.destroy();
  }
  return key;
}

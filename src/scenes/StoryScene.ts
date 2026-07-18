import Phaser from 'phaser';
import { Story } from 'inkjs';
import storyJson from '../story/test-conversation.ink';
import { DialogueBox } from '../ui/DialogueBox';
import { showChoices } from '../ui/ChoiceList';
import { COLORS, FONTS } from '../theme';

/**
 * M2 — plays an ink story through the M1 dialogue box: lines advance on
 * tap, choices appear as buttons, branches re-converge per the script.
 */
export class StoryScene extends Phaser.Scene {
  private dialogue!: DialogueBox;
  private story!: Story;

  constructor() {
    super('StoryScene');
  }

  create(): void {
    const { width, height } = this.scale;

    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.night, COLORS.night, 0x0e1a22, 0x0e1a22, 1);
    bg.fillRect(0, 0, width, height);

    // Placeholder scene art: a moon and a water line until real panels exist.
    this.add.circle(width * 0.78, height * 0.22, 70, COLORS.cream, 0.12);
    const water = this.add.graphics();
    water.lineStyle(2, COLORS.teal, 0.25);
    for (let i = 0; i < 5; i++) {
      water.lineBetween(0, height * 0.62 + i * 26, width, height * 0.62 + i * 26);
    }

    this.dialogue = new DialogueBox(this);
    this.story = new Story(storyJson);

    this.cameras.main.fadeIn(500, 0, 0, 0);
    void this.runStory();
  }

  private async runStory(): Promise<void> {
    while (true) {
      while (this.story.canContinue) {
        const raw = (this.story.Continue() ?? '').trim();
        if (!raw) continue;
        const { speaker, text } = parseSpeaker(raw);
        await this.dialogue.say(speaker, text);
      }
      const choices = this.story.currentChoices;
      if (choices.length === 0) break;
      const picked = await showChoices(
        this,
        choices.map((c) => c.text),
      );
      this.story.ChooseChoiceIndex(picked);
    }
    this.showEnd();
  }

  private showEnd(): void {
    const { width, height } = this.scale;
    const label = this.add
      .text(width / 2, height * 0.42, '— end of test conversation —', {
        fontFamily: FONTS.body,
        fontSize: '26px',
        fontStyle: 'italic',
        color: '#c9bda0',
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: label, alpha: 1, duration: 600 });

    const back = this.add
      .text(width / 2, height * 0.52, 'back to title', {
        fontFamily: FONTS.ui,
        fontSize: '20px',
        color: '#e8a13d',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('TitleScene'));
  }
}

/** Splits the ink convention "Name: line" into speaker + text. */
function parseSpeaker(raw: string): { speaker: string | null; text: string } {
  const match = raw.match(/^([A-Z][\w ]{0,24}):\s+(.*)$/);
  if (match) return { speaker: match[1], text: match[2] };
  return { speaker: null, text: raw };
}

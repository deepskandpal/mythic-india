import Phaser from 'phaser'

// The opening beat of Episode 1, told as timed narration panels.
// LEARN: this is a tiny state machine — the scene is always in one of three
// states (typing a line / waiting for a tap / finished) and a tap means
// something different in each. Almost all narrative-game code is this pattern.
// In milestone M2 these hardcoded lines move into an ink script file.
const LINES = [
  'Rajasthan. 43 degrees. Day 62 of the dig.',
  'Two months of brushing dust off pottery shards.\nThis morning, the radar showed something else.',
  'Twelve metres down. Metal. Untarnished.\nOlder than anything metal has a right to be.',
  'The trench is quiet. Everyone else is at lunch.',
  'You reach down and touch it —'
]

export class ArrivalScene extends Phaser.Scene {
  private lineIndex = 0
  private charIndex = 0
  private typing = false
  private text!: Phaser.GameObjects.Text
  private hint!: Phaser.GameObjects.Text
  private typeTimer?: Phaser.Time.TimerEvent

  constructor() {
    super('arrival')
  }

  create() {
    const { width: W, height: H } = this.scale
    this.lineIndex = 0

    this.cameras.main.fadeIn(600, 0, 0, 0)

    this.text = this.add.text(W / 2, H / 2, '', {
      fontFamily: 'Georgia, serif',
      fontSize: '34px',
      color: '#e8dcc0',
      align: 'center',
      lineSpacing: 14,
      wordWrap: { width: W * 0.72 }
    }).setOrigin(0.5)

    this.hint = this.add.text(W / 2, H * 0.88, '· touch to continue ·', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#7a6a4a'
    }).setOrigin(0.5).setAlpha(0)

    this.input.on('pointerdown', () => this.advance())
    this.startLine()
  }

  private startLine() {
    this.charIndex = 0
    this.typing = true
    this.text.setText('')
    this.hint.setAlpha(0)

    const line = LINES[this.lineIndex]
    // LEARN: a repeating timer adds one character per tick = typewriter effect.
    this.typeTimer = this.time.addEvent({
      delay: 38,
      repeat: line.length - 1,
      callback: () => {
        this.charIndex++
        this.text.setText(line.slice(0, this.charIndex))
        if (this.charIndex === line.length) this.finishLine()
      }
    })
  }

  private finishLine() {
    this.typing = false
    this.tweens.add({ targets: this.hint, alpha: 1, duration: 400 })
  }

  private advance() {
    if (this.typing) {
      // First tap while typing: skip ahead, show the whole line instantly.
      this.typeTimer?.remove()
      this.text.setText(LINES[this.lineIndex])
      this.finishLine()
      return
    }
    this.lineIndex++
    if (this.lineIndex < LINES.length) {
      this.startLine()
    } else {
      this.theTouch()
    }
  }

  // The artifact moment: flash, shake, silence, title card.
  private theTouch() {
    this.input.removeAllListeners()
    this.text.setText('')
    this.hint.setAlpha(0)

    this.cameras.main.flash(180, 255, 255, 255)
    this.cameras.main.shake(900, 0.012)

    this.time.delayedCall(1300, () => {
      this.cameras.main.fadeOut(400, 255, 250, 240)
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.cameras.main.fadeIn(1200, 0, 0, 0)

        const { width: W, height: H } = this.scale
        this.add.text(W / 2, H * 0.44, 'MYTHIC INDIA', {
          fontFamily: 'Georgia, serif',
          fontSize: '64px',
          color: '#e8c87a',
          letterSpacing: 10
        }).setOrigin(0.5)

        this.add.text(W / 2, H * 0.56, 'end of first cut — the dice game awaits', {
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          fontStyle: 'italic',
          color: '#8a7a5a'
        }).setOrigin(0.5)

        this.time.delayedCall(600, () => {
          this.input.once('pointerdown', () => this.scene.start('title'))
        })
      })
    })
  }
}

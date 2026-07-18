import Phaser from 'phaser'

// LEARN: every Scene has a lifecycle — preload() loads assets,
// create() builds the screen once, update() runs every frame.
// This scene uses no image files at all: backgrounds and particles
// are generated in code (that changes once the Leonardo art pipeline kicks in).
export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title')
  }

  create() {
    const { width: W, height: H } = this.scale

    // Night-sky gradient, painted with the Graphics object (a code paintbrush)
    const g = this.add.graphics()
    g.fillGradientStyle(0x0a0806, 0x0a0806, 0x2a1608, 0x1a0e14, 1)
    g.fillRect(0, 0, W, H)

    // A low "horizon glow" — the dig site at dusk
    const glow = this.add.graphics()
    glow.fillGradientStyle(0x000000, 0x000000, 0xc2571a, 0xc2571a, 0, 0, 0.35, 0.35)
    glow.fillRect(0, H * 0.72, W, H * 0.28)

    // LEARN: generateTexture() turns drawn graphics into a reusable texture —
    // here, a 4px dot that the particle system will spawn hundreds of times.
    const dot = this.make.graphics({ x: 0, y: 0 }, false)
    dot.fillStyle(0xffd9a0, 1)
    dot.fillCircle(2, 2, 2)
    dot.generateTexture('dust', 4, 4)
    dot.destroy()

    // Drifting embers/dust — cheap "juice" that makes a static screen feel alive
    this.add.particles(0, 0, 'dust', {
      x: { min: 0, max: W },
      y: H + 10,
      lifespan: 9000,
      speedY: { min: -30, max: -80 },
      speedX: { min: -12, max: 12 },
      scale: { start: 0.9, end: 0 },
      alpha: { start: 0.55, end: 0 },
      quantity: 1,
      frequency: 220
    })

    this.add.text(W / 2, H * 0.34, 'MYTHIC INDIA', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '92px',
      color: '#e8c87a',
      letterSpacing: 14
    }).setOrigin(0.5).setShadow(0, 4, '#000000', 12)

    this.add.text(W / 2, H * 0.47, 'Episode One — The Arrival', {
      fontFamily: 'Georgia, serif',
      fontSize: '30px',
      fontStyle: 'italic',
      color: '#b89a6a'
    }).setOrigin(0.5)

    const begin = this.add.text(W / 2, H * 0.68, 'Touch to begin', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#f0e3c8'
    }).setOrigin(0.5)

    // LEARN: a tween animates any property over time — the whole
    // "motion comic" presentation is built out of tweens like this one.
    this.tweens.add({
      targets: begin,
      alpha: 0.25,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })

    // Bottom-right corner: door to the gameplay prototypes
    const lab = this.add.text(W - 28, H - 26, 'gameplay lab →', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#c2913a'
    }).setOrigin(1, 1).setInteractive({ useHandCursor: true })

    // One tap anywhere (except the lab corner): fade out, start the story
    const startStory = (p: Phaser.Input.Pointer) => {
      if (p.x > W - 260 && p.y > H - 70) return // that tap was for the lab button
      this.input.off('pointerdown', startStory)
      this.cameras.main.fadeOut(700, 0, 0, 0)
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('arrival'))
    }
    this.input.on('pointerdown', startStory)

    lab.on('pointerdown', () => {
      this.input.off('pointerdown', startStory)
      this.scene.start('labhub')
    })
  }
}

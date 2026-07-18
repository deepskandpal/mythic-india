import Phaser from 'phaser'
import { addHud, bigMessage } from './common'

// Uncharted-feel (2D): gravity, jumping, a gap that can kill you,
// a shard glinting at the top of the ruin.
// LEARN: platformer feel is 90% tuning three numbers —
// gravity, run speed, jump impulse. Play with them in this file.
const GRAVITY = 1500
const RUN = 240
const JUMP = -640

const PLATFORMS: Array<[number, number, number]> = [ // x, y, width
  [280, 700, 560], [970, 700, 620],                  // ground, with a pit between
  [230, 560, 220], [470, 460, 180], [720, 380, 180],
  [960, 300, 180], [1150, 235, 150]
]

export class TraverseModule extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private holdLeft = false
  private holdRight = false
  private won = false

  constructor() {
    super('lab-traverse')
  }

  create() {
    this.won = false
    this.holdLeft = this.holdRight = false
    this.input.addPointer(2) // two thumbs: run AND jump at the same time

    const { width: W, height: H } = this.scale
    const bg = this.add.graphics()
    bg.fillGradientStyle(0x141018, 0x141018, 0x2a1a0e, 0x2a1a0e, 1)
    bg.fillRect(0, 0, W, H)

    const solid = this.physics.add.staticGroup()
    for (const [x, y, w] of PLATFORMS) {
      const p = this.add.rectangle(x, y, w, 26, 0x4a3a24)
      this.add.rectangle(x, y - 15, w, 5, 0x6a5434)
      solid.add(p)
    }

    const shard = this.add.rectangle(1150, 185, 18, 18, 0xffd970).setAngle(45)
    this.tweens.add({ targets: shard, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 })

    this.player = this.add.rectangle(90, 620, 26, 40, 0xe07b28)
    this.physics.add.existing(this.player)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setGravityY(GRAVITY)
    this.physics.add.collider(this.player, solid)

    // Touch controls: ◀ ▶ bottom-left, jump bottom-right
    const mkBtn = (x: number, label: string) => {
      const b = this.add.circle(x, H - 70, 48, 0xffffff, 0.08).setStrokeStyle(2, 0x8a7a5a, 0.6)
        .setInteractive({ useHandCursor: true }).setDepth(900)
      this.add.text(x, H - 70, label, { fontSize: '34px', color: '#e8dcc0' }).setOrigin(0.5).setDepth(901)
      return b
    }
    const left = mkBtn(90, '◀')
    const right = mkBtn(210, '▶')
    const jump = mkBtn(W - 90, '⭡')

    left.on('pointerdown', () => (this.holdLeft = true))
    left.on('pointerup', () => (this.holdLeft = false))
    left.on('pointerout', () => (this.holdLeft = false))
    right.on('pointerdown', () => (this.holdRight = true))
    right.on('pointerup', () => (this.holdRight = false))
    right.on('pointerout', () => (this.holdRight = false))
    jump.on('pointerdown', () => {
      if (body.blocked.down) body.setVelocityY(JUMP)
    })

    this.physics.add.existing(shard, true)
    this.physics.add.overlap(this.player, shard, () => {
      if (this.won) return
      this.won = true
      shard.destroy()
      bigMessage(this, 'Shard recovered.\nThe climb was worth it.')
    })

    addHud(this, 'The Ruined Shrine', 'hold ◀ ▶ to run · ⭡ to jump · mind the pit · reach the glint')
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocityX(this.holdLeft ? -RUN : this.holdRight ? RUN : 0)

    // Fell in the pit: back to the start (checkpoints come later)
    if (this.player.y > 780) {
      this.player.setPosition(90, 620)
      body.setVelocity(0, 0)
      this.cameras.main.flash(120, 120, 20, 20)
    }
  }
}

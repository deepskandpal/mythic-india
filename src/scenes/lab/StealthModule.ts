import Phaser from 'phaser'
import { addHud, bigMessage, HUD_H } from './common'

// Virata Parva feel: cross the court without being seen.
// LEARN: "seen" is just math — inside the guard's view distance AND within
// the cone angle of where he's facing. The sweeping cone is a sine wave.
type Guard = { x: number; y: number; base: number; amp: number; speed: number; phase: number; facing: number }

const RANGE = 270
const HALF_CONE = Phaser.Math.DegToRad(28)

export class StealthModule extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private target: Phaser.Math.Vector2 | null = null
  private coneG!: Phaser.GameObjects.Graphics
  private guards: Guard[] = []
  private done = false

  constructor() {
    super('lab-stealth')
  }

  create() {
    this.target = null
    this.done = false
    const { width: W, height: H } = this.scale

    this.add.rectangle(W / 2, H / 2, W, H, 0x1c1812)
    // Court floor
    this.add.rectangle(W / 2, H / 2 + 30, W - 120, H - 180, 0x2a2418)

    // Pillars: cover you can hide behind (they block walking; vision-blocking comes later)
    const pillars = this.physics.add.staticGroup()
    for (const [px, py] of [[430, 330], [430, 560], [780, 260], [780, 500], [1020, 400]] as Array<[number, number]>) {
      pillars.add(this.add.rectangle(px, py, 46, 46, 0x4a3a24))
    }

    // The exit
    const exit = this.add.rectangle(W - 70, 430, 26, 110, 0x2a6a3a)
    this.tweens.add({ targets: exit, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 })

    // Guards with sweeping gazes
    this.guards = [
      { x: 560, y: 200, base: Math.PI / 2, amp: 0.9, speed: 0.9, phase: 0, facing: 0 },
      { x: 900, y: 640, base: -Math.PI / 2 - 0.6, amp: 0.8, speed: 1.2, phase: 2, facing: 0 },
      { x: 1150, y: 240, base: Math.PI * 0.75, amp: 0.7, speed: 0.7, phase: 4, facing: 0 }
    ]
    for (const g of this.guards) this.add.rectangle(g.x, g.y, 30, 30, 0x8a2a1e)
    this.coneG = this.add.graphics()

    this.player = this.add.rectangle(120, 620, 24, 24, 0xe07b28)
    this.physics.add.existing(this.player)
    ;(this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true)
    this.physics.add.collider(this.player, pillars)

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.y < HUD_H || this.done) return
      this.target = new Phaser.Math.Vector2(p.x, p.y)
    })

    this.physics.add.existing(exit, true)
    this.physics.add.overlap(this.player, exit, () => {
      if (this.done) return
      this.done = true
      bigMessage(this, 'The disguise held.\nYou slipped through unseen.')
    })

    addHud(this, 'The Year in Disguise', 'tap to move · stay out of the red gaze · reach the green door')
  }

  update(time: number) {
    if (this.done) return
    const body = this.player.body as Phaser.Physics.Arcade.Body

    if (this.target) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y)
      if (d < 8) {
        body.setVelocity(0, 0)
        this.target = null
      } else {
        this.physics.moveTo(this.player, this.target.x, this.target.y, 190)
      }
    }

    this.coneG.clear()
    this.coneG.fillStyle(0xff4444, 0.16)
    for (const g of this.guards) {
      g.facing = g.base + g.amp * Math.sin((time / 1000) * g.speed + g.phase)
      this.coneG.slice(g.x, g.y, RANGE, g.facing - HALF_CONE, g.facing + HALF_CONE)
      this.coneG.fillPath()

      const dist = Phaser.Math.Distance.Between(g.x, g.y, this.player.x, this.player.y)
      const toPlayer = Phaser.Math.Angle.Between(g.x, g.y, this.player.x, this.player.y)
      const off = Math.abs(Phaser.Math.Angle.Wrap(toPlayer - g.facing))
      if (dist < RANGE && off < HALF_CONE) {
        // Caught: flash, back to the start
        this.cameras.main.flash(200, 160, 20, 20)
        this.player.setPosition(120, 620)
        body.setVelocity(0, 0)
        this.target = null
      }
    }
  }
}

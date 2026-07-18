import Phaser from 'phaser'
import { addHud, bigMessage, SERIF, HUD_H } from './common'

// Pokémon-feel: a world bigger than the screen, a camera that follows you,
// an NPC who talks when you get close, a collectible tucked in a corner.
// LEARN: the camera is a movable window onto a larger world — the core
// trick behind every top-down adventure game.
const WORLD_W = 1800
const WORLD_H = 1200

const TREES: Array<[number, number]> = [
  [400, 300], [700, 200], [1000, 500], [520, 800], [1400, 250],
  [1500, 700], [900, 950], [300, 1000], [1200, 800], [750, 620]
]

export class ExploreModule extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private target: Phaser.Math.Vector2 | null = null
  private sage!: Phaser.GameObjects.Arc
  private sageBubble!: Phaser.GameObjects.Text
  private shard!: Phaser.GameObjects.Rectangle
  private found = false

  constructor() {
    super('lab-explore')
  }

  create() {
    this.target = null
    this.found = false
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H)
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H)

    // The land: dusty plain with darker grass patches
    this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x2a2416)
    for (let i = 0; i < 40; i++) {
      const x = (i * 379) % WORLD_W, y = (i * 761) % WORLD_H
      this.add.rectangle(x, y, 90, 60, 0x232010)
    }

    const trees = this.physics.add.staticGroup()
    for (const [x, y] of TREES) {
      const t = this.add.circle(x, y, 34, 0x1d3316)
      this.add.circle(x, y - 6, 22, 0x2a4a1e)
      trees.add(t)
    }

    // The sage — walk close and he speaks
    this.sage = this.add.circle(1300, 400, 20, 0xd9d4c0)
    this.add.rectangle(1300, 430, 30, 26, 0xb0491e) // his robe
    this.sageBubble = this.add.text(1300, 340,
      '“You are far from your own time, child.\nThe dice game begins at dusk. Watch — do not speak.”', {
      fontFamily: SERIF, fontSize: '18px', color: '#e8dcc0', align: 'center',
      backgroundColor: '#000000cc', padding: { x: 12, y: 8 }
    }).setOrigin(0.5, 1).setAlpha(0)

    // The shard — glinting in the far corner
    this.shard = this.add.rectangle(1600, 980, 18, 18, 0xffd970).setAngle(45)
    this.tweens.add({ targets: this.shard, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 })

    // You
    this.player = this.add.rectangle(200, 200, 26, 26, 0xe07b28)
    this.physics.add.existing(this.player)
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    this.physics.add.collider(this.player, trees)

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12)

    // Tap-to-move: the classic touch-first way to walk a top-down world
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (p.y < HUD_H) return
      this.target = new Phaser.Math.Vector2(p.worldX, p.worldY)
      const ring = this.add.circle(p.worldX, p.worldY, 14).setStrokeStyle(2, 0xe8c87a, 0.9)
      this.tweens.add({ targets: ring, scale: 0.2, alpha: 0, duration: 350, onComplete: () => ring.destroy() })
    })

    addHud(this, 'The Open Road', 'tap anywhere to walk · find the sage · find the glint')
  }

  update() {
    const body = this.player.body as Phaser.Physics.Arcade.Body
    if (this.target) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.target.x, this.target.y)
      if (d < 8) {
        body.setVelocity(0, 0)
        this.target = null
      } else {
        this.physics.moveTo(this.player, this.target.x, this.target.y, 220)
      }
    }

    const nearSage = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.sage.x, this.sage.y) < 90
    this.sageBubble.setAlpha(nearSage ? 1 : Math.max(0, this.sageBubble.alpha - 0.05))

    if (!this.found && Phaser.Math.Distance.Between(this.player.x, this.player.y, this.shard.x, this.shard.y) < 30) {
      this.found = true
      this.shard.destroy()
      body.setVelocity(0, 0)
      bigMessage(this, 'Shard fragment recovered.\n\n(tap ◀ lab to try another feel)')
    }
  }
}

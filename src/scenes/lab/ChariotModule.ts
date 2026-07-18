import Phaser from 'phaser'
import { addHud, SERIF, HUD_H } from './common'

// NFS-feel, chariot edition: three lanes, rising speed, tap left/right to dodge.
// LEARN: endless runners are difficulty-as-a-curve — one speed variable
// climbing slowly turns "easy" into "white knuckles" with no new code.
const LANES = [440, 640, 840]

export class ChariotModule extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle
  private lane = 1
  private speed = 260
  private dist = 0
  private crashed = false
  private obstacles!: Phaser.Physics.Arcade.Group
  private dashes: Phaser.GameObjects.Rectangle[] = []
  private scoreText!: Phaser.GameObjects.Text
  private spawnTimer?: Phaser.Time.TimerEvent

  constructor() {
    super('lab-chariot')
  }

  create() {
    this.lane = 1
    this.speed = 260
    this.dist = 0
    this.crashed = false
    this.dashes = []

    const { width: W, height: H } = this.scale
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a140c)
    this.add.rectangle(W / 2, H / 2, 620, H, 0x2e2414) // the road
    this.add.rectangle(330, H / 2, 8, H, 0x6a5434)
    this.add.rectangle(950, H / 2, 8, H, 0x6a5434)

    // Lane divider dashes that scroll to sell the speed
    for (const x of [540, 740]) {
      for (let i = 0; i < 8; i++) {
        this.dashes.push(this.add.rectangle(x, i * 100, 6, 44, 0x8a7a5a))
      }
    }

    this.player = this.add.rectangle(LANES[1], 600, 52, 74, 0xe07b28)
    this.add.rectangle(LANES[1], 600, 52, 12, 0x8a4a18).setName('trim')
    this.physics.add.existing(this.player)

    this.obstacles = this.physics.add.group()
    const spawn = () => {
      if (this.crashed) return
      const lane = Phaser.Math.Between(0, 2)
      const rock = this.add.rectangle(LANES[lane], -50, 62, 62, 0x55483a)
      this.physics.add.existing(rock)
      ;(rock.body as Phaser.Physics.Arcade.Body).setVelocityY(this.speed)
      this.obstacles.add(rock)
    }
    this.spawnTimer = this.time.addEvent({ delay: 800, loop: true, callback: spawn })

    this.physics.add.overlap(this.player, this.obstacles, () => this.crash())

    // Tap left half / right half to switch lanes
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.crashed || p.y < HUD_H) return
      const to = p.x < this.scale.width / 2 ? Math.max(0, this.lane - 1) : Math.min(2, this.lane + 1)
      if (to === this.lane) return
      this.lane = to
      this.tweens.add({ targets: this.player, x: LANES[to], duration: 110, ease: 'Sine.easeOut' })
    })

    this.scoreText = this.add.text(W - 24, 16, '0 m', { fontFamily: SERIF, fontSize: '28px', color: '#ffd970' }).setOrigin(1, 0)

    addHud(this, 'Chariot!', 'tap LEFT side / RIGHT side of the road to change lanes')
  }

  private crash() {
    if (this.crashed) return
    this.crashed = true
    this.spawnTimer?.remove()
    this.physics.pause()
    this.cameras.main.shake(500, 0.02)

    const { width: W, height: H } = this.scale
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(1500)
    this.add.text(W / 2, H / 2, `The wheel shattered.\n${Math.floor(this.dist / 40)} m at full gallop.\n\ntap to ride again`, {
      fontFamily: SERIF, fontSize: '36px', color: '#e8c87a', align: 'center', lineSpacing: 10
    }).setOrigin(0.5).setDepth(1501)

    this.time.delayedCall(500, () => this.input.once('pointerdown', () => this.scene.restart()))
  }

  update(_t: number, deltaMs: number) {
    if (this.crashed) return
    const dt = deltaMs / 1000
    this.speed += 9 * dt
    this.dist += this.speed * dt
    this.scoreText.setText(`${Math.floor(this.dist / 40)} m`)

    for (const d of this.dashes) {
      d.y += this.speed * dt
      if (d.y > 760) d.y -= 800
    }
    this.obstacles.getChildren().forEach(o => {
      const r = o as Phaser.GameObjects.Rectangle
      ;(r.body as Phaser.Physics.Arcade.Body).setVelocityY(this.speed)
      if (r.y > 800) r.destroy()
    })
  }
}

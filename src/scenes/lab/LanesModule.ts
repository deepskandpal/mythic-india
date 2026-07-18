import Phaser from 'phaser'
import { addHud, bigMessage, SERIF } from './common'

// PvZ-feel: 5 lanes, resources tick up, tap a cell to place an archer,
// the enemy line marches at you. Survive 45 seconds.
// LEARN: tower defense is three loops — economy (prana), production (arrows),
// pressure (spawns) — balanced against each other.
const ROWS = 5, COLS = 8
const CELL = 105
const GRID_X = 190, GRID_Y = 135
const COST = 50

export class LanesModule extends Phaser.Scene {
  private prana = 100
  private pranaText!: Phaser.GameObjects.Text
  private timeText!: Phaser.GameObjects.Text
  private occupied: boolean[][] = []
  private archers!: Phaser.Physics.Arcade.Group
  private enemies!: Phaser.Physics.Arcade.Group
  private arrows!: Phaser.Physics.Arcade.Group
  private started = 0
  private ended = false

  constructor() {
    super('lab-lanes')
  }

  create() {
    this.prana = 100
    this.ended = false
    this.started = this.time.now
    this.occupied = Array.from({ length: ROWS }, () => Array(COLS).fill(false))

    const { width: W, height: H } = this.scale
    this.add.rectangle(W / 2, H / 2, W, H, 0x241d10)

    // The field
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.add.rectangle(
          GRID_X + c * CELL + CELL / 2, GRID_Y + r * CELL + CELL / 2,
          CELL - 4, CELL - 4, (r + c) % 2 ? 0x33290f : 0x3a2f14
        )
      }
    }
    // The line you must not let them cross
    this.add.rectangle(GRID_X - 14, GRID_Y + (ROWS * CELL) / 2, 6, ROWS * CELL, 0xc23a2a)

    this.archers = this.physics.add.group()
    this.enemies = this.physics.add.group()
    this.arrows = this.physics.add.group()

    this.pranaText = this.add.text(this.scale.width - 24, 16, '', { fontFamily: SERIF, fontSize: '26px', color: '#ffd970' }).setOrigin(1, 0)
    this.timeText = this.add.text(this.scale.width - 24, 50, '', { fontFamily: SERIF, fontSize: '20px', color: '#8a7a5a' }).setOrigin(1, 0)

    // Economy: prana ticks up
    this.time.addEvent({ delay: 2000, loop: true, callback: () => { if (!this.ended) this.prana += 25 } })

    // Pressure: enemies spawn, faster over time
    const spawn = () => {
      if (this.ended) return
      const row = Phaser.Math.Between(0, ROWS - 1)
      const e = this.add.rectangle(1320, GRID_Y + row * CELL + CELL / 2, 40, 56, 0x8a2a1e)
      this.physics.add.existing(e)
      ;(e.body as Phaser.Physics.Arcade.Body).setVelocityX(-34)
      e.setData('hp', 3)
      this.enemies.add(e)
      const elapsed = (this.time.now - this.started) / 1000
      this.time.delayedCall(Math.max(1100, 2400 - elapsed * 30), spawn)
    }
    this.time.delayedCall(1500, spawn)

    // Production: every archer looses an arrow on a cadence
    this.time.addEvent({
      delay: 1300, loop: true, callback: () => {
        if (this.ended) return
        this.archers.getChildren().forEach(a => {
          const ar = a as Phaser.GameObjects.Rectangle
          const arrow = this.add.rectangle(ar.x + 26, ar.y, 22, 4, 0xffd970)
          this.physics.add.existing(arrow)
          ;(arrow.body as Phaser.Physics.Arcade.Body).setVelocityX(300)
          this.arrows.add(arrow)
        })
      }
    })

    this.physics.add.overlap(this.arrows, this.enemies, (arrow, enemy) => {
      const e = enemy as Phaser.GameObjects.Rectangle
      arrow.destroy()
      const hp = e.getData('hp') - 1
      e.setData('hp', hp)
      if (hp <= 0) e.destroy()
    })

    // An enemy that reaches an archer tramples it
    this.physics.add.overlap(this.enemies, this.archers, (_e, archer) => {
      const a = archer as Phaser.GameObjects.Rectangle
      this.occupied[a.getData('row')][a.getData('col')] = false
      a.destroy()
    })

    // Place archers by tapping a cell
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.ended) return
      const c = Math.floor((p.x - GRID_X) / CELL)
      const r = Math.floor((p.y - GRID_Y) / CELL)
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return
      if (this.occupied[r][c] || this.prana < COST) return
      this.prana -= COST
      this.occupied[r][c] = true
      const a = this.add.rectangle(GRID_X + c * CELL + CELL / 2, GRID_Y + r * CELL + CELL / 2, 38, 50, 0x2a6a8a)
      this.physics.add.existing(a)
      a.setData('row', r).setData('col', c)
      this.archers.add(a)
    })

    // Survive 45 seconds and the line holds
    this.time.delayedCall(45000, () => {
      if (this.ended) return
      this.ended = true
      this.physics.pause()
      bigMessage(this, 'The line held.\nThe formation stands.')
    })

    addHud(this, 'Hold the Line', 'tap a square to place an archer (50 prana) · survive 45s')
  }

  update() {
    this.pranaText.setText(`☀ ${this.prana}`)
    const left = Math.max(0, 45 - Math.floor((this.time.now - this.started) / 1000))
    this.timeText.setText(`${left}s`)

    if (this.ended) return
    for (const e of this.enemies.getChildren()) {
      if ((e as Phaser.GameObjects.Rectangle).x < GRID_X - 10) {
        this.ended = true
        this.physics.pause()
        bigMessage(this, 'The line broke.\n\n(tap ◀ lab, come back stronger)', '#e07b6a')
        break
      }
    }
  }
}

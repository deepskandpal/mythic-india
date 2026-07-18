import Phaser from 'phaser'
import { SERIF } from './common'

const MODULES = [
  { scene: 'lab-explore', name: 'The Open Road', flavor: 'Pokémon', maps: 'wander Hastinapur — sages, secrets, shard fragments' },
  { scene: 'lab-lanes', name: 'Hold the Line', flavor: 'Plants vs Zombies', maps: 'Kurukshetra — place archers, stop the advance' },
  { scene: 'lab-traverse', name: 'The Ruined Shrine', flavor: 'Uncharted', maps: 'platform traversal — climb to the shard' },
  { scene: 'lab-stealth', name: 'The Year in Disguise', flavor: 'stealth · Virata Parva', maps: 'slip past the guards, stay out of sight' },
  { scene: 'lab-chariot', name: 'Chariot!', flavor: 'NFS', maps: 'lane-dodging escape at full gallop' }
]

export class LabHub extends Phaser.Scene {
  constructor() {
    super('labhub')
  }

  create() {
    const { width: W, height: H } = this.scale

    const g = this.add.graphics()
    g.fillGradientStyle(0x0a0806, 0x0a0806, 0x14100a, 0x1a0e14, 1)
    g.fillRect(0, 0, W, H)

    this.add.text(16, 14, '◀ title', { fontFamily: SERIF, fontSize: '24px', color: '#e8c87a' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('title'))

    this.add.text(W / 2, 60, 'GAMEPLAY LAB', {
      fontFamily: SERIF, fontSize: '44px', color: '#e8c87a', letterSpacing: 8
    }).setOrigin(0.5)
    this.add.text(W / 2, 108, 'five feels — play each, then rank them', {
      fontFamily: SERIF, fontSize: '20px', fontStyle: 'italic', color: '#8a7a5a'
    }).setOrigin(0.5)

    MODULES.forEach((m, i) => {
      const y = 180 + i * 100
      const row = this.add.rectangle(W / 2, y, W * 0.76, 84, 0xffffff, 0.04)
        .setStrokeStyle(1, 0x8a7a5a, 0.4)
        .setInteractive({ useHandCursor: true })
      row.on('pointerover', () => row.setFillStyle(0xffffff, 0.09))
      row.on('pointerout', () => row.setFillStyle(0xffffff, 0.04))
      row.on('pointerdown', () => this.scene.start(m.scene))

      this.add.text(W * 0.15, y - 18, `${m.name}`, { fontFamily: SERIF, fontSize: '28px', color: '#f0e3c8' }).setOrigin(0, 0.5)
      this.add.text(W * 0.85, y - 18, m.flavor, { fontFamily: SERIF, fontSize: '20px', fontStyle: 'italic', color: '#c2913a' }).setOrigin(1, 0.5)
      this.add.text(W * 0.15, y + 16, m.maps, { fontFamily: SERIF, fontSize: '18px', color: '#8a7a5a' }).setOrigin(0, 0.5)
    })
  }
}

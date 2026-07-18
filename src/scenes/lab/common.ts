import Phaser from 'phaser'

export const SERIF = 'Georgia, serif'
export const HUD_H = 70 // taps above this line belong to the HUD, not the game

// Every lab module gets the same header: back button, title, control hint.
export function addHud(scene: Phaser.Scene, title: string, hint: string) {
  const W = scene.scale.width
  scene.add.text(16, 14, '◀ lab', { fontFamily: SERIF, fontSize: '24px', color: '#e8c87a' })
    .setInteractive({ useHandCursor: true })
    .setDepth(1000).setScrollFactor(0)
    .on('pointerdown', () => scene.scene.start('labhub'))
  scene.add.text(W / 2, 12, title, { fontFamily: SERIF, fontSize: '26px', color: '#e8dcc0' })
    .setOrigin(0.5, 0).setDepth(1000).setScrollFactor(0)
  scene.add.text(W / 2, 44, hint, { fontFamily: SERIF, fontSize: '17px', color: '#8a7a5a' })
    .setOrigin(0.5, 0).setDepth(1000).setScrollFactor(0)
}

export function bigMessage(scene: Phaser.Scene, lines: string, color = '#e8c87a') {
  const { width: W, height: H } = scene.scale
  scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setDepth(1500).setScrollFactor(0)
  scene.add.text(W / 2, H / 2, lines, {
    fontFamily: SERIF, fontSize: '38px', color, align: 'center', lineSpacing: 12
  }).setOrigin(0.5).setDepth(1501).setScrollFactor(0)
}

import Phaser from 'phaser'
import { TitleScene } from './scenes/TitleScene'
import { ArrivalScene } from './scenes/ArrivalScene'
import { LabHub } from './scenes/lab/LabHub'
import { ExploreModule } from './scenes/lab/ExploreModule'
import { LanesModule } from './scenes/lab/LanesModule'
import { TraverseModule } from './scenes/lab/TraverseModule'
import { StealthModule } from './scenes/lab/StealthModule'
import { ChariotModule } from './scenes/lab/ChariotModule'

// LEARN: a Phaser "Game" is one config object + a list of Scenes.
// A Scene is a self-contained screen (title, gameplay, menu...).
// Phaser runs the active scene's update() ~60 times per second — the game loop.
new Phaser.Game({
  type: Phaser.AUTO,            // WebGL if available, else Canvas
  parent: 'game',
  width: 1280,                  // we design in a fixed 1280x720 "virtual" space...
  height: 720,
  backgroundColor: '#0a0806',
  scale: {
    mode: Phaser.Scale.FIT,     // ...and Phaser letterboxes it to any screen (iPad, phone, desktop)
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // LEARN: "arcade" physics = simple, fast rectangles-and-velocities.
  // Enough for every module in the lab; real games ship on it constantly.
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 } }
  },
  scene: [
    TitleScene, ArrivalScene,   // first in the list boots first
    LabHub, ExploreModule, LanesModule, TraverseModule, StealthModule, ChariotModule
  ]
})

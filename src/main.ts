import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene';
import { StoryScene } from './scenes/StoryScene';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0b0a12',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [TitleScene, StoryScene],
});

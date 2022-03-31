import { MainScene } from './main';
import { MenuScene } from './menu';
import { LoadScene } from './load';

new Phaser.Game({
    width: 1280,
    height: 720,
    parent: 'game',
    scene: [
        LoadScene,
        MenuScene,
        MainScene
    ],
    backgroundColor: 0xDED6B6,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.FIT,
    },
});
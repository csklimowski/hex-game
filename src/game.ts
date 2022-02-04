import { MainScene } from './main';
import { LoadScene } from './load';

new Phaser.Game({
    width: 1280,
    height: 720,
    parent: 'game',
    scene: [
        LoadScene,
        MainScene
    ],
    backgroundColor: 0x333333,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.FIT,
    }
});
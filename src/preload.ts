export class LoadScene extends Phaser.Scene {

    constructor() {
        super('preload');
    }

    preload() {
        this.load.bitmapFont('font', 'font/font.png', 'font/font.fnt');
    }

    create() {
        this.scene.start('menu');
    }
}
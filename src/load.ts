export class LoadScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'load'
        });
    }

    preload() {
        this.add.text(20, 20, 'Loading...');
        this.load.image('hex', 'img/hex.png');
        this.load.image('hex2', 'img/hex2.png');
        this.load.image('hex3', 'img/hex3.png');
        this.load.image('hex4', 'img/hex4.png');
    }

    create() {
        this.scene.start('main');
    }
}
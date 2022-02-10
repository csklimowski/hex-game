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

        this.load.image('white', 'img/white.png');

        this.load.image('edge-e', 'img/edge-e.png');
        this.load.image('edge-ne', 'img/edge-ne.png');
        this.load.image('edge-nw', 'img/edge-nw.png');
        this.load.image('edge-w', 'img/edge-w.png');
        this.load.image('edge-sw', 'img/edge-sw.png');
        this.load.image('edge-se', 'img/edge-se.png');
        this.load.image('park-bw', 'img/park-bw.png');
        this.load.image('park-color', 'img/park-color.png');
        this.load.image('windmill-bw', 'img/windmill-bw.png');
        this.load.image('windmill-color', 'img/windmill-color.png');
        this.load.image('street-bw', 'img/street-bw.png');
        this.load.image('street-color', 'img/street-color.png');
        this.load.image('hill', 'img/hill.png');
        this.load.image('windmill-color-hill', 'img/windmill-color-hill.png');
        this.load.image('center', 'img/center.png');
    }

    create() {
        this.scene.start('main');
    }
}
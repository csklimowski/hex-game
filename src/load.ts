export class LoadScene extends Phaser.Scene {

    constructor() {
        super({
            key: 'load'
        });
    }

    preload() {
        this.add.text(20, 20, 'Loading...');

        this.load.image('white', 'img/white.png');

        this.load.image('edge-e', 'img/edge-e.png');
        this.load.image('edge-ne', 'img/edge-ne.png');
        this.load.image('edge-nw', 'img/edge-nw.png');
        this.load.image('edge-w', 'img/edge-w.png');
        this.load.image('edge-sw', 'img/edge-sw.png');
        this.load.image('edge-se', 'img/edge-se.png');

        this.load.image('empty', 'img/empty.png');
        this.load.image('empty-hill', 'img/empty-hill.png');

        this.load.image('grass', 'img/grass.png');
        this.load.image('grass-bw', 'img/grass-bw.png');
        this.load.image('grass-red', 'img/grass-red.png');
        this.load.image('tree', 'img/tree.png');

        this.load.image('street', 'img/street.png');
        this.load.image('street-red', 'img/street-red.png');
        this.load.image('street-bw', 'img/street-bw.png');
        this.load.image('house', 'img/house.png');
        this.load.image('center', 'img/center.png');

        this.load.image('windmill', 'img/windmill.png');
        this.load.image('propeller', 'img/propeller.png');
        this.load.image('windmill-red', 'img/windmill-red.png');
        this.load.image('windmill-hill', 'img/windmill-hill.png');
        this.load.image('windmill-bw', 'img/windmill-bw.png');

        this.load.image('port', 'img/port.png');
        this.load.image('port-color', 'img/port-color.png');
        this.load.image('rotate', 'img/rotate.png');
        this.load.image('background', 'img/background.png');

        this.load.bitmapFont('font', 'font/font.png', 'font/font.fnt');
    }

    create() {
        this.scene.start('main');
    }
}
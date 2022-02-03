
class HexGrid extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene) {
        super(scene);
    }
}

const HEX_HEIGHT = 100.0;
const HEX_WIDTH = 86.60254;

// height-to-width = 1.7320508075688772

function getY(row, col) {
    return 100 + row*HEX_HEIGHT*0.75;
}

function getX(row, col) {
    return 100 + (col + 0.5*row)*HEX_WIDTH;
}

function getRow(x, y) {
    return Math.floor((y - 100)*HEX_HEIGHT*0.75);
}

function getCol(x, y) {
    
}

export class MainScene extends Phaser.Scene {

    grid: Phaser.GameObjects.Image[][];

    constructor() {
        super('main');
    }

    create() {

        this.grid = [];

        for (let r = 0; r < 5; r++) {
            this.grid.push([]);
            for (let c = 0; c < 5; c++) {
                if (c + r < 2 || c + r > 6) {
                    this.grid[r].push(null);
                } else {
                    let s = this.add.image(getX(r, c), getY(r, c), 'hex');
                    s.setScale(0.5);
                    this.grid[r].push(s);
                }
                console.log(getY(r, c));
            }
        }

        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this)
    }

    onPointerDown(event) {

    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }
}


class Matrix2D<Type> {

    rows: Map<number, Map<number, Type>>;

    constructor() {
        this.rows = new Map<number, Map<number, Type>>();
    }

    set(row: number, col: number, obj: Type) {
        let r = this.rows.get(row);
        if (!r) {
            r = new Map<number, Type>();
            this.rows.set(row, r);
        }
        r.set(col, obj);
    }

    get(row: number, col: number) {
        let r = this.rows.get(row);
        if (r) {
            return r.get(col) || null;
        } else {
            return null;
        }
    }

    delete(row: number, col: number) {
        let r = this.rows.get(row);
        if (r) {
            r.delete(col);
        }
    }

    has(row: number, col: number) {
        let r = this.rows.get(row);
        if (r) {
            return r.has(col);
        } else {
            return false;
        }
    }
}

function pick(array) {
    return array[Math.floor(Math.random()*array.length)];
}



const shapes = {
    'a': [
        { ro: 0, co: 0 },
        { ro: 1, co: -1 },
        { ro: 1, co: 0}
    ],
    'v': [
        { ro: 0, co: 0 },
        { ro: 0, co: 1 },
        { ro: 1, co: 0 },
    ]
}


class Hex extends Phaser.GameObjects.Image {

    hexType: number;

    constructor(scene: Phaser.Scene, x: number, y: number, hexType?: number) {
        super(scene, x, y, 'hex');
        this.setScale(0.5);
        scene.add.existing(this);
        this.hexType = hexType || 0;
        this.setTexture(['hex', 'hex2', 'hex3', 'hex4'][this.hexType]);
    }

    setType(hexType: number) {
        this.setTexture(['hex', 'hex2', 'hex3', 'hex4'][hexType]);
        this.hexType = hexType;
    }
}



class Trihex {
    hexes: number[];
    shape: string;

    constructor(color1: number, color2: number, color3: number, shape: string) {
        this.hexes = [color1, color2, color3];
        this.shape = shape;
    }

    rotateRight() {
        if (this.shape === 'a') {
            this.shape = 'v';
            let temp = this.hexes[0];
            this.hexes[0] = this.hexes[1];
            this.hexes[1] = temp;
        } else {
            this.shape = 'a';
            let temp = this.hexes[1];
            this.hexes[1] = this.hexes[2];
            this.hexes[2] = temp;
        }
    }
}

class HexGrid extends Phaser.GameObjects.Group {

    grid: Matrix2D<Hex>;
    preview: Phaser.GameObjects.Image;
    triPreviews: Phaser.GameObjects.Image[];

    constructor(scene: Phaser.Scene) {
        super(scene);

        this.grid = new Matrix2D<Hex>();
        
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (c + r < 4 || c + r > 12) {
                    continue;
                } else {
                    let h = new Hex(scene, getX(r, c), getY(r, c));
                    this.add(h);
                    this.grid.set(r, c, h);
                }
            }
        }

        this.grid.get(0, 4).destroy();
        this.grid.delete(0, 4);
        this.grid.get(0, 8).destroy();
        this.grid.delete(0, 8);
        
        this.grid.get(4, 0).destroy();
        this.grid.delete(4, 0);
        this.grid.get(4, 8).destroy();
        this.grid.delete(4, 8);

        this.grid.get(4, 4).destroy();
        this.grid.delete(4, 4);

        this.grid.get(8, 0).destroy();
        this.grid.delete(8, 0);
        this.grid.get(8, 4).destroy();
        this.grid.delete(8, 4);
        // this.grid.delete(0, 4);
        // this.grid.get(0, 4).destroy();
        // this.grid.delete(0, 4);
        // this.grid.get(0, 4).destroy();
        // this.grid.delete(0, 4);


        this.preview = scene.add.image(0, 0, 'hex2');
        this.preview.setScale(0.5);
        this.preview.setAlpha(0.5);
        this.preview.setVisible(false);

        this.triPreviews = [];
        for (let i = 0; i < 3; i++) {
            let p = scene.add.image(0, 0, 'hex2');
            p.setScale(0.5);
            p.setAlpha(0.5);
            p.setVisible(false);
            this.triPreviews.push(p);
        }
    }

    updatePreview(x: number, y: number, type: number) {
        let r = getRow(x, y);
        let c = getCol(x, y);

        let h = this.grid.get(r, c);
        if (h) {
            this.preview.setTexture(['hex', 'hex2', 'hex3', 'hex4'][type]);
            this.preview.setVisible(true);
            this.preview.setX(getX(r, c));
            this.preview.setY(getY(r, c));
        } else {
            this.preview.setVisible(false);
        }
    }

    updateTriPreview(x: number, y: number, trihex: Trihex) {
        let r = getRow(x, y);
        let c = getCol(x, y);

        for (let i = 0; i < 3; i++) {
            let offsets = shapes[trihex.shape][i];
            let h = this.grid.get(r + offsets.ro, c + offsets.co);
            if (h) {
                this.triPreviews[i].setTexture(['hex', 'hex2', 'hex3', 'hex4'][trihex.hexes[i]]);
                this.triPreviews[i].setX(h.x);
                this.triPreviews[i].setY(h.y);
                this.triPreviews[i].setVisible(true);
            }
        }
    }

    placeTrihex(x: number, y: number, trihex: Trihex) {
        let r = getRow(x, y);
        let c = getCol(x, y);

        for (let i = 0; i < 3; i++) {
            let offsets = shapes[trihex.shape][i];
            let h = this.grid.get(r + offsets.ro, c + offsets.co);
            if (h) {
                h.setType(trihex.hexes[i]);
            }
        }
    }

    placeHex(x: number, y: number, type: number) {
        let r = getRow(x, y);
        let c = getCol(x, y);

        let h = this.grid.get(r, c);
        if (h) {
            h.setType(type);
        } else {
            this.grid.set(r, c, new Hex(this.scene, getX(r, c), getY(r, c), type));
        }
    }
}

const HEX_HEIGHT = 100.0;
const HEX_WIDTH = 86.60254;

// height-to-width = 1.7320508075688772

function getY(row, col) {
    return 50 + row*HEX_HEIGHT*0.75;
}

function getX(row, col) {
    return 100 + (col + 0.5*row)*HEX_WIDTH;
}

function getRow(x, y) {
    return Math.floor((y - 50 + 0.4*HEX_HEIGHT)/(HEX_HEIGHT*0.75));
}

function getCol(x, y) {
    return Math.floor((x - 100 + 0.5*HEX_WIDTH)/HEX_WIDTH - 0.5*getRow(x, y));
}

export class MainScene extends Phaser.Scene {

    grid: HexGrid;

    nextType: number;
    nextTrihex: Trihex;
    typeDeck: number[];

    constructor() {
        super('main');
    }

    create() {

        this.grid = new HexGrid(this);
        this.typeDeck = [3, 2, 1, 1, 3, 2, 2, 3, 1, 2, 3, 2, 3, 3, 1, 2, 1, 2, 2, 3, 1, 2, 3];

        this.nextTrihex = new Trihex(1, 2, 3, 'a');
        this.pickNextTrihex();
        this.chooseNextType();

        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onKeyDown, this);
    }

    chooseNextType() {
        if (this.nextType === 1) {
            this.nextType = pick([2, 2, 3, 3, 3]);
        } else {
            this.nextType = pick([1, 1, 1, 2, 2, 3, 3, 3]);
        }
    }

    pickNextTrihex() {
        this.nextTrihex.shape = Math.random() > 0.5 ? 'a' : 'v';

        let hasBlue = false;
        for (let i = 0; i < 3; i++) {
            if (hasBlue) {
                this.nextTrihex.hexes[i] = pick([2, 2, 3, 3, 3])
            } else {
                this.nextTrihex.hexes[i] = pick([1, 2, 2, 3, 3, 3])
                if (this.nextTrihex.hexes[i] === 1) {
                    hasBlue = true;
                }
            }
        }
    }

    onPointerDown(event) {
        this.grid.placeTrihex(event.worldX, event.worldY, this.nextTrihex);
        this.pickNextTrihex();
    }

    onPointerMove(event) {
        // this.grid.updatePreview(event.worldX, event.worldY, this.nextType);
        this.grid.updateTriPreview(event.worldX, event.worldY, this.nextTrihex);
    }

    onKeyDown(event) {
        this.nextTrihex.rotateRight();
    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }
}


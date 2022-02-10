import * as _ from 'lodash';

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
        { ro: 0, co:  0 },
        { ro: 1, co: -1 },
        { ro: 1, co:  0 }
    ],
    'v': [
        { ro: 0, co: 0 },
        { ro: 0, co: 1 },
        { ro: 1, co: 0 },
    ],
    '\\': [
        { ro: -1, co: 0 },
        { ro:  0, co: 0 },
        { ro:  1, co: 0 }
    ],
    '-': [
        { ro: 0, co: -1 },
        { ro: 0, co:  0 },
        { ro: 0, co:  1 }
    ],
    '/': [
        { ro: -1, co:  1 },
        { ro:  0, co:  0 },
        { ro:  1, co: -1 }
    ],
    'c': [
        { ro: -1, co: 1 },
        { ro:  0, co: 0 },
        { ro:  1, co: 0 }
    ],
    'r': [
        { ro: 0, co: 1 },
        { ro: 0, co: 0 },
        { ro: 1, co: -1 }
    ],
    'n': [
        { ro: 0, co: -1 },
        { ro: 0, co:  0 },
        { ro: 1, co:  0 }
    ],
    'd': [
        { ro: -1, co:  0 },
        { ro:  0, co:  0 },
        { ro:  1, co: -1 }
    ],
    'j': [
        { ro: -1, co:  1 },
        { ro:  0, co:  0 },
        { ro:  0, co: -1 }
    ],
    'l': [
        { ro: -1, co: 0 },
        { ro:  0, co: 0 },
        { ro:  0, co: 1 }
    ]
}


class Hex extends Phaser.GameObjects.Image {

    hexType: number;
    hasHill: boolean;

    eEdge: Phaser.GameObjects.Image;
    neEdge: Phaser.GameObjects.Image;
    nwEdge: Phaser.GameObjects.Image;
    wEdge: Phaser.GameObjects.Image;
    swEdge: Phaser.GameObjects.Image;
    seEdge: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'white');
        scene.add.existing(this);
        this.setTint(0xddddcc)
        this.hexType = 0;
        this.hasHill = false;

        this.eEdge = scene.add.image(x, y, 'edge-e');
        this.neEdge = scene.add.image(x, y, 'edge-ne');
        this.nwEdge = scene.add.image(x, y, 'edge-nw');
        this.wEdge = scene.add.image(x, y, 'edge-w');
        this.swEdge = scene.add.image(x, y, 'edge-sw');
        this.seEdge = scene.add.image(x, y, 'edge-se');
        this.eEdge.setAlpha(0);
        this.neEdge.setAlpha(0);
        this.nwEdge.setAlpha(0);
        this.wEdge.setAlpha(0);
        this.swEdge.setAlpha(0);
        this.seEdge.setAlpha(0);
    }

    setType(hexType: number) {
        this.setTexture(['white', 'windmill-color', 'park-color', 'street-color', 'center'][hexType]);
        this.hexType = hexType;
        if (this.hasHill && hexType === 1) {
            this.setTexture('windmill-color-hill');
        }
    }

    setHill(hasHill: boolean) {
        this.hasHill = hasHill;
        if (hasHill) this.setTexture('hill');
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
        } else if (this.shape === 'v') {
            this.shape = 'a';
            let temp = this.hexes[1];
            this.hexes[1] = this.hexes[2];
            this.hexes[2] = temp;
        } else if (this.shape === '\\') {
            this.shape = '/';
        } else if (this.shape === '/') {
            this.shape = '-';
            let temp = this.hexes[0];
            this.hexes[0] = this.hexes[2];
            this.hexes[2] = temp;
        } else if (this.shape === '-') {
            this.shape = '\\';
        } else if (this.shape === 'c') {
            this.shape = 'r';
        } else if (this.shape === 'r') {
            this.shape = 'n';
            let temp = this.hexes[0];
            this.hexes[0] = this.hexes[2];
            this.hexes[2] = temp;

        } else if (this.shape === 'n') {
            this.shape = 'd';
        } else if (this.shape === 'd') {
            this.shape = 'j';
        } else if (this.shape === 'j') {
            this.shape = 'l';
            let temp = this.hexes[0];
            this.hexes[0] = this.hexes[2];
            this.hexes[2] = temp;
        } else if (this.shape === 'l') {
            this.shape = 'c';
        }
    }
}

class HexGrid extends Phaser.GameObjects.Group {

    grid: Matrix2D<Hex>;
    preview: Phaser.GameObjects.Image;
    triPreviews: Phaser.GameObjects.Image[];
    size: number;

    constructor(scene: Phaser.Scene, size: number) {
        super(scene);

        this.grid = new Matrix2D<Hex>();
        this.size = size;


        let mountainDeck = [];
        for (let r = 0; r < 84; r++) {
            mountainDeck.push(false);
        }
        
        for (let r = 0; r < size + size + 1; r++) {
            for (let c = 0; c < size + size + 1; c++) {
                if (c + r < size || c + r > size*3) {
                    continue;
                } else {
                    let h = new Hex(scene, getX(r, c), getY(r, c));
                    this.add(h);
                    this.grid.set(r, c, h);
                }
            }
        }

        this.grid.get(0, size).destroy();
        this.grid.delete(0, size);
        this.grid.get(0, size*2).destroy();
        this.grid.delete(0, size*2);
        
        this.grid.get(size, 0).destroy();
        this.grid.delete(size, 0);
        this.grid.get(size, size*2).destroy();
        this.grid.delete(size, size*2);

        this.grid.get(size, size).setType(4);

        this.grid.get(size*2, 0).destroy();
        this.grid.delete(size*2, 0);
        this.grid.get(size*2, size).destroy();
        this.grid.delete(size*2, size);

        let placed = 0;
        while (placed < 8) {
            let r = Math.floor(Math.random()*(size+size+1));
            let c = Math.floor(Math.random()*(size+size+1));

            let h = this.grid.get(r, c);
            if (h && !h.hasHill && h.hexType === 0 &&
                !(this.grid.has(r, c+1) && this.grid.get(r, c+1).hasHill) &&
                !(this.grid.has(r-1, c+1) && this.grid.get(r-1, c+1).hasHill) &&
                !(this.grid.has(r-1, c) && this.grid.get(r-1, c).hasHill) &&
                !(this.grid.has(r, c-1) && this.grid.get(r, c-1).hasHill) &&
                !(this.grid.has(r+1, c-1) && this.grid.get(r+1, c-1).hasHill) &&
                !(this.grid.has(r+1, c) && this.grid.get(r+1, c).hasHill)
            ) {
                h.setHill(true);
                placed += 1;
            }
        }

        
        this.updateEdges();

        this.preview = scene.add.image(0, 0, 'hex2');
        this.preview.setScale(1);
        this.preview.setAlpha(0.5);
        this.preview.setVisible(false);



        this.triPreviews = [];
        for (let i = 0; i < 3; i++) {
            let p = scene.add.image(0, 0, 'hex2');
            p.setScale(1);
            p.setAlpha(0.5);
            p.setVisible(false);
            this.triPreviews.push(p);
        }
    }

    updateEdges() {
        for (let r = 0; r < this.size + this.size + 1; r++) {
            for (let c = 0; c < this.size + this.size + 1; c++) {
                if (this.grid.has(r, c)) {
                    let h = this.grid.get(r, c);

                    if (this.grid.has(r, c+1)) h.eEdge.setAlpha(0);
                    else h.eEdge.setAlpha(1);

                    if (this.grid.has(r-1, c+1)) h.neEdge.setAlpha(0);
                    else h.neEdge.setAlpha(1);

                    if (this.grid.has(r-1, c)) h.nwEdge.setAlpha(0);
                    else h.nwEdge.setAlpha(1);

                    if (this.grid.has(r, c-1)) h.wEdge.setAlpha(0.5);
                    else h.wEdge.setAlpha(1);

                    if (this.grid.has(r+1, c-1)) h.swEdge.setAlpha(0.5);
                    else h.swEdge.setAlpha(1);

                    if (this.grid.has(r+1, c)) h.seEdge.setAlpha(0.5);
                    else h.seEdge.setAlpha(1);
                }
            }
        }
    }

    updatePreview(x: number, y: number, type: number) {
        let r = getRow(x, y);
        let c = getCol(x, y);

        let h = this.grid.get(r, c);
        if (h) {
            this.preview.setTexture(['white', 'windmill-bw', 'park-bw', 'street-bw'][type]);
            this.preview.setVisible(true);
            this.preview.setX(getX(r, c));
            this.preview.setY(getY(r, c));
        } else {
            this.preview.setVisible(false);
        }
    }

    updateTriPreview(x: number, y: number, trihex: Trihex) {
        if (trihex.shape === 'a') {
            y -= HEX_HEIGHT/2;
        }
        if (trihex.shape === 'v') {
            y -= HEX_HEIGHT/2;
            x -= HEX_WIDTH/2;
        }
        let r = getRow(x, y);
        let c = getCol(x, y);

        let hexes = [];
        for (let i = 0; i < 3; i++) {
            let offsets = shapes[trihex.shape][i];
            hexes.push(this.grid.get(r + offsets.ro, c + offsets.co));
        }
        if (hexes[0] && hexes[0].hexType === 0 &&
            hexes[1] && hexes[1].hexType === 0 &&
            hexes[2] && hexes[2].hexType === 0) {
            for (let i = 0; i < 3; i++) {
                this.triPreviews[i].setTexture(['white', 'windmill-bw', 'park-bw', 'street-bw'][trihex.hexes[i]]);
                this.triPreviews[i].setX(hexes[i].x);
                this.triPreviews[i].setY(hexes[i].y);
                this.triPreviews[i].setVisible(true);
            }
        } else {
            for (let i = 0; i < 3; i++) {
                this.triPreviews[i].setVisible(false);
            }
        }
    }

    placeTrihex(x: number, y: number, trihex: Trihex) {
        if (trihex.shape === 'a') {
            y -= HEX_HEIGHT/2;
        }
        if (trihex.shape === 'v') {
            y -= HEX_HEIGHT/2;
            x -= HEX_WIDTH/2;
        }
        let r = getRow(x, y);
        let c = getCol(x, y);

        let hexes = [];
        for (let i = 0; i < 3; i++) {
            let offsets = shapes[trihex.shape][i];
            hexes.push(this.grid.get(r + offsets.ro, c + offsets.co));
        }
        if (hexes[0] && hexes[0].hexType === 0 &&
            hexes[1] && hexes[1].hexType === 0 &&
            hexes[2] && hexes[2].hexType === 0) {
            for (let i = 0; i < 3; i++) {
                hexes[i].setType(trihex.hexes[i])
            }
        }
    }

    placeHex(x: number, y: number, type: number) {
        let r = getRow(x, y);
        let c = getCol(x, y);

        let h = this.grid.get(r, c);
        if (h) {
            h.setType(type);
        }
    }
}

const HEX_HEIGHT = 70;
const HEX_WIDTH = HEX_HEIGHT*.8660254;

function getY(row, col) {
    return 100 + row*HEX_HEIGHT*0.75;
}

function getX(row, col) {
    return (col + 0.5*row)*HEX_WIDTH - 50;
}

function getRow(x, y) {
    return Math.floor((y - 100 + 0.4*HEX_HEIGHT)/(HEX_HEIGHT*0.75));
}

function getCol(x, y) {
    return Math.floor((x + 50 + 0.5*HEX_WIDTH)/HEX_WIDTH - 0.5*getRow(x, y));
}

export class MainScene extends Phaser.Scene {

    grid: HexGrid;

    nextType: number;
    nextTrihex: Trihex;
    trihexDeck: Trihex[];

    constructor() {
        super('main');
    }

    create() {

        this.grid = new HexGrid(this, 5);

        this.trihexDeck = this.createTrihexDeck(25, false);
        this.pickNextTrihex();

        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onKeyDown, this);

        // this.input.mouse.on(Phaser.Input.MOUSE_WHEEL, this.onMouseWheel, this);
        this.input.on('wheel', this.onMouseWheel, this);
    }

    onMouseWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        if (deltaY > 0) {
            this.rotateNextTrihex();
        }
    }

    rotateNextTrihex() {
        this.nextTrihex.rotateRight();
    }

    createTrihexDeck(size: number, allShapes?: boolean): Trihex[] {
        let deck: Trihex[] = [];
        for (let i = 0; i < size; i++) {
            if (allShapes) {
                if (i < size/3) {
                    deck.push(new Trihex(0, 0, 0, 'c'));
                } else if (i < size/1.5) {
                    deck.push(new Trihex(0, 0, 0, '\\'));
                } else {
                    deck.push(new Trihex(0, 0, 0, 'a'));
                }
            } else {
                deck.push(new Trihex(0, 0, 0, 'a'));
            }
        }
        deck = _.shuffle(deck);
        for (let i = 0; i < size; i++) {
            if (i < size/2) {
                deck[i].hexes[0] = 1;
            } else {
                deck[i].hexes[0] = 3;
            }
        }
        deck = _.shuffle(deck);
        for (let i = 0; i < size; i++) {
            if (i < size/2) {
                deck[i].hexes[1] = 3;
            } else {
                deck[i].hexes[1] = 2;
            }
        }
        deck = _.shuffle(deck);
        for (let i = 0; i < size; i++) {
            if (i < size/2) {
                deck[i].hexes[2] = 3;
            } else {
                deck[i].hexes[2] = 2;
            }
            deck[i].hexes = _.shuffle(deck[i].hexes);
        }
        for (let i = 0; i < size; i++) {
        }
        deck = _.shuffle(deck);
        return deck;
    }

    pickNextTrihex() {
        if (this.trihexDeck.length > 0) {
            this.nextTrihex = this.trihexDeck.pop();
        } else {
            this.nextTrihex = new Trihex(0, 0, 0, 'a');
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
        this.rotateNextTrihex();
    }

    update(time: number, delta: number) {
        super.update(time, delta);
    }
}

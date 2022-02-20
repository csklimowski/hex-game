import * as _ from 'lodash';


// from lodash
function copyArray(source: any[], array?: any[]) {
    let index = -1
    const length = source.length

    array || (array = new Array(length))
    while (++index < length) {
        array[index] = source[index]
    }
    return array
}

// from lodash
function shuffle(array) {
    const length = array == null ? 0 : array.length
    if (!length) {
      return []
    }
    let index = -1
    const lastIndex = length - 1
    const result = copyArray(array)
    while (++index < length) {
      const rand = index + Math.floor(Math.random() * (lastIndex - index + 1))
      const value = result[rand]
      result[rand] = result[index]
      result[index] = value
    }
    return result
}

class Queue<Type> {

    data: Map<number, Type>;
    head: number;
    tail: number;

    constructor() {
        this.data = new Map<number, Type>();
        this.head = 0;
        this.tail = 0;
    }

    enq(item: Type) {
        this.data.set(this.tail, item);
        this.tail++;
    }

    deq(): Type {
        if (this.data.has(this.head)) {
            let item = this.data.get(this.head);
            this.data.delete(this.head);
            this.head++;
            return item;
        } else {
            return null;
        }
    }

    size(): number {
        return this.tail - this.head;
    }
}


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

    row: number;
    col: number;
    hexType: number;
    hasHill: boolean;

    counted: boolean;
    // streets and ports are counted when they're connected to the center
    // parks are counted in batches of 3, check when new ones are added to the group
    // windmills are counted when placed; and can be uncounted if a new one is placed

    eEdge: Phaser.GameObjects.Image;
    neEdge: Phaser.GameObjects.Image;
    nwEdge: Phaser.GameObjects.Image;
    wEdge: Phaser.GameObjects.Image;
    swEdge: Phaser.GameObjects.Image;
    seEdge: Phaser.GameObjects.Image;
    propeller: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, row: number, col: number) {
        let x = getX(row, col);
        let y = getY(row, col);
        super(scene, x, y, 'empty');
        
        this.setScale(0.5);
        scene.add.existing(this);
        // this.setTint(0xd6d1b1)
        this.row = row;
        this.col = col;
        this.hexType = 0;
        this.hasHill = false;
        this.counted = false;

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
        this.eEdge.setDepth(1);
        this.neEdge.setDepth(1);
        this.nwEdge.setDepth(1);
        this.wEdge.setDepth(1);
        this.swEdge.setDepth(1);
        this.seEdge.setDepth(1);

        this.eEdge.setScale(0.5);
        this.neEdge.setScale(0.5);
        this.nwEdge.setScale(0.5);
        this.wEdge.setScale(0.5);
        this.swEdge.setScale(0.5);
        this.seEdge.setScale(0.5);

        this.propeller = scene.add.image(x, y, 'propeller');
        this.propeller.setScale(0.5);
        this.propeller.setVisible(false);
        this.propeller.setDepth(2);
    }

    setX(x: number) {
        super.setX(x);
        this.eEdge.setX(x);
        this.neEdge.setX(x);
        this.nwEdge.setX(x);
        this.wEdge.setX(x);
        this.swEdge.setX(x);
        this.seEdge.setX(x);
        this.propeller.setX(x);
        return this;
    }

    setY(y: number) {
        super.setY(y);
        this.eEdge.setY(y);
        this.neEdge.setY(y);
        this.nwEdge.setY(y);
        this.wEdge.setY(y);
        this.swEdge.setY(y);
        this.seEdge.setY(y);
        this.propeller.setY(y);
        return this;
    }

    embiggen() {
        this.eEdge.setScale(1);
        this.neEdge.setScale(1);
        this.nwEdge.setScale(1);
        this.wEdge.setScale(1);
        this.swEdge.setScale(1);
        this.seEdge.setScale(1);
        this.eEdge.setAlpha(1);
        this.neEdge.setAlpha(1);
        this.nwEdge.setAlpha(1);
        this.wEdge.setAlpha(1);
        this.swEdge.setAlpha(1);
        this.seEdge.setAlpha(1);
        this.propeller.setScale(1);
        this.setScale(1);
    }

    setType(hexType: number) {
        this
        this.setTexture(['empty', 'windmill', 'grass', 'street', 'center', 'port'][hexType]);
        this.hexType = hexType;
        if (hexType === 1) {
            this.propeller.setVisible(true);
            if (this.hasHill) {
                this.propeller.setY(this.y - 70*this.scale);
                this.setTexture('windmill-hill');
            } else {
                this.propeller.setY(this.y - 30*this.scale);
            }
        } else {
            this.propeller.setVisible(false);
        }

        if (hexType === 5) {
            this.eEdge.setVisible(false);
            this.neEdge.setVisible(false);
            this.seEdge.setVisible(false);
            this.wEdge.setVisible(false);
            this.nwEdge.setVisible(false);
            this.swEdge.setVisible(false);
        }
    }

    setHill(hasHill: boolean) {
        this.hasHill = hasHill;
        if (hasHill) this.setTexture('empty-hill');
    }

    update(time: number, delta: number) {
        if (this.propeller.visible) {
            let speed = (this.hasHill && this.counted) ? 2 : this.counted ? 1 : 0.1;
            this.propeller.setAngle(this.propeller.angle + speed*0.1*delta)
        }
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

    rotateLeft() {
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

class ScorePopper extends Phaser.GameObjects.BitmapText {
    points: number;
    hexes: Hex[];

    constructor(scene: Phaser.Scene, hexes: Hex[], points: number) {
        // find avg position
        let xSum = 0;
        let ySum = 0;
        for (let h of hexes) {
            xSum += h.x;
            ySum += h.y;
        }

        super(scene, xSum / hexes.length, ySum / hexes.length, 'font', points > 0 ? ('+' + String(points)) : String(points), 40);
        scene.add.existing(this);
        this.points = points;
        this.setScale(Math.max(1, 0.9 + 0.1*points));
        this.setAlpha(0);
        this.setOrigin(0.5);
        this.hexes = hexes;
    }

    pop() {
        this.setAlpha(1);
        this.scene.tweens.add({
            targets: this,
            props: {
                alpha: 0,
                y: this.y - HEX_HEIGHT*2
            },
            duration: 2000,
        });
    }
}

class HexGrid extends Phaser.GameObjects.Group {

    grid: Matrix2D<Hex>;
    hexes: Hex[];
    preview: Phaser.GameObjects.Image;
    triPreviews: Phaser.GameObjects.Image[];

    scoreText: Phaser.GameObjects.BitmapText;
    score: number;
    scoreQueue: Queue<ScorePopper>

    size: number;

    constructor(scene: Phaser.Scene, size: number, hills: number) {
        super(scene);

        this.grid = new Matrix2D<Hex>();
        this.hexes = [];
        this.size = size;

        this.scoreText = scene.add.bitmapText(900, 100, 'font', '0', 80);
        this.score = 0;

        this.scoreQueue = new Queue<ScorePopper>();
        
        for (let r = 0; r < size + size + 1; r++) {
            for (let c = 0; c < size + size + 1; c++) {
                if (c + r < size || c + r > size*3) {
                    continue;
                } else {
                    let h = new Hex(scene, r, c);
                    this.add(h);
                    this.grid.set(r, c, h);
                    this.hexes.push(h);
                }
            }
        }

        this.grid.get(0, size).setType(5);
        this.grid.get(0, size).setAngle(-60);
        this.grid.get(0, size*2).setType(5);
        
        this.grid.get(size, 0).setType(5);
        this.grid.get(size, 0).setAngle(-120);
        this.grid.get(size, size*2).setType(5);
        this.grid.get(size, size*2).setAngle(60);

        this.grid.get(size, size).setType(4);

        this.grid.get(size*2, 0).setType(5);
        this.grid.get(size*2, 0).setAngle(-180);
        this.grid.get(size*2, size).setType(5);
        this.grid.get(size*2, size).setAngle(120);

        let placed = 0;
        while (placed < hills) {
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
            p.setScale(0.5);
            p.setAlpha(0.5);
            // p.setVisible(false);
            this.triPreviews.push(p);
        }

        scene.time.addEvent({
            repeat: -1,
            callback: this.nextPopper,
            callbackScope: this,
            delay: 100
        });
    }

    updateEdges() {
        for (let r = 0; r < this.size + this.size + 1; r++) {
            for (let c = 0; c < this.size + this.size + 1; c++) {
                if (this.grid.has(r, c)) {
                    let h = this.grid.get(r, c);

                    if (this.grid.has(r, c+1) && this.grid.get(r, c+1).hexType !== 5) h.eEdge.setAlpha(0);
                    else h.eEdge.setAlpha(1);

                    if (this.grid.has(r-1, c+1) && this.grid.get(r-1, c+1).hexType !== 5) h.neEdge.setAlpha(0);
                    else h.neEdge.setAlpha(1);

                    if (this.grid.has(r-1, c) && this.grid.get(r-1, c).hexType !== 5) h.nwEdge.setAlpha(0);
                    else h.nwEdge.setAlpha(1);

                    if (this.grid.has(r, c-1) && this.grid.get(r, c-1).hexType === h.hexType) h.wEdge.setAlpha(0.4);
                    else h.wEdge.setAlpha(1);

                    if (this.grid.has(r+1, c-1) && this.grid.get(r+1, c-1).hexType === h.hexType) h.swEdge.setAlpha(0.4);
                    else h.swEdge.setAlpha(1);

                    if (this.grid.has(r+1, c) && this.grid.get(r+1, c).hexType === h.hexType) h.seEdge.setAlpha(0.4);
                    else h.seEdge.setAlpha(1);
                }
            }
        }
    }

    neighbors(row: number, col: number) {
        return [
            this.grid.get(row, col+1),
            this.grid.get(row-1, col+1),
            this.grid.get(row-1, col),
            this.grid.get(row, col-1),
            this.grid.get(row+1, col-1),
            this.grid.get(row+1, col)
        ]
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
        let touching = false;
        for (let i = 0; i < 3; i++) {
            let offsets = shapes[trihex.shape][i];
            hexes.push(this.grid.get(r + offsets.ro, c + offsets.co));
            this.triPreviews[i].setX(getX(r + offsets.ro, c + offsets.co));
            this.triPreviews[i].setY(getY(r + offsets.ro, c + offsets.co));


            if (!touching) {
                for (let n of this.neighbors(r + offsets.ro, c + offsets.co)) {
                    if (n && (n.hexType === 1 || n.hexType === 2 || n.hexType === 3 || n.hexType === 4)) {
                        touching = true;
                        break;
                    }
                }
            }
        }

        if (touching && hexes[0] && hexes[0].hexType === 0 &&
            hexes[1] && hexes[1].hexType === 0 &&
            hexes[2] && hexes[2].hexType === 0) {
            for (let i = 0; i < 3; i++) {
                
                this.triPreviews[i].setTexture(['white', 'windmill-bw', 'grass-bw', 'street-bw'][trihex.hexes[i]]);
            }
        } else {
            for (let i = 0; i < 3; i++) {
                this.triPreviews[i].setTexture(['white', 'windmill-red', 'grass-red', 'street-red'][trihex.hexes[i]]);
            }
        }
    }

    placeTrihex(x: number, y: number, trihex: Trihex): boolean {
        if (trihex.shape === 'a') {
            y -= HEX_HEIGHT/2;
        }
        if (trihex.shape === 'v') {
            y -= HEX_HEIGHT/2;
            x -= HEX_WIDTH/2;
        }
        let r = getRow(x, y);
        let c = getCol(x, y);

        let hexes: Hex[] = [];
        let touching = false;
        for (let i = 0; i < 3; i++) {
            let offsets = shapes[trihex.shape][i];
            hexes.push(this.grid.get(r + offsets.ro, c + offsets.co));

            if (!touching) {
                for (let n of this.neighbors(r + offsets.ro, c + offsets.co)) {
                    if (n && (n.hexType === 1 || n.hexType === 2 || n.hexType === 3 || n.hexType === 4)) {
                        touching = true;
                        break;
                    }
                }
            }
        }
        if (touching && hexes[0] && hexes[0].hexType === 0 &&
            hexes[1] && hexes[1].hexType === 0 &&
            hexes[2] && hexes[2].hexType === 0) {

            for (let i = 0; i < 3; i++) {
                hexes[i].setType(trihex.hexes[i])
            }

            // calculate scores
            for (let i = 0; i < 3; i++) {
                this.getPointsFor(hexes[i]);
            }

            this.updateEdges();
            return true;
        } else {
            return false;
        }
    }

    // returns connected hexes INCLUDING itself
    getConnected(hex: Hex): Hex[] {
        let connectedHexes = [];
        let visited = new Set<Hex>();
        let queue = new Queue<Hex>();
        queue.enq(hex);

        while(queue.size() > 0) {
            let h = queue.deq();
            visited.add(h);
            connectedHexes.push(h);

            for (let n of this.neighbors(h.row, h.col)) {
                if (n && (n.hexType === h.hexType || (h.hexType === 3 && n.hexType === 5)) && !visited.has(n)) {
                    queue.enq(n);
                }
            }
        }

        return connectedHexes;
    }

    getPointsFor(hex: Hex) {
        if (hex.counted) return;

        if (hex.hexType === 1) {
            let isolated = true;
            for (let h of this.neighbors(hex.row, hex.col)) {
                if (h && h.hexType === 1) {
                    isolated = false;
                    if (h.counted) {
                        h.counted = false;
                        this.scoreQueue.enq(new ScorePopper(this.scene, [h], h.hasHill ? -3 : -1));
                    }
                }
            }
            if (isolated) {
                this.scoreQueue.enq(new ScorePopper(this.scene, [hex], hex.hasHill ? 3 : 1));
                hex.counted = true;
            }
        } else if (hex.hexType === 2) {
            let group = this.getConnected(hex);
            let uncountedParks = [];
            for (let park of group) {
                if (!park.counted) uncountedParks.push(park);
            }
            while (uncountedParks.length >= 3) {
                let newParks = uncountedParks.splice(0, 3);
                newParks[0].counted = true;
                newParks[0].setTexture('tree');
                newParks[1].counted = true;
                newParks[1].setTexture('tree');
                newParks[2].counted = true;
                newParks[2].setTexture('tree');
                this.scoreQueue.enq(new ScorePopper(this.scene, newParks, 5));
            }
        } else if (hex.hexType === 3) {
            for (let h of this.neighbors(hex.row, hex.col)) {
                if (h && h.hexType === 4 && !hex.counted) {
                    this.scoreQueue.enq(new ScorePopper(this.scene, [hex], 1));
                    hex.counted = true;
                }
            }
            let group = this.getConnected(hex);
            let connectedToCenter = false;
            for (let h of group) {
                if (h.hexType === 3 && h.counted) connectedToCenter = true;
            }
            if (connectedToCenter) {
                for (let h of group) {
                    if (!h.counted) {
                        this.scoreQueue.enq(new ScorePopper(this.scene, [h], h.hexType === 5 ? 3 : 1));
                        h.counted = true;
                    }
                }
            }
        }
    }

    nextPopper() {
        if (this.scoreQueue.size() > 0) {
            let p = this.scoreQueue.deq();
            p.pop();
            this.score += p.points;
            this.scoreText.setText(String(this.score));
            console.log('pop!')
            if (p.hexes && p.hexes[0].hexType === 3) {
                p.hexes[0].setTexture('house');
            }

            if (p.hexes && p.hexes[0].hexType === 5) {
                p.hexes[0].setTexture('port-color');
            }
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
    bigPreviewTrihex: Hex[];

    constructor() {
        super('main');
    }

    create() {

        this.add.image(640, 360, 'background');

        // small = 4
        // large = 5
        this.grid = new HexGrid(this, 5, 8);
        // this.grid = new HexGrid(this, 4, 5);

        // small = 16
        // large = 25
        this.trihexDeck = this.createTrihexDeck(25, true);
        // this.trihexDeck = this.createTrihexDeck(16, false);

        this.pickNextTrihex();

        this.bigPreviewTrihex = [];
        for (let i = 0; i < 3; i++) {
            let offsets = shapes[this.nextTrihex.shape];
            

            let h = new Hex(this, -1, -1);
            h.embiggen();
            
            this.bigPreviewTrihex.push(h);
        }
        this.updateBigTrihex();


        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onKeyDown, this);

        // this.input.mouse.on(Phaser.Input.MOUSE_WHEEL, this.onMouseWheel, this);
        this.input.on('wheel', this.onMouseWheel, this);
    }

    onMouseWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        if (deltaY > 0) {
            this.rotateNextTrihex(false);
        }
        if (deltaY < 0) {
            this.rotateNextTrihex(true);
        }
    }

    rotateNextTrihex(counterClockwise?: boolean) {
        this.nextTrihex.rotateRight();

        this.grid.updateTriPreview(this.input.activePointer.worldX, this.input.activePointer.worldY, this.nextTrihex);
        this.updateBigTrihex();
    }

    updateBigTrihex() {
        for (let i = 0; i < 3; i++) {
            let row = shapes[this.nextTrihex.shape][i].ro;
            let col = shapes[this.nextTrihex.shape][i].co;

            this.bigPreviewTrihex[i].setX(950 + HEX_WIDTH*2*(col + 0.5*row))
            this.bigPreviewTrihex[i].setY(325 + HEX_HEIGHT*1.5*row)

            this.bigPreviewTrihex[i].setType(this.nextTrihex.hexes[i]);
        }
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
        deck = shuffle(deck);
        for (let i = 0; i < size; i++) {
            if (i < size/2) {
                deck[i].hexes[0] = 3;
            } else {
                deck[i].hexes[0] = 1;
            }
        }
        deck = shuffle(deck);
        for (let i = 0; i < size; i++) {
            if (i < size/2) {
                deck[i].hexes[1] = 3;
            } else {
                deck[i].hexes[1] = 2;
            }
        }
        deck = shuffle(deck);
        for (let i = 0; i < size; i++) {
            if (i < size/2) {
                deck[i].hexes[2] = 3;
            } else {
                deck[i].hexes[2] = 2;
            }
            deck[i].hexes = shuffle(deck[i].hexes);
        }
        for (let i = 0; i < size; i++) {
        }
        deck = shuffle(deck);
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
        if (this.grid.placeTrihex(event.worldX, event.worldY, this.nextTrihex)) {
            this.pickNextTrihex();
            this.updateBigTrihex();
        }
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

        for (let hex of this.grid.hexes) {
            hex.update(time, delta);
        }
    }
}

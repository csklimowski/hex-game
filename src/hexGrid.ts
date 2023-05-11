import { Queue, Matrix2D } from './util';



export const shapes = {
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
};

export const rotations = {
    'a': ['a', 'v'],
    'v': ['a', 'v'],
    '\\': ['\\', '-', '/'],
    '-': ['\\', '-', '/'],
    '/': ['\\', '-', '/'],
    'c': ['c', 'r', 'n', 'd', 'j', 'l'],
    'r': ['c', 'r', 'n', 'd', 'j', 'l'],
    'n': ['c', 'r', 'n', 'd', 'j', 'l'],
    'd': ['c', 'r', 'n', 'd', 'j', 'l'],
    'j': ['c', 'r', 'n', 'd', 'j', 'l'],
    'l': ['c', 'r', 'n', 'd', 'j', 'l']
};

export class Hex extends Phaser.GameObjects.Image {

    row: number;
    col: number;
    hexType: number;
    hasHill: boolean;

    counted: boolean;
    upgraded: boolean;

    puffer: Phaser.GameObjects.Particles.ParticleEmitter;
    // streets and ports are counted when they're connected to the center
    // parks are counted in batches of 3, check when new ones are added to the group
    // windmills are counted when placed; and can be uncounted if a new one is placed

    eEdge: Phaser.GameObjects.Image;
    neEdge: Phaser.GameObjects.Image;
    nwEdge: Phaser.GameObjects.Image;
    wEdge: Phaser.GameObjects.Image;
    swEdge: Phaser.GameObjects.Image;
    seEdge: Phaser.GameObjects.Image;
    edges: Phaser.GameObjects.Group;
    propeller: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, row: number, col: number, particleManager?: Phaser.GameObjects.Particles.ParticleEmitter) {
        super(scene, x, y, 'empty');
        
        this.setScale(0.5);
        scene.add.existing(this);
        // this.setTint(0xd6d1b1)
        this.row = row;
        this.col = col;
        this.hexType = 0;
        this.hasHill = false;
        this.counted = false;
        this.upgraded = false;

        this.eEdge = scene.add.image(x, y, 'edge-e');
        this.neEdge = scene.add.image(x, y, 'edge-ne');
        this.nwEdge = scene.add.image(x, y, 'edge-nw');
        this.wEdge = scene.add.image(x, y, 'edge-w');
        this.swEdge = scene.add.image(x, y, 'edge-sw');
        this.seEdge = scene.add.image(x, y, 'edge-se');
        this.edges = scene.add.group([this.eEdge, this.neEdge, this.nwEdge, this.wEdge, this.swEdge, this.seEdge])
        this.edges.setDepth(1);
        this.edges.setAlpha(1);

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

        
        this.puffer = scene.add.particles(0, 0, 'particle', {
            lifespan: 1000,
            speed: { min: 3, max: 20 },
            angle: { min: 0, max: 360 },
            scale: 2,
            quantity: 20,
            emitting: false,
            alpha: { start: 1, end: 0},
            emitZone: {
                type: 'random',
                source: new Phaser.Geom.Rectangle(-25, -25, 50, 50),
                quantity: 20
            },
        });
        this.puffer.setDepth(1);
    }

    puff() {
        this.puffer.emitParticleAt(this.x, this.y, 10); 
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
        this.eEdge.setScale(0.75);
        this.neEdge.setScale(0.75);
        this.nwEdge.setScale(0.75);
        this.wEdge.setScale(0.75);
        this.swEdge.setScale(0.75);
        this.seEdge.setScale(0.75);
        this.edges.setAlpha(1);
        this.edges.setDepth(5);
        this.propeller.setDepth(6);
        this.propeller.setScale(0.75);
        this.setScale(0.75);
    }

    setType(hexType: number) {
        this.setTexture(['empty', 'windmill', 'grass', 'street', 'center', 'port-bw'][hexType]);
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

        if (hexType === 1) {
            this.puffer.setParticleTint(0xffffff);
        } else if (hexType === 2) {
            this.puffer.setParticleTint(0x408A0F);
        } else if (hexType === 3) {
            this.puffer.setParticleTint(0xAE482C);
        } else if (hexType === 5) {
            this.puffer.setParticleTint(0x3B80A6);
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

    upgrade() {
        this.upgraded = true;
        if (this.hexType === 2) {
            this.setTexture('tree');
        } else if (this.hexType === 3) {
            this.setTexture('house');
        } else if (this.hexType === 5) {
            this.setTexture('port');
        }
    }

    setSketchy(isSketchy: boolean) {
        if (isSketchy) {
            if (this.hexType === 0) {
                this.setTexture('empty');
            } else if (this.hexType === 1) {
                if (this.hasHill) this.setTexture('windmill-hill-bw');
                else this.setTexture('windmill-bw');
                this.propeller.setVisible(false);
            } else if (this.hexType === 2) {
                if (this.upgraded) this.setTexture('tree-bw');
                else this.setTexture('grass-bw');
            } else if (this.hexType === 3) {
                if (this.upgraded) this.setTexture('house-bw');
                else this.setTexture('street-bw')
            } else if (this.hexType === 4) {
                this.setTexture('center-bw');
            } else if (this.hexType === 5) {
                this.setTexture('port-bw');
            }
        } else {
            this.setAlpha(1);
            if (this.hexType === 0) {
                this.setTexture('empty');
            } else if (this.hexType === 1) {
                if (this.hasHill) this.setTexture('windmill-hill');
                else this.setTexture('windmill');
                this.propeller.setVisible(true);
            } else if (this.hexType === 2) {
                if (this.upgraded) this.setTexture('tree');
                else this.setTexture('grass');
            } else if (this.hexType === 3) {
                if (this.upgraded) this.setTexture('house');
                else this.setTexture('street');
            } else if (this.hexType === 4) {
                this.setTexture('center');
            } else if (this.hexType === 5) {
                if (this.upgraded) this.setTexture('port');
                else this.setTexture('port-bw');
            }
        }
    }

    update(time: number, delta: number) {
        if (this.propeller.visible) {
            let speed = (this.hasHill && this.counted) ? 2.2 : this.counted ? 1 : 0.1;
            this.propeller.setAngle(this.propeller.angle + speed*0.1*delta)
        }
    }
}

export class Trihex {
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
            let temp = this.hexes[1];
            this.hexes[1] = this.hexes[2];
            this.hexes[2] = temp;
        } else if (this.shape === 'v') {
            this.shape = 'a';
            let temp = this.hexes[0];
            this.hexes[0] = this.hexes[1];
            this.hexes[1] = temp;
        } else if (this.shape === '\\') {
            this.shape = '-';
        } else if (this.shape === '/') {
            this.shape = '\\';
        } else if (this.shape === '-') {
            this.shape = '/';
            let temp = this.hexes[0];
            this.hexes[0] = this.hexes[2];
            this.hexes[2] = temp;
        } else if (this.shape === 'c') {
            this.shape = 'l';
        } else if (this.shape === 'r') {
            this.shape = 'c';
        } else if (this.shape === 'n') {
            this.shape = 'r';
            let temp = this.hexes[0];
            this.hexes[0] = this.hexes[2];
            this.hexes[2] = temp;
        } else if (this.shape === 'd') {
            this.shape = 'n';
        } else if (this.shape === 'j') {
            this.shape = 'd';
        } else if (this.shape === 'l') {
            this.shape = 'j';
            let temp = this.hexes[0];
            this.hexes[0] = this.hexes[2];
            this.hexes[2] = temp;
        }
    }
}

export class HexGrid extends Phaser.GameObjects.Group {

    grid: Matrix2D<Hex>;
    hexes: Hex[];
    triPreviews: Phaser.GameObjects.Image[];
    enabled: boolean;

    scoreText: Phaser.GameObjects.BitmapText;
    scoreQueue: Queue<ScorePopper>
    onQueueEmpty: () => void;

    onNewPoints: (score: number, hexType: number) => void;

    size: number;

    x: number;
    y: number;

    constructor(scene: Phaser.Scene, size: number, hills: number, x?: number, y?: number, onNewPoints?: (score: number, hexType: number) => void) {
        super(scene);

        this.enabled = true;

        this.grid = new Matrix2D<Hex>();
        this.hexes = [];
        this.size = size;
        
        this.onNewPoints = onNewPoints;

        this.x = x || 0;
        this.y = y || 0;

        this.scoreQueue = new Queue<ScorePopper>();
        
        for (let r = 0; r < size + size + 1; r++) {
            for (let c = 0; c < size + size + 1; c++) {
                if (c + r < size || c + r > size*3) {
                    continue;
                } else {
                    let h = new Hex(scene, getX(r, c) + this.x, getY(r, c) + this.y, r, c);
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

        this.triPreviews = [];
        for (let i = 0; i < 3; i++) {
            let p = scene.add.image(-200, -200, 'white');
            p.setScale(0.5);
            p.setAlpha(0.5);
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

                    if (this.grid.has(r, c-1) && (this.grid.get(r, c-1).hexType === h.hexType || (h.hexType === 4 && this.grid.get(r, c-1).hexType === 3) || (h.hexType === 3 && this.grid.get(r, c-1).hexType === 4))) h.wEdge.setAlpha(0.4);
                    else h.wEdge.setAlpha(1);

                    if (this.grid.has(r+1, c-1) && (this.grid.get(r+1, c-1).hexType === h.hexType || (h.hexType === 4 && this.grid.get(r+1, c-1).hexType === 3) || (h.hexType === 3 && this.grid.get(r+1, c-1).hexType === 4))) h.swEdge.setAlpha(0.4);
                    else h.swEdge.setAlpha(1);

                    if (this.grid.has(r+1, c) && (this.grid.get(r+1, c).hexType === h.hexType || (h.hexType === 4 && this.grid.get(r+1, c).hexType === 3) || (h.hexType === 3 && this.grid.get(r+1, c).hexType === 4))) h.seEdge.setAlpha(0.4);
                    else h.seEdge.setAlpha(1);
                }
            }
        }
    }

    sinkBlanks() {

        this.scene.sound.play('splash', {volume: 0.75});

        for (let h of this.hexes) {
            if (h.hexType === 0 || (h.hexType === 5 && !h.counted))  {
                h.puffer.setParticleTint(0x3B80A6);
                h.puff();
                h.setVisible(false);
                h.edges.setVisible(false);
                this.grid.delete(h.row, h.col);
            }
        }

        this.grid.get(0, this.size)?.setFrame(
            (this.grid.has(1, this.size-1) ? 4 : 0) +
            (this.grid.has(1, this.size) ? 2 : 0) +
            (this.grid.has(0, this.size+1) ? 1 : 0)
        );

        this.grid.get(this.size, 0)?.setFrame(
            (this.grid.has(this.size+1, 0) ? 4 : 0) +
            (this.grid.has(this.size, 1) ? 2 : 0) +
            (this.grid.has(this.size-1, 1) ? 1 : 0)
        );

        this.grid.get(0, this.size*2)?.setFrame(
            (this.grid.has(0, this.size*2-1) ? 4 : 0) +
            (this.grid.has(1, this.size*2-1) ? 2 : 0) +
            (this.grid.has(1, this.size*2) ? 1 : 0)
        );

        this.grid.get(this.size, this.size*2)?.setFrame(
            (this.grid.has(this.size-1, this.size*2) ? 4 : 0) +
            (this.grid.has(this.size, this.size*2-1) ? 2 : 0) +
            (this.grid.has(this.size+1, this.size*2-1) ? 1 : 0)
        );

        this.grid.get(this.size*2, 0)?.setFrame(
            (this.grid.has(this.size*2, 1) ? 4 : 0) +
            (this.grid.has(this.size*2-1, 1) ? 2 : 0) +
            (this.grid.has(this.size*2-1, 0) ? 1 : 0)
        );

        this.grid.get(this.size*2, this.size)?.setFrame(
            (this.grid.has(this.size*2-1, this.size+1) ? 4 : 0) +
            (this.grid.has(this.size*2-1, this.size) ? 2 : 0) +
            (this.grid.has(this.size*2, this.size-1) ? 1 : 0)
        );

        this.updateEdges();
    }

    canPlaceShape(shape: string) {
        for (let hex of this.hexes) {
            if (hex.hexType === 0) {
                for (let rotation of rotations[shape]) {
                    let canPlaceHere = true;
                    for (let offsets of shapes[rotation]) {
                        let r = hex.row + offsets.ro;
                        let c = hex.col + offsets.co;
                        if (!(this.grid.has(r, c) && this.grid.get(r, c).hexType === 0)) {
                            canPlaceHere = false;
                        }
                    }
                    if (canPlaceHere) return true;
                }
            }
        }
        return false;
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

    deactivate() {
        this.enabled = false;
        this.triPreviews[0].setVisible(false);
        this.triPreviews[1].setVisible(false);
        this.triPreviews[2].setVisible(false);
    }

    activate() {
        this.enabled = true;
        this.triPreviews[0].setVisible(true);
        this.triPreviews[1].setVisible(true);
        this.triPreviews[2].setVisible(true);
    }

    updateTriPreview(x: number, y: number, trihex: Trihex) {
        if (!this.enabled) return;
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

            this.scene.sound.play('place');

            for (let i = 0; i < 3; i++) {
                hexes[i].setType(trihex.hexes[i])
            }

            // calculate scores
            for (let i = 0; i < 3; i++) {
                if (hexes[i].hexType === 1) {
                    this.getPointsFor(hexes[i]);
                }
            }
            for (let i = 0; i < 3; i++) {
                if (hexes[i].hexType !== 1) {
                    this.getPointsFor(hexes[i]);
                }
            }

            this.updateEdges();
            return true;
        } else {
            return false;
        }
    }

    addHex(row: number, col: number, type: number) {



    }

    // returns connected hexes INCLUDING itself
    getConnected(hex: Hex): Hex[] {
        let connectedHexes = [];
        let visited = new Set<Hex>();
        let queue = new Queue<Hex>();
        queue.enq(hex);

        while(queue.size() > 0) {
            let h = queue.deq();
            if (!visited.has(h)) connectedHexes.push(h);
            visited.add(h)

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
                newParks[1].counted = true;
                newParks[2].counted = true;
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
            
            if (this.onNewPoints) {
                this.onNewPoints(p.points, p.hexes[0].hexType);
            }

            for (let h of p.hexes) {
                h.upgrade();
                if (p.points > 0) h.puff();
            }

            if (p.points > 0) {
                if (p.hexes[0].hexType === 3) {
                    this.scene.sound.play('pop', {volume: 0.5});
                }
                if (p.hexes[0].hexType === 2) {
                    this.scene.sound.play('tree', {volume: 0.5});
                }
                if (p.hexes[0].hexType === 1) {
                    if (p.hexes[0].hasHill) {
                        this.scene.sound.play('windmill-hill', {volume: 0.6});
                    } else {
                        this.scene.sound.play('windmill', {volume: 0.6});
                    }
                }
                if (p.hexes[0].hexType === 5) {
                    this.scene.sound.play('port', {volume: 0.9});
                }
            }
        } else if (this.onQueueEmpty) {
            this.onQueueEmpty();
            this.onQueueEmpty = null;
        }
    }
}

export const HEX_HEIGHT = 70;
export const HEX_WIDTH = HEX_HEIGHT*.8660254;

export function getY(row, col) {
    return 100 + row*HEX_HEIGHT*0.75;
}

export function getX(row, col) {
    return (col + 0.5*row)*HEX_WIDTH - 50;
}

export function getRow(x, y) {
    return Math.floor((y - 100 + 0.4*HEX_HEIGHT)/(HEX_HEIGHT*0.75));
}

export function getCol(x, y) {
    return Math.floor((x + 50 + 0.5*HEX_WIDTH)/HEX_WIDTH - 0.5*getRow(x, y));
}

export class ScorePopper extends Phaser.GameObjects.BitmapText {
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
        this.setDepth(5);
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
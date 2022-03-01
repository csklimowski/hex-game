import { HexGrid, Trihex, shapes, Hex, HEX_HEIGHT, HEX_WIDTH } from './hexGrid';
import { Button, shuffle } from './util';

export class MainScene extends Phaser.Scene {

    grid: HexGrid;

    nextType: number;
    nextTrihex: Trihex;
    nextNextTrihex: Trihex;
    trihexDeck: Trihex[];
    bigPreviewTrihex: Hex[];
    bigPreviewContainer: Phaser.GameObjects.Container;
    deckCounterImage: Phaser.GameObjects.Image;
    deckCounterText: Phaser.GameObjects.BitmapText;
    rotateLeftButton: Button;
    rotateRightButton: Button;

    scoreText: Phaser.GameObjects.BitmapText;
    waves: Phaser.GameObjects.Image;
    waves2: Phaser.GameObjects.Image;

    constructor() {
        super('main');
    }

    create() {

        this.waves = this.add.image(640, 360, 'waves');
        this.waves2 = this.add.image(640, 360, 'waves2');

        this.scoreText = this.add.bitmapText(940, 30, 'font', 'Score: 0', 70);
        this.scoreText.setDepth(4);

        // small = 4
        // large = 5
        this.grid = new HexGrid(this, 5, 8, 0, 0, this.onScoreUpdate.bind(this));
        // this.grid = new HexGrid(this, 4, 5);

        // small = 16
        // large = 25
        this.trihexDeck = this.createTrihexDeck(25, true);
        // this.trihexDeck = this.createTrihexDeck(16, false);
        
        this.deckCounterImage = this.add.image(950, 620, 'a-shape');
        this.deckCounterImage.setDepth(3.5);
        this.deckCounterImage.setAlpha(0.5);
        this.deckCounterText = this.add.bitmapText(950, 620, 'font', String(this.trihexDeck.length), 50, )
        this.deckCounterText.setOrigin(0.5, 0.4);
        this.deckCounterText.setDepth(3.6);

        this.rotateLeftButton = new Button(this, 925, 180, 'rotate', this.rotateLeft.bind(this));
        this.rotateLeftButton.setDepth(3.5);
        this.rotateLeftButton.setFlipX(true);
        this.rotateRightButton = new Button(this, 1175, 180, 'rotate', this.rotateRight.bind(this));
        this.rotateRightButton.setDepth(3.5);
        
        
        this.bigPreviewContainer = this.add.container(1050, 325);
        this.bigPreviewContainer.setDepth(4);

        this.bigPreviewTrihex = [];
        for (let i = 0; i < 3; i++) {
            let h = new Hex(this, 0, 0, -1, -1);
            h.embiggen();
            h.setDepth(4);
            this.bigPreviewTrihex.push(h);
            this.bigPreviewContainer.add(h);
            this.bigPreviewContainer.add(h.edges.getChildren());
            this.bigPreviewContainer.add(h.propeller);
        }

        this.pickNextTrihex();



        let foreground = this.add.image(1000, 360, 'page');
        foreground.setDepth(3);
        this.tweens.add({
            targets: foreground,
            props: { x: 2080 },
            duration: 800
        })



        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onKeyDown, this);

        // this.input.mouse.on(Phaser.Input.MOUSE_WHEEL, this.onMouseWheel, this);
        this.input.on('wheel', this.onMouseWheel, this);
    }

    onScoreUpdate(score: number) {
        this.scoreText.setText("Score: " + String(score));
    }

    onMouseWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        if (deltaY > 0) {
            this.rotateRight();
        }
        if (deltaY < 0) {
            this.rotateLeft();
        }
    }

    rotateRight() {
        this.nextTrihex.rotateRight();
        this.grid.updateTriPreview(this.input.activePointer.worldX, this.input.activePointer.worldY, this.nextTrihex);
        this.updateBigTrihex();
    }

    rotateLeft() {
        this.nextTrihex.rotateLeft();
        this.grid.updateTriPreview(this.input.activePointer.worldX, this.input.activePointer.worldY, this.nextTrihex);
        this.updateBigTrihex();
    }

    updateBigTrihex() {
        for (let i = 0; i < 3; i++) {
            let row = shapes[this.nextTrihex.shape][i].ro;
            let col = shapes[this.nextTrihex.shape][i].co;

            this.bigPreviewTrihex[i].setX(HEX_WIDTH*1.5*(col + 0.5*row))
            this.bigPreviewTrihex[i].setY(HEX_HEIGHT*1.125*row)
            
            this.bigPreviewTrihex[i].setType(this.nextTrihex.hexes[i]);
            if (this.nextTrihex.hexes[i] === 0) this.bigPreviewTrihex[i].setVisible(false);
        }
    }

    createTrihexDeck(size: number, allShapes?: boolean): Trihex[] {
        let deck: Trihex[] = [];
        for (let i = 0; i < size; i++) {
            if (allShapes) {
                if (i < size/3) {
                    deck.push(new Trihex(0, 0, 0, 'c'));
                } else if (i < size/1.5) {
                    deck.push(new Trihex(0, 0, 0, '/'));
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
        deck = shuffle(deck);
        return deck;
    }

    pickNextTrihex() {
        if (this.trihexDeck.length > 0) {
            this.nextTrihex = this.trihexDeck.pop();

            this.deckCounterText.setText(String(this.trihexDeck.length));

            if (this.trihexDeck.length > 0) {
                this.deckCounterImage.setTexture({
                    'a': 'a-shape',
                    '/': 'slash-shape',
                    'c': 'c-shape'
                }[this.trihexDeck[this.trihexDeck.length-1].shape])
            } else {
                this.deckCounterImage.setVisible(false);
                this.deckCounterText.setText('');
            }
            this.updateBigTrihex();

            this.bigPreviewContainer.setPosition(this.deckCounterImage.x, this.deckCounterImage.y);
            this.bigPreviewContainer.setScale(0.2);

            this.tweens.add({
                targets: this.bigPreviewContainer,
                props: {
                    x: 1050,
                    y: 325,
                    scale: 1
                },
                duration: 400
            })

        } else {
            this.bigPreviewContainer.setVisible(false);
            this.nextTrihex = new Trihex(0, 0, 0, 'a');
        }
    }

    endGame() {
        this.grid.sinkBlanks();
        
    }

    onPointerDown(event) {
        if (this.grid.placeTrihex(event.worldX, event.worldY, this.nextTrihex)) {
            this.pickNextTrihex();
            
            if (this.nextTrihex.hexes[0] === 0 || !this.grid.canPlaceShape(this.nextTrihex.shape)) {
                this.time.addEvent({
                    callback: this.endGame,
                    callbackScope: this,
                    delay: 1000
                });
            }
        }
    }

    onPointerMove(event) {
        // this.grid.updatePreview(event.worldX, event.worldY, this.nextType);
        this.grid.updateTriPreview(event.worldX, event.worldY, this.nextTrihex);
    }

    onKeyDown(event) {
        if (event.keyCode === 39) {
            this.rotateRight();
        }
        if (event.keyCode === 37) {
            this.rotateLeft();
        }
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        for (let hex of this.grid.hexes) {
            hex.update(time, delta);
        }

        this.waves.setX(640 + Math.sin(time*0.001)*10);
        this.waves2.setX(640 - Math.sin(time*0.001)*10);
    }
}

let tutorialTexts = [
    "Place trios of hexes to grow your town\noutward from the TOWN CENTER\n\n\nTry to get the highest score you can!",
    "STREET hexes are worth 1 point each\nif they're connected to the Town Center\n\nAdditionally, every PORT that you\nconnect to the Town Hall with\nStreets is worth 3 points!",
    "WIND TURBINES are worth 1 point if\nthey're not adjacent to any other\nWind Turbines\n\nIf they are also placed on a HILL,\nthey're worth 3 points!",
    "Those are PARKS!\n\nEach group of connected Park hexes is\nworth 5 points for every 3 hexes in it",
    "Yep! To recap:\n- Streets want to connect Ports\nto the Town Center\n- Wind Turbines want to be alone and\non Hills\n- Parks want to be grouped in multiples\nof 3"
]

let tutorialTypes = [
    [1, 2, 3, 4, 5],
    [3, 4, 5],
    [1],
    [2],
    [1, 2, 3, 4, 5]
];

export class MenuScene extends Phaser.Scene {

    menu: Phaser.GameObjects.Group;
    background: Phaser.GameObjects.Image;
    tutorialGrid: HexGrid;
    tutorialText: Phaser.GameObjects.BitmapText;
    tutorialPage: number;
    tutorialButton: Button;

    constructor() {
        super('menu');
    }

    create() {
        this.cameras.main.setBounds(0, 0, 2560, 720);
        this.menu = this.add.group();

        this.background = this.add.image(720, 360, 'page');

        this.add.image(920, 360, 'blue');

        // let presents = this.add.bitmapText(640, 70, 'font', 'Chris Klimowski presents', 40);
        // presents.setOrigin(0.5);

        let title = this.add.bitmapText(50, 100, 'font', 'SIX-SIDED STREETS', 70);
        // title.setOrigin(0.5);
        this.menu.add(title);

        let byline = this.add.bitmapText(50, 190, 'font', 'a tile-laying game by Chris Klimowski', 40);
        // byline.setOrigin(0.5);
        this.menu.add(byline);
        // this.score = 0;

        let playButton = new Button(this, 300, 400, 'play-button', this.play.bind(this));
        this.menu.add(playButton);

        let howToPlayButton = new Button(this, 300, 550, 'how-to-play-button', this.howToPlay.bind(this));
        this.menu.add(howToPlayButton);

        let grid = new HexGrid(this, 3, 0, 700, 100);
        grid.grid.get(2, 2).setHill(true);
        grid.grid.get(4, 5).setHill(true);

        let tutorialGrid = [
            [null, null, null, 5,  3,  2,  5],
                [null, null, 2,  3,  2,  1,  3],
                    [null, 2,  1,  3,  2,  3,  3],
                        [5,  3,  2,  4,  2,  1,  5],
                          [2,  2,  2,  3,  3,  1, null],
                            [2,  2,  3,  1,  2, null, null],
                              [5,  3,  3,  5, null, null, null]
        ];

        this.tutorialPage = 0;
        this.tutorialText = this.add.bitmapText(1280, 200, 'font', tutorialTexts[0], 40);
        this.tutorialButton = new Button(this, 1265, 550, 'tutorial-button', this.nextTutorialPage.bind(this));
        this.tutorialButton.setOrigin(0, 0.5);

        for (let r = 0; r < tutorialGrid.length; r++) {
            for (let c = 0; c < tutorialGrid.length; c++) {
                if (grid.grid.has(r, c)) {
                    grid.grid.get(r, c).setType(tutorialGrid[r][c]);
                }
            }
        }

        grid.grid.get(0, 3).upgrade();
        grid.grid.get(0, 4).upgrade();
        grid.grid.get(0, 5).upgrade();
        grid.grid.get(1, 3).upgrade();
        grid.grid.get(1, 4).upgrade();
        grid.grid.get(1, 5).counted = true;
        grid.grid.get(2, 2).counted = true;
        grid.grid.get(2, 3).upgrade();
        grid.grid.get(2, 4).upgrade();
        grid.grid.get(3, 2).upgrade();
        grid.grid.get(4, 0).upgrade();
        grid.grid.get(4, 1).upgrade();
        grid.grid.get(4, 2).upgrade();
        grid.grid.get(4, 3).upgrade();
        grid.grid.get(4, 4).upgrade();
        grid.grid.get(5, 0).upgrade();
        grid.grid.get(5, 1).upgrade();
        grid.grid.get(5, 2).upgrade();
        grid.grid.get(5, 3).counted = true;
        grid.grid.get(6, 0).upgrade();
        grid.grid.get(6, 1).upgrade();
        grid.grid.get(6, 2).upgrade();
        grid.grid.get(6, 3).upgrade();

        grid.updateEdges();

        this.tutorialGrid = grid;
    }

    play() {
        this.scene.start('main');
    }

    howToPlay() {
        this.tutorialPage = -1;
        this.nextTutorialPage();
        this.cameras.main.pan(1270, 0, 1000, 'Power2');
    }

    nextTutorialPage() {
        this.tutorialPage += 1;
        if (this.tutorialPage >= 5) {
            this.cameras.main.pan(0, 0, 1000, 'Power2');
        } else {
            this.tutorialButton.setFrame(this.tutorialPage);
            this.tutorialText.setText(tutorialTexts[this.tutorialPage]);
            for (let hex of this.tutorialGrid.hexes) {
                hex.setSketchy(tutorialTypes[this.tutorialPage].indexOf(hex.hexType) === -1);
            }
        }
    }

    update(time: number, delta: number) {
        for (let hex of this.tutorialGrid.hexes) {
            hex.update(time, delta);
        }
    }
}
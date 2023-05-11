import { HexGrid, Trihex, shapes, Hex, HEX_HEIGHT, HEX_WIDTH } from './hexGrid';
import { Button, pick, shuffle } from './util';

export class MainScene extends Phaser.Scene {

    grid: HexGrid;

    foreground: Phaser.GameObjects.Image;
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
    openHelpButton: Button;
    closeHelpButton: Button;
    helpPage: Phaser.GameObjects.Image;
    score: number;
    scoreBreakdown: number[];
    scoreText: Phaser.GameObjects.BitmapText;
    waves: Phaser.GameObjects.Image;
    waves2: Phaser.GameObjects.Image;

    pointerDown: boolean;
    previewX: number;
    previewY: number;

    gameOverText: Phaser.GameObjects.BitmapText;
    rankText: Phaser.GameObjects.BitmapText;
    nextRankText: Phaser.GameObjects.BitmapText;
    playAgainButton: Button;

    breakdownContainer: Phaser.GameObjects.Container;
    breakdownHexes: Hex[];
    breakdownTexts: Phaser.GameObjects.BitmapText[];

    constructor() {
        super('main');
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x90C7E5);

        this.score = 0;
        this.scoreBreakdown = [0, 0, 0, 0, 0, 0];

        this.pointerDown = false;

        this.waves = this.add.image(640, 360, 'waves');
        this.waves2 = this.add.image(640, 360, 'waves2');
        
        this.grid = new HexGrid(this, 5, 8, 0, 0, this.onNewPoints.bind(this));
        this.trihexDeck = this.createTrihexDeck(25, true);

        this.scoreText = this.add.bitmapText(150, 30, 'font', '0 points', 60);
        this.scoreText.setDepth(4);
        
        this.rotateLeftButton = new Button(this, 125, 180, 'rotate', this.rotateLeft.bind(this));
        this.rotateLeftButton.setDepth(3.5);
        this.rotateLeftButton.setFlipX(true);
        this.rotateRightButton = new Button(this, 375, 180, 'rotate', this.rotateRight.bind(this));
        this.rotateRightButton.setDepth(3.5);

        this.openHelpButton = new Button(this, 410, 640, 'question', this.openHelp.bind(this));
        this.openHelpButton.setDepth(3.5);

        this.closeHelpButton = new Button(this, 1210, 640, 'x', this.closeHelp.bind(this));
        this.closeHelpButton.setDepth(5.1);
        this.closeHelpButton.setVisible(false);
        
        this.deckCounterText = this.add.bitmapText(240, 620, 'font', String(this.trihexDeck.length), 60)
        this.deckCounterText.setOrigin(0.5, 0.45);
        this.deckCounterText.setDepth(3.6);

        this.deckCounterImage = this.add.image(240, 620, 'a-shape');
        this.deckCounterImage.setDepth(3.5);
        this.deckCounterImage.setAlpha(0.5);
        
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

        this.helpPage = this.add.image(640, 360, 'help-page');
        this.helpPage.setDepth(5);
        this.helpPage.setVisible(false);

        this.pickNextTrihex();



        this.foreground = this.add.image(1600, 360, 'page');
        this.foreground.setDepth(3);

        this.tweens.add({
            targets: this.foreground,
            props: { x: 2400 },
            duration: 400
        });

        this.tweens.add({
            targets: this.rotateLeftButton,
            props: { x: this.rotateLeftButton.x + 800 },
            duration: 400
        });

        this.tweens.add({
            targets: this.openHelpButton,
            props: { x: this.openHelpButton.x + 800 },
            duration: 400
        });

        this.tweens.add({
            targets: this.rotateRightButton,
            props: { x: this.rotateRightButton.x + 800 },
            duration: 400
        });

        this.tweens.add({
            targets: this.scoreText,
            props: { x: this.scoreText.x + 800 },
            duration: 400
        });

        this.tweens.add({
            targets: [this.deckCounterText, this.deckCounterImage],
            props: { x: this.deckCounterText.x + 800 },
            duration: 400
        });

        this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
        this.input.on(Phaser.Input.Events.POINTER_UP, this.onPointerUp, this);
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onKeyDown, this);

        this.input.on('wheel', this.onMouseWheel, this);
    }

    onNewPoints(points: number, hexType: number) {
        this.score += points;
        this.scoreBreakdown[hexType] += points;
        this.scoreText.setText(String(this.score) + " points");
    }

    openHelp() {
        this.helpPage.setVisible(true);
        this.closeHelpButton.setVisible(true);
        this.openHelpButton.setVisible(false);
        this.grid.deactivate();
    }

    closeHelp() {
        this.helpPage.setVisible(false);
        this.closeHelpButton.setVisible(false);
        this.openHelpButton.setVisible(true);
        this.grid.activate();
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
        this.grid.updateTriPreview(this.previewX, this.previewY, this.nextTrihex);
        this.updateBigTrihex();
    }

    rotateLeft() {
        this.nextTrihex.rotateLeft();
        this.grid.updateTriPreview(this.previewX, this.previewY, this.nextTrihex);
        this.updateBigTrihex();
    }

    updateBigTrihex() {
        for (let i = 0; i < 3; i++) {
            let row = shapes[this.nextTrihex.shape][i].ro;
            let col = shapes[this.nextTrihex.shape][i].co;

            if (this.nextTrihex.shape === 'a') {
                this.bigPreviewTrihex[i].setX(HEX_WIDTH*1.5*(col + 0.5*row))
                this.bigPreviewTrihex[i].setY(HEX_HEIGHT*1.125*(row));
            } else if (this.nextTrihex.shape === 'v') {
                this.bigPreviewTrihex[i].setX(HEX_WIDTH*1.5*(col - 0.5 + 0.5*row))
                this.bigPreviewTrihex[i].setY(HEX_HEIGHT*1.125*(row));
            } else {
                this.bigPreviewTrihex[i].setX(HEX_WIDTH*1.5*(col + 0.5*row))
                this.bigPreviewTrihex[i].setY(HEX_HEIGHT*1.125*row)
            }

            
            this.bigPreviewTrihex[i].setType(this.nextTrihex.hexes[i]);
            if (this.nextTrihex.hexes[i] === 0) this.bigPreviewTrihex[i].setVisible(false);
        }
    }

    createTrihexDeck(size: number, allShapes?: boolean): Trihex[] {
        let deck: Trihex[] = [];
        for (let i = 0; i < size; i++) {
            if (allShapes) {
                if (i < size/3) {
                    deck.push(new Trihex(0, 0, 0, pick(['a', 'v'])));
                } else if (i < size/1.5) {
                    deck.push(new Trihex(0, 0, 0, pick(['/', '-', '\\'])));
                } else {
                    deck.push(new Trihex(0, 0, 0, pick(['c', 'r', 'n', 'd', 'j', 'l'])));
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
                    'v': 'a-shape',
                    '/': 'slash-shape',
                    '-': 'slash-shape',
                    '\\': 'slash-shape',
                    'c': 'c-shape',
                    'r': 'c-shape',
                    'n': 'c-shape',
                    'd': 'c-shape',
                    'j': 'c-shape',
                    'l': 'c-shape'
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

    waitForFinalScore() {
        this.grid.onQueueEmpty = this.endGame.bind(this);
    }

    endGame() {
        this.grid.sinkBlanks();

        this.tweens.add({
            targets: [
                this.bigPreviewContainer,
                this.rotateLeftButton,
                this.rotateRightButton,
                this.deckCounterImage,
                this.deckCounterText,
                this.openHelpButton
            ],
            props: {
                alpha: 0
            },
            duration: 300
        });

        this.tweens.add({
            targets: this.scoreText,
            props: {
                y: 150
            },
            duration: 700,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        
        let rank, message1, message2;
        if (this.score === 0) {
            // Z rank
            rank = "Rank: Z";
            message1 = "What!?"
            message2 = "(That's honestly impressive!)"
        } else if (this.score < 70) {
            // E rank
            rank = "Rank: E";
            message1 = "Finished!";
            message2 = "(Next rank at 70 points)";
        } else if (this.score < 80) {
            // D rank
            rank = "Rank: D";
            message1 = "Not bad!";
            message2 = "(Next rank at 80 points)";
        } else if (this.score < 90) {
            // C rank
            rank = "Rank: C";
            message1 = "Good job!";
            message2 = "(Next rank at 90 points)";
        } else if (this.score < 100) {
            // B rank
            rank = "Rank: B";
            message1 = "Well done!";
            message2 = "(Next rank at 100 points)";
        } else if (this.score < 110) {
            // A rank
            rank = "Rank: A";
            message1 = "Excellent!";
            message2 = "(Next rank at 110 points)";
        } else if (this.score < 120) {
            // A+ rank
            rank = "Rank: A+";
            message1 = "Amazing!";
            message2 = "(Next rank at 120 points)";
        } else if (this.score < 125) {
            // S rank
            rank = "Rank: S";
            message1 = "Incredible!!";
            message2 = "(This is the highest rank!)";
        } else {
            // S rank (perfect)
            rank = "Rank: S";
            message1 = "A perfect score!!";
            message2 = "(This is the highest rank!)"
        }
        
        this.gameOverText = this.add.bitmapText(1500, 70, 'font', message1, 60);
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setDepth(4);

        this.rankText = this.add.bitmapText(1500, 460, 'font', rank, 60);
        this.rankText.setOrigin(0.5);
        this.rankText.setDepth(4);

        this.nextRankText = this.add.bitmapText(1500, 520, 'font', message2, 40);
        this.nextRankText.setOrigin(0.5);
        this.nextRankText.setDepth(4);

        this.playAgainButton = new Button(this, 1400, 630, 'play-again-button', this.playAgain.bind(this));
        this.playAgainButton.setDepth(4);

        this.breakdownContainer = this.add.container(1500, 300);
        this.breakdownContainer.setDepth(4);

        this.breakdownHexes = [];
        this.breakdownTexts = [];

        for (let i = 0; i < 3; i++) {
            let h = new Hex(this, 0, 0, -1, -1);
            h.embiggen();
            h.setDepth(4);
            this.breakdownContainer.add(h);
            this.breakdownHexes.push(h);
            this.breakdownContainer.add(h.edges.getChildren());
            this.breakdownContainer.add(h.propeller);

            let t = this.add.bitmapText(0, 80, 'font', '0', 40);
            t.setOrigin(0.5);
            this.breakdownTexts.push(t);
            this.breakdownContainer.add(t);
        }

        this.breakdownHexes[0].setType(3);
        this.breakdownHexes[0].upgrade();
        this.breakdownHexes[0].setX(-125);
        this.breakdownTexts[0].setX(-125);
        this.breakdownTexts[0].setText(String(this.scoreBreakdown[3] + this.scoreBreakdown[5]));
        
        this.breakdownHexes[1].setType(2);
        this.breakdownHexes[1].upgrade();
        this.breakdownTexts[1].setText(String(this.scoreBreakdown[2]));
        
        this.breakdownHexes[2].setType(1);
        this.breakdownHexes[2].setX(125);
        this.breakdownTexts[2].setX(125);
        this.breakdownTexts[2].setText(String(this.scoreBreakdown[1]));

        this.tweens.add({
            targets: this.gameOverText,
            props: { x: 1040 },
            delay: 300,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        this.tweens.add({
            targets: this.breakdownContainer,
            props: { x: 1040 },
            delay: 600,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        this.tweens.add({
            targets: [this.rankText, this.nextRankText],
            props: { x: 1040 },
            delay: 900,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        this.tweens.add({
            targets: this.playAgainButton,
            props: { x: 1040 },
            delay: 1200,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out
        });
    }

    playAgain() {
        this.breakdownContainer.setVisible(false);
        this.gameOverText.setVisible(false);
        this.nextRankText.setVisible(false);
        this.rankText.setVisible(false);
        this.playAgainButton.setVisible(false);
        this.scoreText.setVisible(false);

        this.tweens.add({
            targets: this.foreground,
            props: { x: 1600 },
            duration: 400
        });

        this.time.addEvent({
            callback: this.scene.restart,
            callbackScope: this.scene,
            delay: 500
        });
    }

    onPointerUp(event) {
        if (this.pointerDown) {
            this.previewX = event.worldX;
            this.previewY = event.worldY;
            this.placeTrihex();
        }
        this.pointerDown = false;
    }

    placeTrihex() {
        if (!this.grid.enabled) return;
        if (this.grid.placeTrihex(this.previewX, this.previewY, this.nextTrihex)) {
            this.pickNextTrihex();
            
            if (this.nextTrihex.hexes[0] === 0 || !this.grid.canPlaceShape(this.nextTrihex.shape)) {
                this.time.addEvent({
                    callback: this.waitForFinalScore,
                    callbackScope: this,
                    delay: 1000
                });
                this.grid.deactivate();
            }
            this.grid.updateTriPreview(-100, -100, this.nextTrihex);
        }
    }

    onPointerDown(event) {
        if (event.worldX === this.previewX && event.worldY === this.previewY) {
            this.placeTrihex();
        } else {
            this.previewX = event.worldX;
            this.previewY = event.worldY;
            this.grid.updateTriPreview(event.worldX, event.worldY, this.nextTrihex);
        }
        this.pointerDown = true;
    }

    onPointerMove(event) {
        this.previewX = event.worldX;
        this.previewY = event.worldY;
        this.grid.updateTriPreview(event.worldX, event.worldY, this.nextTrihex);
    }

    onKeyDown(event) {
        if (event.keyCode === 39 || event.keyCode === 68) {
            this.rotateRight();
        }
        if (event.keyCode === 37 || event.keyCode === 65) {
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


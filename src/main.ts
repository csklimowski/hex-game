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
    score: number;
    scoreText: Phaser.GameObjects.BitmapText;
    waves: Phaser.GameObjects.Image;
    waves2: Phaser.GameObjects.Image;

    gameOverText: Phaser.GameObjects.BitmapText;
    rankText: Phaser.GameObjects.BitmapText;
    nextRankText: Phaser.GameObjects.BitmapText;
    playAgainButton: Button;

    constructor() {
        super('main');
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x90C7E5);
        this.score = 0;

        this.waves = this.add.image(640, 360, 'waves');
        this.waves2 = this.add.image(640, 360, 'waves2');
        
        this.grid = new HexGrid(this, 5, 8, 0, 0, this.onScoreUpdate.bind(this));
        this.trihexDeck = this.createTrihexDeck(25, true);

        this.scoreText = this.add.bitmapText(150, 30, 'font', '0 points', 60);
        this.scoreText.setDepth(4);
        
        this.rotateLeftButton = new Button(this, 125, 180, 'rotate', this.rotateLeft.bind(this));
        this.rotateLeftButton.setDepth(3.5);
        this.rotateLeftButton.setFlipX(true);
        this.rotateRightButton = new Button(this, 375, 180, 'rotate', this.rotateRight.bind(this));
        this.rotateRightButton.setDepth(3.5);
        
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
        this.input.keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, this.onKeyDown, this);

        this.input.on('wheel', this.onMouseWheel, this);
    }

    onScoreUpdate(score: number) {
        this.score = score;
        this.scoreText.setText(String(score) + " points");
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
                this.deckCounterText
            ],
            props: {
                alpha: 0
            },
            duration: 300
        });

        this.tweens.add({
            targets: this.scoreText,
            props: {
                y: 200
            },
            duration: 700,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        
        let rank, message1, message2;
        if (this.score < 70) {
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
            message1 = "Nearly flawless!";
            message2 = "(Next rank at 120 points)";
        } else {
            // S rank
            rank = "Rank: S";
            message1 = "Incredible!!";
            message2 = "(This is the highest rank!)";
        }
        
        this.gameOverText = this.add.bitmapText(1400, 100, 'font', message1, 70);
        this.gameOverText.setOrigin(0.5);
        this.gameOverText.setDepth(4);

        this.rankText = this.add.bitmapText(1400, 340, 'font', rank, 60);
        this.rankText.setDepth(4);

        this.nextRankText = this.add.bitmapText(1400, 400, 'font', message2, 40);
        this.nextRankText.setDepth(4);

        this.playAgainButton = new Button(this, 1400, 600, 'play-again-button', this.playAgain.bind(this));
        this.playAgainButton.setDepth(4);

        this.tweens.add({
            targets: this.gameOverText,
            props: { x: 1040 },
            delay: 300,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        this.tweens.add({
            targets: this.rankText,
            props: { x: 960 },
            delay: 700,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        this.tweens.add({
            targets: this.nextRankText,
            props: { x: 865 },
            delay: 700,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out
        });

        this.tweens.add({
            targets: this.playAgainButton,
            props: { x: 1040 },
            delay: 1000,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out
        });
        
    }

    playAgain() {

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

    onPointerDown(event) {
        if (this.grid.placeTrihex(event.worldX, event.worldY, this.nextTrihex)) {
            this.pickNextTrihex();
            
            if (this.nextTrihex.hexes[0] === 0 || !this.grid.canPlaceShape(this.nextTrihex.shape)) {
                this.time.addEvent({
                    callback: this.waitForFinalScore,
                    callbackScope: this,
                    delay: 1000
                });
                this.grid.deactivate();
            }
        }
    }

    onPointerMove(event) {
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


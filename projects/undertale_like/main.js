const DEBUG = true;
const TARGETED_GAMELOOP_FREQUENCY = 1 / 60

let TEXT_SPEED = 60;
if (DEBUG) {
    TEXT_SPEED = 1;
}

const PLAYER_MAX_HEALTH = 50;
const PLAYER_SPEED = 50;
const PLAYER_MAX_JUMP_HOLD_TIME = 1;
const PLAYER_JUMP_FORCE = 1200;
const PLAYER_RELEASE_JUMP_FORCE = 400;
const PLAYER_HEALTHBAR_HEIGHT = 30;

const CARDS_SPRITES = { club: "./images/cards/clubs/Clubs_card_01.png", diamond: "./images/cards/diamonds/Diamonds_card_01.png", heart: "./images/cards/hearts/Hearts_card_01.png", jokerBlack: "./images/cards/joker/joker_black.png", jokerRed: "./images/cards/joker/joker_red.png", spade: "./images/cards/spades/Spades_card_01.png" }
const NUMBER_OF_CARDS = 54;
const CARD_WIDTH = 54;
const CARD_HEIGHT = CARD_WIDTH / 27 * 34;
const CARDS_SHOW_TIME = 2000;
const CARDS_OPACITY_DELAY = 100;

const GRAVITY_FORCE = 50;

let lastUpTime = performance.now();

let movementType;
let state;
let currentStage;

var pressedKeys = {};
window.onkeyup = function (e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function (e) { pressedKeys[e.keyCode] = true; }

//Combine plusieurs classes en une seule pour extends plusieurs classes
function Classes(bases) {
    class Bases {
        constructor() {
            bases.forEach(base => Object.assign(this, new base()));
        }
    }

    bases.forEach(base => {
        Object.getOwnPropertyNames(base.prototype).forEach(prop => {
            if (prop !== 'constructor') {
                const descriptor = Object.getOwnPropertyDescriptor(base.prototype, prop);
                Object.defineProperty(Bases.prototype, prop, descriptor);
            }
        });
    });

    return Bases;
}


class Coordinates {
    get X() {
        return this._x;
    }
    set X(value) {
        this._x = value;
        if (typeof this.div !== "undefined") {
            requestAnimationFrame(() => {
                this.div.style.left = this._x + "px";
            })
        }
    }

    get Y() {
        return this._y;
    }
    set Y(value) {
        this._y = value;
        if (typeof this.div !== "undefined") {
            requestAnimationFrame(() => {
                this.div.style.top = this._y + "px";
            })
        }
    }
}

class WidthHeight {
    get Width() {
        return this._width;
    }
    set Width(value) {
        this._width = value;
        if (typeof this.div !== "undefined") {
            requestAnimationFrame(() => {
                this.div.style.width = this._width + "px";
            })
        }
    }

    get Height() {
        return this._height;
    }
    set Height(value) {
        this._height = value;
        if (typeof this.div !== "undefined") {
            requestAnimationFrame(() => {
                this.div.style.height = this._height + "px";
            })
        }
    }
}


class Player {
    constructor(heart) {
        this._health = PLAYER_MAX_HEALTH;
        this._heart = heart;
        this._yVelocity = 0;
        this._jumpHoldTime = 0;
        this.Grounded = false;
        this._canJump = false;
        this._releasedJumpKeySinceLastJump = true;
    }

    get Health() {
        return this._health;
    }
    set Health(value) {
        this._health = value;
    }

    get Heart() {
        return this._heart;
    }
    set Heart(value) {
        this._heart = value;
    }

    get YVelocity() {
        return this._yVelocity;
    }
    set YVelocity(value) {
        this._yVelocity = value;
    }

    get JumpHoldTime() {
        return this._jumpHoldTime;
    }
    set JumpHoldTime(value) {
        this._jumpHoldTime = value;
    }

    get Grounded() {
        return this._grounded;
    }
    set Grounded(value) {
        this._grounded = value;
    }

    get CanJump() {
        return this._canJump;
    }
    set CanJump(value) {
        this._canJump = value;
    }

    get ReleasedJumpKeySinceLastJump() {
        return this._releasedJumpKeySinceLastJump;
    }
    set ReleasedJumpKeySinceLastJump(value) {
        this._releasedJumpKeySinceLastJump = value;
    }
}

class Obstacle {
    constructor(shape) {
        this.shape = shape;
    }
}

class Rectangle extends Classes([Coordinates, WidthHeight]) {
    constructor(x = 0, y = 0, w = 0, h = 0, debug = false) {
        super();

        if (debug) {
            this.div = createEl("div", document.body);
            this.div.classList.add("obstacle", "green");
        }

        this.X = x;
        this.Y = y;
        this.Width = w;
        this.Height = h;
    }
}

class Heart extends Classes([Coordinates, WidthHeight]) {
    constructor() {
        super();

        let heartData = [
            [" ", " ", "0", "0", " ", " ", " ", " ", " ", " ", " ", " ", "1", "1", " ", " "],
            [" ", "2", "2", "2", "2", "2", " ", " ", " ", " ", "3", "3", "3", "3", "3", " "],
            ["4", "4", "4", "4", "4", "4", "4", " ", " ", "5", "5", "5", "5", "5", "5", "5"],
            ["4", "4", "4", "4", "4", "4", "4", " ", " ", "5", "5", "5", "5", "5", "5", "5"],
            ["6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6"],
            ["6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6"],
            ["6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6"],
            ["6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6"],
            ["6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6"],
            ["6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6", "6"],
            [" ", " ", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", " ", " "],
            [" ", " ", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", "7", " ", " "],
            [" ", " ", " ", " ", "8", "8", "8", "8", "8", "8", "8", "8", " ", " ", " ", " "],
            [" ", " ", " ", " ", "8", "8", "8", "8", "8", "8", "8", "8", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", "9", "9", "9", "9", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", "9", "9", "9", "9", " ", " ", " ", " ", " ", " "],
        ];

        this.scale = 2;

        this.div = createEl("div", document.body);
        this.div.classList.add("heart");

        this.Width = heartData[0].length * this.scale;
        this.Height = heartData.length * this.scale;

        for (let i = 0; i < heartData.length; i++) {
            for (let j = 0; j < heartData[0].length; j++) {
                let char = heartData[i][j];
                if (char !== " ") {
                    let pixel = createEl("div", this.div);
                    pixel.classList.add("pixel", "red");
                    pixel.style.width = this.scale + "px";
                    pixel.style.height = this.scale + "px";
                    pixel.style.top = i * this.scale + "px";
                    pixel.style.left = j * this.scale + "px";
                }
            }
        }

        let rectanglesData = {};
        for (let i = 0; i < heartData.length; i++) {
            for (let j = 0; j < heartData[0].length; j++) {
                let char = heartData[i][j];
                if (char !== " ") {
                    let x = j;
                    let y = i;
                    if (!(char in rectanglesData)) {
                        let width = 1;
                        let height = 1;
                        rectanglesData[char] = {
                            rectangle: char,
                            x: x,
                            y: y,
                            width: width,
                            height: height
                        }
                    }
                    else if (x >= rectanglesData[char].x + rectanglesData[char].width - 1) {
                        rectanglesData[char].width = x - rectanglesData[char].x + 1;
                        rectanglesData[char].height = y - rectanglesData[char].y + 1;
                    }
                }
            }
        }

        this.HitboxRectangles = [];
        for (let key in rectanglesData) {
            const data = rectanglesData[key];
            this.HitboxRectangles.push(new Rectangle(data.x * this.scale, data.y * this.scale, data.width * this.scale, data.height * this.scale));
        }
    }

    get HitboxRectangles() {
        return this._hitboxRectangles;
    }
    set HitboxRectangles(value) {
        this._hitboxRectangles = value;
    }
}

class Box extends Classes([Coordinates, WidthHeight]) {
    constructor() {
        super();

        this.div = createEl("div", document.body);
        this.div.classList.add("box");

        this.Width = 330;
        this.Height = 330;
        this.X = (window.innerWidth - this.Width) / 2;
        this.Y = (window.innerHeight - this.Height) / 2;
    }
}

class Boss extends Classes([Coordinates, WidthHeight]) {
    constructor() {
        super();

        this.div = createEl("img", document.body);
        this.div.src = "./images/joker/joker_smiling.png";
        this.div.classList.add("boss");

        //image en 56x75
        this.Width = 200;
        this.Height = this.Width / 56 * 75;
    }
}

class Deck extends Coordinates {
    constructor() {
        super();

        this.div = createEl("div", document.body);
        this.div.classList.add("deck");

        let suits = [];

        for (let i = 0; i < 13; i++) {
            suits.push(Suit.CLUB);
            suits.push(Suit.DIAMOND);
            suits.push(Suit.HEART);
            suits.push(Suit.SPADE);
        }

        shuffle(suits);

        const firstHalfEnd = Math.floor(suits.length / 2);
        suits.splice(Math.floor(Math.random() * (suits.length - firstHalfEnd)) + firstHalfEnd, 0, Suit.JOKERBLACK);
        suits.splice(Math.floor(Math.random() * (suits.length - firstHalfEnd)) + firstHalfEnd, 0, Suit.JOKERRED);

        this._cards = [];
        for (let i = 0; i < NUMBER_OF_CARDS; i++) {
            let card = new Card(suits.shift(), this.div);
            card.div.style.transform = "rotate(" + biasedRandom(-6, 6, 1) + "deg) translate(" + biasedRandom(-20, 20, 10) + "%, " + biasedRandom(-20, 20, 10) + "%)";

            this._cards.push(card);
        }
    }

    get Cards() {
        return this._cards;
    }
    set Cards(value) {
        this._cards = value;
    }
}

class Card extends Classes([Coordinates, WidthHeight]) {
    constructor(suit, container = document.body) {
        super();

        this.Suit = suit;

        this._isRotating = false;
        this._currentAngle = 0;

        this._backSprite = "./images/cards/back.png";
        this._frontSprite = CARDS_SPRITES[this.Suit];

        this.div = createEl("img", container);
        this.div.src = "./images/cards/back.png";
        this.div.classList.add("card");

        //image en 27x34
        this.Width = CARD_WIDTH;
        this.Height = CARD_HEIGHT;
    }

    get Suit() {
        return this._suit;
    }
    set Suit(value) {
        this._suit = value;
    }

    async offsetCard(x, y) {
        return new Promise((resolve) => {
            // Initial values for top and left
            const initialTop = parseFloat(this.div.style.top || 0);
            const initialLeft = parseFloat(this.div.style.left || 0);

            // Target values based on provided x and y arguments
            const targetTop = initialTop + y;
            const targetLeft = initialLeft + x;
            const offsetSpeed = 0.05; // Speed of offset adjustment

            let currentTop = initialTop;
            let currentLeft = initialLeft;

            const animateOffset = () => {
                // Update top and left values gradually
                currentTop = Math.abs(currentTop - targetTop) > offsetSpeed
                    ? currentTop + (targetTop - currentTop) * offsetSpeed
                    : targetTop;

                currentLeft = Math.abs(currentLeft - targetLeft) > offsetSpeed
                    ? currentLeft + (targetLeft - currentLeft) * offsetSpeed
                    : targetLeft;

                // Apply the updated top and left values
                this.div.style.top = `${currentTop}px`;
                this.div.style.left = `${currentLeft}px`;

                // Continue the animation until offset reaches the target values
                if (Math.abs(currentTop - targetTop) > 0.1 || Math.abs(currentLeft - targetLeft) > 0.1) {
                    requestAnimationFrame(animateOffset);
                } else {
                    // Once the offset is done, proceed to reset the transform
                    resolve();
                }
            };

            requestAnimationFrame(animateOffset);
        })
    }

    resetTransform() {
        return new Promise((resolve) => {
            // Initial random transformation
            const initialTransform = this.div.style.transform || "";
            const initialRotateMatch = initialTransform.match(/rotate\((-?\d+\.?\d*)deg\)/);
            const initialTranslateMatch = initialTransform.match(/translate\((-?\d+\.?\d*)%, (-?\d+\.?\d*)%\)/);

            // Get the initial rotation and translation values from the current transform
            const initialRotation = initialRotateMatch ? parseFloat(initialRotateMatch[1]) : 0;
            const initialTranslateX = initialTranslateMatch ? parseFloat(initialTranslateMatch[1]) : 0;
            const initialTranslateY = initialTranslateMatch ? parseFloat(initialTranslateMatch[2]) : 0;

            const targetRotation = 0; // Reset rotation to 0 degrees
            const targetTranslateX = 0; // Reset translation to 0
            const targetTranslateY = 0; // Reset translation to 0
            const resetSpeed = 0.05; // Speed for resetting transform values (0.05 per frame)

            let currentRotation = initialRotation;
            let currentTranslateX = initialTranslateX;
            let currentTranslateY = initialTranslateY;

            const animateReset = () => {
                // Update rotation and translation towards the target values
                currentRotation = Math.abs(currentRotation - targetRotation) > resetSpeed
                    ? currentRotation + (targetRotation - currentRotation) * resetSpeed
                    : targetRotation;

                currentTranslateX = Math.abs(currentTranslateX - targetTranslateX) > resetSpeed
                    ? currentTranslateX + (targetTranslateX - currentTranslateX) * resetSpeed
                    : targetTranslateX;

                currentTranslateY = Math.abs(currentTranslateY - targetTranslateY) > resetSpeed
                    ? currentTranslateY + (targetTranslateY - currentTranslateY) * resetSpeed
                    : targetTranslateY;

                // Apply the transformation
                this.div.style.transform = `rotate(${currentRotation}deg) translate(${currentTranslateX}%, ${currentTranslateY}%)`;

                // Continue until transform values are close enough to the target values
                if (Math.abs(currentRotation - targetRotation) > 0.1 ||
                    Math.abs(currentTranslateX - targetTranslateX) > 0.1 ||
                    Math.abs(currentTranslateY - targetTranslateY) > 0.1) {
                    requestAnimationFrame(animateReset);
                } else {
                    // Once transform is reset, allow flipping
                    resolve();
                }
            };

            requestAnimationFrame(animateReset);
        });
    }

    startFlipAnimation() {
        return new Promise((resolve) => {
            const rotateSpeed = 5; // Degrees per frame for flip
            const totalRotation = 360; // Flip rotation
            let skipped180 = false;

            this._currentAngle = 0; // Reset the current angle

            const animateFlip = () => {
                if (this._currentAngle >= totalRotation) {
                    // When the rotation completes, reset the rotation and state
                    this.div.style.transform = `translate(0, 0) rotateY(${totalRotation}deg)`;
                    this._isRotating = false;
                    resolve();
                    return;
                }

                // Increment the angle
                this._currentAngle += rotateSpeed;

                // Apply the transformation (translate + rotateY)
                this.div.style.transform = `translate(0, 0) rotateY(${this._currentAngle}deg)`;

                // Flip the sprite based on the rotation angle
                if (skipped180 === false && this._currentAngle >= 90) {
                    skipped180 = true;
                    this.div.src = this._frontSprite;

                    // Fast-forward through the backside animation if needed
                    this._currentAngle += 180;
                }

                // Continue the animation on the next frame
                requestAnimationFrame(animateFlip);
            };

            // Start the flip animation
            requestAnimationFrame(animateFlip);
        });
    }
}

class HealthBar extends Classes([Coordinates, WidthHeight]) {
    constructor() {
        super();

        this.div = createEl("div", document.body);
        this.div.classList.add("health-bar");

        this.Width = PLAYER_MAX_HEALTH * 3;
        this.Height = PLAYER_HEALTHBAR_HEIGHT;

        this.Back = new Rectangle();
        this.Front = new Rectangle();

        this.TextHp = createEl("div", this.div);
        this.TextHp.classList.add("health-bar-text");
        this.TextHp.style.marginTop = "3px";
        this.TextHp.innerHTML = "HP";

        this.Bars = createEl("div", this.div);
        this.Bars.classList.add("health-bar-bars");

        this.Back.div = createEl("div", this.Bars);
        this.Back.div.classList.add("health-bar-back");
        this.Back.Width = this.Width;
        this.Back.Height = this.Height;

        this.Front.div = createEl("div", this.Bars);
        this.Front.div.classList.add("health-bar-front");
        this.Front.Width = this.Width;
        this.Front.Height = this.Height;

        this.TextHpValue = createEl("div", this.div);
        this.TextHpValue.classList.add("health-bar-text");
        this.TextHpValue.style.fontSize = "20px";
        this.TextHpValue.style.marginTop = "3px";
        this.TextHpValue.innerHTML = PLAYER_MAX_HEALTH + "/" + PLAYER_MAX_HEALTH;
    }

    changeHealth(health) {
        this.Front.Width = health * 3;
        this.TextHpValue.innerHTML = health + "/" + PLAYER_MAX_HEALTH;
    }

    get Back() {
        return this._back;
    }
    set Back(value) {
        this._back = value;
    }

    get Front() {
        return this._front;
    }
    set Front(value) {
        this._front = value;
    }

    get Bars() {
        return this._bars;
    }
    set Bars(value) {
        this._bars = value;
    }

    get TextHp() {
        return this._textHp;
    }
    set TextHp(value) {
        this._textHp = value;
    }

    get TextHpValue() {
        return this._textHpValue;
    }
    set TextHpValue(value) {
        this._textHpValue = value;
    }
}

class Stage {
    constructor(entryEvent, events, nextStageActivation) {
        this._started = false;
        this._entryEvent = entryEvent;
        this._events = events;
        this._nextStageActivation = nextStageActivation;
        this._finished = false;
    }

    start() {
        this.Started = true;
        this.EntryEvent.start();
    }

    update() {
        if (this.EntryEvent.OnGoing === true) {
            return;
        }

        let eventsOnGoing = false;

        for (let i = 0; i < this.Events.length; i++) {
            const event = this.Events[i];

            if (event.OnGoing === true) {
                eventsOnGoing = true;
                break;
            }
        }

        if (this.NextStageActivation() && eventsOnGoing === false) {
            this.Finished = true;
            return;
        }

        if (eventsOnGoing === false) {
            for (let i = 0; i < this.Events.length; i++) {
                const event = this.Events[i];

                event.start();
            }
        }
    }

    get Started() {
        return this._started;
    }
    set Started(value) {
        this._started = value;
    }

    get EntryEvent() {
        return this._entryEvent;
    }
    set EntryEvent(value) {
        this._entryEvent = value;
    }

    get Events() {
        return this._events;
    }
    set Events(value) {
        this._events = value;
    }

    get NextStageActivation() {
        return this._nextStageActivation;
    }
    set NextStageActivation(value) {
        this._nextStageActivation = value;
    }

    get Finished() {
        return this._finished;
    }
    set Finished(value) {
        this._finished = value;
    }
}

class Attack {
    get Cards() {
        return this._cards;
    }
    set Cards(value) {
        this._cards = value;
    }

    get OnGoing() {
        return this._onGoing;
    }
    set OnGoing(value) {
        this._onGoing = value;
    }
}

class AttackOne extends Attack {
    constructor() {
        super();
    }

    async start() {
        this.OnGoing = true;
        console.log("attack one started");


        const cards = await revealCards(randInt(1, 2));

        for(let i = 0; i < cards.length; i++){
            const card = cards[i];

            for(let i = 0; i < 20; i++){
                let obstacle = new Obstacle(new Rectangle(window.innerWidth / 2 + randInt(30), window.innerHeight / 2 + randInt(30), 100, 100, true));
                obstacles.push(obstacle);
            } 

            switch (card.Suit) {
                case Suit.CLUB:
                    

                    break;
                case Suit.DIAMOND:

                    break;
                case Suit.HEART:

                    break;
                case Suit.SPADE:

                    break;
                default:
                    break;
            }
        }

        setTimeout(() => {
            this.OnGoing = false;
            console.log("attack one finished");
        }, 3000);
    }
}

class AttackTwo extends Attack {
    constructor() {
        super();
    }

    async start() {
        revealCards(2);

        this.OnGoing = true;
        console.log("attack two started");

        setTimeout(() => {
            this.OnGoing = false;
            console.log("attack two finished");
        }, 3000);
    }
}

class Sentence extends Classes([Coordinates, WidthHeight]) {
    constructor(text) {
        super();

        this.Text = text;
    }

    get Text() {
        return this._text;
    }
    set Text(value) {
        this._text = value;
    }

    get CurrentChar() {
        return this._currentChar;
    }
    set CurrentChar(value) {
        this._currentChar = value;
    }

    get OnGoing() {
        return this._onGoing;
    }
    set OnGoing(value) {
        this._onGoing = value;
    }

    play() {
        this.OnGoing = true;
        this.CurrentChar = 0;

        this.box = createEl("div", dialogueHelper.div);
        this.box.classList.add("dialogue");

        this.textDiv = createEl("div", this.box);
        this.textDiv.classList.add("dialogue-text");

        this.addChar();
    }

    addChar() {
        setTimeout(() => {
            if (this.CurrentChar === this.Text.length) {
                this.OnGoing = false;
                return;
            }

            this.textDiv.innerHTML += this.Text.charAt(this.CurrentChar);
            this.CurrentChar++;

            this.addChar();
        }, TEXT_SPEED);
    }

    destroy() {
        this.box.remove();
    }
}

class Dialog {
    constructor(sentences) {
        this.Sentences = [];
        this.CurrentSentence = 0;

        for (let i = 0; i < sentences.length; i++) {
            this.Sentences.push(new Sentence(sentences[i]))
        }
    }

    start() {
        state = State.DIALOG;
        this.OnGoing = true;
        this.playSentence();
    }

    async playSentence() {
        this.Sentences[this.CurrentSentence].play();

        await this.waitForSentenceToFinish();

        this.Sentences[this.CurrentSentence].destroy();

        if (this.CurrentSentence === this.Sentences.length - 1) {
            this.OnGoing = false;
            state = State.Idle;
            return;
        }

        this.CurrentSentence++;
        this.playSentence();
    }

    waitForSentenceToFinish() {
        return new Promise((resolve) => {
            const onKeyPress = (event) => {
                if (!this.Sentences[this.CurrentSentence].OnGoing && (event.keyCode === 90 || event.keyCode === 13)) {

                    document.removeEventListener("keydown", onKeyPress);
                    resolve();
                }
            };

            document.addEventListener("keydown", onKeyPress);
        });
    }

    get Sentences() {
        return this._sentences;
    }
    set Sentences(value) {
        this._sentences = value;
    }

    get CurrentSentence() {
        return this._currentSentences;
    }
    set CurrentSentence(value) {
        this._currentSentences = value;
    }

    get OnGoing() {
        return this._onGoing;
    }
    set OnGoing(value) {
        this._onGoing = value;
    }
}

class Suit {
    static #CLUB = "club";
    static #DIAMOND = "diamond";
    static #HEART = "heart";
    static #JOKERBLACK = "jokerBlack";
    static #JOKERRED = "jokerRed";
    static #SPADE = "spade";

    static get CLUB() { return this.#CLUB; }
    static get DIAMOND() { return this.#DIAMOND; }
    static get HEART() { return this.#HEART; }
    static get JOKERBLACK() { return this.#JOKERBLACK; }
    static get JOKERRED() { return this.#JOKERRED; }
    static get SPADE() { return this.#SPADE; }
}

class MovementType {
    static #WASD = 0;
    static #ADJUMP = 1;

    static get WASD() { return this.#WASD; }
    static get ADJUMP() { return this.#ADJUMP; }
}

class State {
    static #IDLE = 0;
    static #DIALOG = 1;
    static #ATTACK = 2;

    static get IDLE() { return this.#IDLE; }
    static get DIALOG() { return this.#DIALOG; }
    static get ATTACK() { return this.#ATTACK; }
}

let stages;
let box;
let player;
let healthBar;
let boss;
let deck;
let dialogueHelper = new Rectangle();
dialogueHelper.div = createEl("div");
dialogueHelper.div.classList.add("dialogue-helper");
let obstacles = [];

function cssVar(name, value) {
    if (name[0] != '-') name = '--' + name;
    if (value) document.documentElement.style.setProperty(name, value);
    return getComputedStyle(document.documentElement).getPropertyValue(name);
}

function createEl(tag, container = document.body) {
    element = document.createElement(tag);
    container.appendChild(element);
    return element;
}

function applyGravity(deltaTime) {
    if (movementType === MovementType.ADJUMP) {
        player.YVelocity -= GRAVITY_FORCE * deltaTime;

        player.Heart.Y -= player.YVelocity * deltaTime;
    }
}

function move(deltaTime) {
    if (state === State.DIALOG) {
        return;
    }

    let heart = player.Heart;

    let vector = [0, 0];

    if (keyUp()) {
        if (movementType === MovementType.ADJUMP) {
            if (player.CanJump && player.ReleasedJumpKeySinceLastJump && player.JumpHoldTime < PLAYER_MAX_JUMP_HOLD_TIME) {
                player.Grounded = false;
                player.JumpHoldTime += deltaTime;
                player.YVelocity = PLAYER_JUMP_FORCE * deltaTime;
            }
            else {
                player.ReleasedJumpKeySinceLastJump = false;
            }
        }
        else {
            vector[1] -= 1;
        }
    }
    else {
        if (movementType === MovementType.ADJUMP) {
            player.ReleasedJumpKeySinceLastJump = true;

            if (!player.Grounded) {
                player.CanJump = false;
                player.JumpHoldTime = 0;
            }

            if (player.YVelocity > PLAYER_RELEASE_JUMP_FORCE * deltaTime) {
                player.YVelocity = PLAYER_RELEASE_JUMP_FORCE * deltaTime;
            }
        }
    }
    if (keyDown()) {
        if (movementType === MovementType.ADJUMP) {

        }
        else {
            vector[1] += 1;
        }
    }
    if (keyRight()) {
        vector[0] += 1;
    }
    if (keyLeft()) {
        vector[0] -= 1;
    }

    let magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
    if (magnitude === 0) {
        return;
    }
    let normalizedVector = [vector[0] / magnitude, vector[1] / magnitude];

    heart.X += normalizedVector[0] * PLAYER_SPEED * deltaTime;
    heart.Y += normalizedVector[1] * PLAYER_SPEED * deltaTime;
}

function forceInBox() {
    let heart = player.Heart;

    x1 = heart.X;
    x2 = heart.X + heart.Width;
    y1 = heart.Y;
    y2 = heart.Y + heart.Height;

    upperBoundary = box.Y;
    bottomBoundary = box.Y + box.Height;
    leftBoundary = box.X;
    rightBoundary = box.X + box.Width;

    if (y1 < upperBoundary) {
        heart.Y = upperBoundary;
    }
    if (y2 > bottomBoundary) {
        player.Grounded = true;
        player.CanJump = true;
        player.JumpHoldTime = 0;
        heart.Y = bottomBoundary - heart.Height;
    }
    if (x1 < leftBoundary) {
        heart.X = leftBoundary;
    }
    if (x2 > rightBoundary) {
        heart.X = rightBoundary - heart.Width;
    }
}

function checkCollisions() {
    let updatedHitboxRectangles;

    for (let i = 0; i < obstacles.length; i++) {
        const obstacle = obstacles[i];

        if (obstacle.shape instanceof Rectangle) {
            const rect = obstacle.shape;

            if (!rectangleCollision(player.Heart, rect)) {
                return false
            }

            if (!updatedHitboxRectangles) {
                updatedHitboxRectangles = [];
                for (let k = 0; k < player.Heart.HitboxRectangles.length; k++) {
                    let updatedRect = Object.create(player.Heart.HitboxRectangles[k]);
                    updatedRect.X += player.Heart.X;
                    updatedRect.Y += player.Heart.Y;
                    updatedHitboxRectangles.push(updatedRect);
                }
            }

            for (let i = 0; i < updatedHitboxRectangles.length; i++) {
                const heartPart = updatedHitboxRectangles[i];
                if (rectangleCollision(heartPart, rect)) {
                    return true;
                }
            }

            return false;
        }
    }
    return false;
}

function rectangleCollision(r1, r2) {
    if (r1.X + r1.Width >= r2.X &&     // r1 right edge past r2 left
        r1.X <= r2.X + r2.Width &&       // r1 left edge past r2 right
        r1.Y + r1.Height >= r2.Y &&       // r1 top edge past r2 bottom
        r1.Y <= r2.Y + r2.Height) {       // r1 bottom edge past r2 top
        return true;
    }
    return false;
}

function drawCards(number) {
    let drawedCards = [];

    for (let i = 0; i < number; i++) {
        drawedCards.push(deck.Cards.pop());
    }

    return (drawedCards);
}

async function revealCards(number) {
    return new Promise(async (resolve) => {
        const cards = drawCards(number);

        let offsetX = 0;
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            await card.offsetCard(-60 + offsetX, box ? box.Y - deck.Y : 100);

            offsetX -= CARD_WIDTH + 16;
        }

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            card.resetTransform();

        }

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            await card.startFlipAnimation();
        }

        setTimeout(() => {
            for (let i = 0; i < cards.length; i++) {
                setTimeout(() => {
                    const card = cards[i];

                    card.div.classList.add("hide");
                }, i * CARDS_OPACITY_DELAY);
            }

            resolve(cards);
        }, CARDS_SHOW_TIME + CARDS_OPACITY_DELAY * cards.length)
    });
}

function gameLoop() {
    setInterval(() => {
        deltaTime = 1 / (performance.now() - lastUpTime);

        applyGravity(deltaTime);
        move(deltaTime);
        forceInBox();

        const stage = stages[currentStage];
        if (!stage._started) {
            stage.start();
        }
        stage.update();
        if (stage._finished) {
            if (currentStage + 2 > stages.length) {
                console.log("End");
            }
            else {
                currentStage++;
            }
        }

        lastUpTime = performance.now();
    }, TARGETED_GAMELOOP_FREQUENCY)
}

function initPositions() {
    const yGlobalOffset = 80;
    const yUpperBoardOffset = 40;
    const yLowerBoardOffset = 30;

    box.X = (window.innerWidth - box.Width) / 2;
    box.Y = (window.innerHeight - box.Height) / 2 + yGlobalOffset;

    player.Heart.X = (window.innerWidth - player.Heart.Width) / 2;
    player.Heart.Y = (window.innerHeight - player.Heart.Height) / 2 + yGlobalOffset;

    healthBar.Width = box.Width
    healthBar.X = (window.innerWidth - healthBar.Width) / 2;
    healthBar.Y = (window.innerHeight + box.Height) / 2 + yLowerBoardOffset + yGlobalOffset;

    boss.X = (window.innerWidth - boss.Width) / 2;
    boss.Y = (window.innerHeight - box.Height) / 2 - boss.Height - yUpperBoardOffset + yGlobalOffset;

    deck.X = window.innerWidth / 2 - box.Width / 2 - 50;
    deck.Y = (window.innerHeight - box.Height) / 2 - CARD_HEIGHT - yUpperBoardOffset + yGlobalOffset - 20;

    dialogueHelper.X = window.innerWidth / 2 + boss.Width / 2 + 50;
    dialogueHelper.Y = (window.innerHeight - box.Height - boss.Height) / 2 - yUpperBoardOffset + yGlobalOffset - 100;
}

function initGame() {
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")//clears console

    stages = [
        new Stage(new Dialog(["ohh, look who showed up! Feeling lucky today ?", "I shuffle, you dodge. Easy peasy.", "But you know the rules, don't you ? In the end, the house always wins.", "Let's see what luck has in store for you !"]), [new AttackOne()], () => { return player.Health <= 40 }),
        new Stage(new Dialog([]), [new AttackTwo()], () => { return player.Health <= 30 }),
    ]
    currentStage = 0;

    box = new Box();
    player = new Player(new Heart());
    healthBar = new HealthBar();
    boss = new Boss();
    deck = new Deck();
    initPositions();
    movementType = MovementType.WASD;
    state = State.Idle;

    gameLoop();
}

initGame()

//keys
function keyAction() {
    if (pressedKeys[90] || pressedKeys[13]) {
        return true;
    }
    return false;
}
function keyUp() {
    if (pressedKeys[90] || pressedKeys[87] || pressedKeys[38]) {
        return true;
    }
    return false;
}
function keyRight() {
    if (pressedKeys[68] || pressedKeys[39]) {
        return true;
    }
    return false;
}
function keyDown() {
    if (pressedKeys[83] || pressedKeys[40]) {
        return true;
    }
    return false;
}
function keyLeft() {
    if (pressedKeys[81] || pressedKeys[65] || pressedKeys[37]) {
        return true;
    }
    return false;
}

//returns a number between min and max but more likely to be in the middle than at the extremes depending on the power
function biasedRandom(min, max, power = 2) {
    // Generate a random number between 0 and 1
    let random = Math.random();

    // Square the random value to skew it towards 0
    random = random ** power;

    if (Math.random() < 0.5) {
        random = -random;
    }

    return random * (max - min) / 2 + (min + max) / 2;
}

function randInt(max){
    return Math.round(Math.random() * max);
}

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

if (!DEBUG) {
    document.documentElement.style.cursor = 'none';

    // var elem = document.documentElement;

    // function openFullscreen() {
    //     if (elem.requestFullscreen) {
    //         elem.requestFullscreen();
    //     } else if (elem.webkitRequestFullscreen) { /* Safari */
    //         elem.webkitRequestFullscreen();
    //     } else if (elem.msRequestFullscreen) { /* IE11 */
    //         elem.msRequestFullscreen();
    //     }
    // }

    // document.addEventListener("click", () => {
    //     openFullscreen();
    // });
}



// document.addEventListener("mousemove", (event) => {
//     console.log([event.clientY])
// });

// document.addEventListener("click", function () {
//     document.body.requestPointerLock();
// });
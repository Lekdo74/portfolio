const TARGETED_GAMELOOP_FREQUENCY = 1 / 60

const PLAYER_MAX_HEALTH = 50;
const PLAYER_SPEED = 50;
const PLAYER_MAX_JUMP_HOLD_TIME = 1;
const PLAYER_JUMP_FORCE = 1200;
const PLAYER_RELEASE_JUMP_FORCE = 400;
const PLAYER_HEALTHBAR_HEIGHT = 30;

const NUMBER_OF_CARDS = 52;
const CARD_WIDTH = 54;
const CARD_HEIGHT = CARD_WIDTH / 27 * 34;

const GRAVITY_FORCE = 50;

let lastUpTime = performance.now();
let movementType;

let currentStage;
let stateFinished = false;

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
            this.div.style.left = this._x + "px";
        }
    }

    get Y() {
        return this._y;
    }
    set Y(value) {
        this._y = value;
        if (typeof this.div !== "undefined") {
            this.div.style.top = this._y + "px";
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
            this.div.style.width = this._width + "px";
        }
    }

    get Height() {
        return this._height;
    }
    set Height(value) {
        this._height = value;
        if (typeof this.div !== "undefined") {
            this.div.style.height = this._height + "px";
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

        this._cards = [];
        for(let i = 0; i < NUMBER_OF_CARDS; i++){
            let card = new Card(this.div);
            card.div.style.transform = "rotate(" + biasedRandom(-6, 6, 2) + "deg) translate(" + biasedRandom(-20, 20, 10) + "%, " + biasedRandom(-20, 20, 10) + "%)";
            
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
    constructor(container = document.body) {
        super();

        this.div = createEl("img", container);
        this.div.src = "./images/cards/back.png";
        this.div.classList.add("card");

        //image en 27x34
        this.Width = CARD_WIDTH;
        this.Height = CARD_HEIGHT;
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

    changeHealth(health){
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

    start(){
        this.Started = true;
        this.EntryEvent.start();
    }

    update(){
        if(this.EntryEvent.OnGoing === true){
            return;
        }

        let eventsOnGoing = false;

        for(let i = 0; i < this.Events.length; i++){
            const event = this.Events[i];

            if(event.OnGoing === true){
                eventsOnGoing = true;
                break;
            }
        }

        if(this.NextStageActivation() && !eventsOnGoing){
            this._finished = true;
            return;
        }

        if(eventsOnGoing === false){
            for(let i = 0; i < this.Events.length; i++){
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

class Dialog extends Attack {
    constructor() {
        super();
    }

    start(){
        this.OnGoing = true;
        console.log("dialog started");

        setTimeout(() => {
            this.OnGoing = false;
            console.log("dialog finished");
        }, 3000);
    }
}

class AttackOne extends Attack {
    constructor() {
        super();
    }

    start(){
        this.OnGoing = true;
        console.log("attack one started");

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

    start(){
        this.OnGoing = true;
        console.log("attack two started");

        setTimeout(() => {
            this.OnGoing = false;
            console.log("attack two finished");
        }, 3000);
    }
}

class MovementType {
    static #WASD = 0;
    static #ADJUMP = 1;

    static get WASD() { return this.#WASD; }
    static get ADJUMP() { return this.#ADJUMP; }
}

class State {
    static #DIALOG = 0;
    static #DRAWINGCARDS = 1;
    static #ATTACK = 2;

    static get DIALOG() { return this.#DIALOG; }
    static get DRAWINGCARDS() { return this.#DRAWINGCARDS; }
    static get ATTACK() { return this.#ATTACK; }
}

let stages;
let box;
let player;
let healthBar;
let boss;
let deck;
let obstacles = [];
// let obstacl = new Obstacle(new Rectangle(window.innerWidth / 2 + 50, window.innerHeight / 2 + 50, 100, 100, true));
// obstacles.push(obstacl);

function cssVar(name, value) {
    if (name[0] != '-') name = '--' + name;
    if (value) document.documentElement.style.setProperty(name, value);
    return getComputedStyle(document.documentElement).getPropertyValue(name);
}

function createEl(tag, container) {
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

function drawCards(number){
    let drawedCards = [];

    for(let i = 0; i < number; i++){
        drawedCards.push(deck.Cards.pop());
    }

    return(drawedCards);
}

function gameLoop() {
    setInterval(() => {
        deltaTime = 1 / (performance.now() - lastUpTime);

        applyGravity(deltaTime);
        move(deltaTime);
        forceInBox();
        
        const stage = stages[currentStage];
        if(!stage._started){
            stage.start();
        }
        stage.update();
        if(stage._finished){
            if(currentStage + 2 >  stages.length){
                console.log("End");
            }
            else{
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

    deck.X = window.innerWidth / 2 + box.Width / 2 + 50;
    deck.Y = (window.innerHeight - box.Height) / 2 - CARD_HEIGHT - yUpperBoardOffset + yGlobalOffset - 20;
}

function initGame() {
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n")//clears console

    stages = [
        new Stage(new Dialog(), [new AttackOne()], () => { return player.Health <= 40 }),
        new Stage(new Dialog(), [new AttackTwo()], () => { return player.Health <= 30 }),
    ]
    currentStage = 0;

    box = new Box();
    player = new Player(new Heart());
    healthBar = new HealthBar();
    boss = new Boss();
    deck = new Deck();
    initPositions();
    movementType = MovementType.WASD;



    gameLoop();
}

initGame()

//keys
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

// document.addEventListener("mousemove", (event) => {
//     console.log([event.clientY])
// });

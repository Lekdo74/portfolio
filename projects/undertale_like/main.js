const TARGETED_GAMELOOP_FREQUENCY = 1 / 60

const PLAYER_SPEED = 50;
const PLAYER_MAX_JUMP_HOLD_TIME = 1;
const PLAYER_JUMP_FORCE = 1200;
const PLAYER_RELEASE_JUMP_FORCE = 400;

const GRAVITY_FORCE = 50;

let lastUpTime = performance.now();
let movementType;


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
        this._heart = heart;
        this._yVelocity = 0;
        this._jumpHoldTime = 0;
        this.Grounded = false;
        this._canJump = false;
        this._releasedJumpKeySinceLastJump = true;
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
    constructor(x, y, w, h, debug = false) {
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

        this.X = (window.innerWidth - this.Width) / 2;
        this.Y = (window.innerHeight - this.Height) / 2;

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

class MovementType {
    static #WASD = 0;
    static #ADJUMP = 1;

    static get WASD() { return this.#WASD; }
    static get ADJUMP() { return this.#ADJUMP; }
}

let box;
let player;
let obstacles = [];
let obstacl = new Obstacle(new Rectangle(window.innerWidth / 2 + 50, window.innerHeight / 2 + 50, 100, 100, true));
obstacles.push(obstacl);

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
            vector[1] = -1;
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
            vector[1] = 1;
        }
    }
    if (keyRight()) {
        vector[0] = 1;
    }
    if (keyLeft()) {
        vector[0] = -1;
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

function gameLoop() {
    setInterval(() => {
        deltaTime = 1 / (performance.now() - lastUpTime);

        applyGravity(deltaTime);
        move(deltaTime);
        forceInBox();
        console.log(checkCollisions());

        // console.log(["grounded", player.Grounded]);
        // console.log(["can jump", player.CanJump]);
        // console.log(["ReleasedJumpKeySinceLastJump", player.ReleasedJumpKeySinceLastJump]);

        lastUpTime = performance.now();
    }, TARGETED_GAMELOOP_FREQUENCY)
}

function initGame() {
    box = new Box();
    player = new Player(new Heart());
    movementType = MovementType.ADJUMP;
    gameLoop()
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


// document.addEventListener("mousemove", (event) => {
//     console.log([event.clientY])
// });

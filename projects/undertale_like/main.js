const TARGETED_GAMELOOP_FREQUENCY = 1 / 60
const PLAYER_SPEED = 0.15;
const GRAVITY_FORCE = 0.25;

let lastUpTime = performance.now();

var pressedKeys = {};
window.onkeyup = function (e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function (e) { pressedKeys[e.keyCode] = true; }

//Combine plusieurs classes en une seule pour extends plusieurs classes
function Classes(bases) {
    class Bases {
        constructor() {
            bases.forEach(base => {
                const instance = new base();
                Object.assign(this, instance);
            });
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
        return this.x;
    }
    set X(value) {
        this.x = value;
        this.div.style.left = this.x + "px";
    }

    get Y() {
        return this.y;
    }
    set Y(value) {
        this.y = value;
        this.div.style.top = this.y + "px";
    }
}

class WidthHeight {
    get Width() {
        return this.width;
    }
    set Width(value) {
        this.width = value;
        this.div.style.width = this.width + "px";
    }

    get Height() {
        return this.height;
    }
    set Height(value) {
        this.height = value;
        this.div.style.height = this.height + "px";
    }
}

class Heart extends Classes([Coordinates, WidthHeight]) {
    constructor() {
        super();

        let heartData = [
            [" ", " ", "x", "x", " ", " ", " ", " ", " ", " ", " ", " ", "x", "x", " ", " "],
            [" ", "x", "x", "x", "x", "x", " ", " ", " ", " ", "x", "x", "x", "x", "x", " "],
            ["x", "x", "x", "x", "x", "x", "x", " ", " ", "x", "x", "x", "x", "x", "x", "x"],
            ["x", "x", "x", "x", "x", "x", "x", " ", " ", "x", "x", "x", "x", "x", "x", "x"],
            ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
            ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
            ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
            ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
            ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
            ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x"],
            [" ", " ", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", " ", " "],
            [" ", " ", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", " ", " "],
            [" ", " ", " ", " ", "x", "x", "x", "x", "x", "x", "x", "x", " ", " ", " ", " "],
            [" ", " ", " ", " ", "x", "x", "x", "x", "x", "x", "x", "x", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", "x", "x", "x", "x", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", "x", "x", "x", "x", " ", " ", " ", " ", " ", " "],
        ];

        this.scale = 1;

        this.div = createEl("div", document.body);
        this.div.classList.add("heart");

        this.Width = heartData[0].length * this.scale;
        this.Height = heartData.length * this.scale;

        for (let i = 0; i < heartData.length; i++) {
            for (let j = 0; j < heartData[0].length; j++) {
                let char = heartData[i][j];
                if (char === "x") {
                    let pixel = createEl("div", this.div);
                    pixel.classList.add("pixel", "red");
                    pixel.style.width = this.scale + "px";
                    pixel.style.height = this.scale + "px";
                    pixel.style.top = i * this.scale + "px";
                    pixel.style.left = j * this.scale + "px";
                }
            }
        }

        this.X = window.innerWidth / 2;
        this.Y = window.innerHeight / 2;
    }
}

class Box extends Classes([Coordinates, WidthHeight]) {
    constructor() {
        super();

        this.div = createEl("div", document.body);
        this.div.classList.add("box");

        this.X = window.innerWidth / 2;
        this.Y = window.innerHeight / 2;
        this.Width = 350;
        this.Height = 350;
    }
}

class Obstacle {
    constructor(shape) {
        this.shape = shape;
    }
}

class Rectangle extends Classes([Coordinates, WidthHeight]) {
    constructor(x, y, w, h) {
        super();

        this.div = createEl("div", document.body);
        this.div.classList.add("obstacle", "green");

        this.X = x;
        this.Y = y;
        this.Width = w;
        this.Height = h;
    }


}

let box;
let heart;
let obstacle = new Obstacle(new Rectangle(window.innerWidth / 2 + 50, window.innerHeight / 2 + 50, 100, 100));

function cssVar(name, value) {
    if (name[0] != '-') name = '--' + name
    if (value) document.documentElement.style.setProperty(name, value)
    return getComputedStyle(document.documentElement).getPropertyValue(name);
}

function createEl(tag, container) {
    element = document.createElement(tag);
    container.appendChild(element);
    return element;
}

function initGame() {
    box = new Box();
    heart = new Heart();
    gameLoop()
}

function applyGravity(deltaTime) {
    let velocity = GRAVITY_FORCE * deltaTime;

    heart.Y = heart.Y + velocity;
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

function move(deltaTime) {
    if (keyUp()) {
        heart.Y -= PLAYER_SPEED * deltaTime;
    }
    if (keyRight()) {
        heart.X += PLAYER_SPEED * deltaTime;
    }
    if (keyDown()) {
        heart.Y += PLAYER_SPEED * deltaTime;
    }
    if (keyLeft()) {
        heart.X -= PLAYER_SPEED * deltaTime;
    }
}

function forceInBox() {
    x1 = heart.X - heart.Width / 2;
    x2 = heart.X + heart.Width / 2;
    y1 = heart.Y - heart.Height / 2;
    y2 = heart.Y + heart.Height / 2;

    upperBoundary = box.Y - box.Height / 2;
    bottomBoundary = box.Y + box.Height / 2;
    leftBoundary = box.X - box.Width / 2;
    rightBoundary = box.X + box.Width / 2;

    if (y1 <= upperBoundary) {
        heart.Y = upperBoundary + heart.Height / 2;
    }
    if (y2 >= bottomBoundary) {
        heart.Y = bottomBoundary - heart.Height / 2;
    }
    if (x1 <= leftBoundary) {
        heart.X = leftBoundary + heart.Width / 2;
    }
    if (x2 >= rightBoundary) {
        heart.X = rightBoundary - heart.Width / 2;
    }
}

function gameLoop() {
    setInterval(() => {
        deltaTime = performance.now() - lastUpTime;

        // applyGravity(deltaTime);
        move(deltaTime);
        forceInBox();

        lastUpTime = performance.now();
    }, TARGETED_GAMELOOP_FREQUENCY)
}

initGame()

// document.addEventListener("mousemove", (event) => {
//     console.log(event.clientY)
// });

const TARGETED_GAMELOOP_FREQUENCY = 1 / 60
const GRAVITY_FORCE = 0.25;

let lastUpTime = performance.now();

class Heart {
    constructor() {
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

        this.div = createEl("div", document.body);
        this.div.classList.add("heart");

        for (let i = 0; i < heartData.length; i++) {
            for (let j = 0; j < heartData[0].length; j++) {
                let char = heartData[i][j];
                if (char === "x") {
                    let pixel = createEl("div", this.div);
                    pixel.classList.add("pixel", "red");
                    pixel.style.top = i + "px";
                    pixel.style.left = j + "px";
                }
            }
        }

        this.X = window.innerWidth / 2;
        this.Y = window.innerHeight / 2;
    }

    get X(){
        return this.x;
    }
    set X(value){
        this.x = value;
        this.div.style.left = this.x + "px";
    }

    get Y(){
        return this.y;
    }
    set Y(value){
        this.y = value;
        this.div.style.top = this.y + "px";
    }
}

class Box{
    constructor(){
        this.div = createEl("div", document.body);
        this.div.classList.add("box");

        this.X = window.innerWidth / 2;
        this.Y = window.innerHeight / 2;
        this.Width = 350;
        this.Height = 350;
    }

    get X(){
        return this.x;
    }
    set X(value){
        this.x = value;
        this.div.style.left = this.x + "px";
    }

    get Y(){
        return this.y;
    }
    set Y(value){
        this.y = value;
        this.div.style.top = this.y + "px";
    }

    get Width(){
        return this.width;
    }
    set Width(value){
        this.width = value;
        this.div.style.width = this.width + "px";
    }

    get Height(){
        return this.height;
    }
    set Height(value){
        this.height = value;
        this.div.style.height = this.height + "px";
    }
}

let box;
let heart;

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
    let currentY = heart.Y;

    let velocity = GRAVITY_FORCE * deltaTime;

    heart.Y = currentY + velocity;
}

function forceInBox() {
    // console.log(parseFloat((box.style.top).slice(0, -2)) + (box.style.height).slice(0, -2) / 2)
}

function gameLoop() {
    setInterval(() => {
        deltaTime = performance.now() - lastUpTime;

        applyGravity(deltaTime);
        forceInBox();

        lastUpTime = performance.now();
    }, TARGETED_GAMELOOP_FREQUENCY)
}

initGame()

// document.addEventListener("mousemove", (event) => {
//     console.log(event.clientY)
// });

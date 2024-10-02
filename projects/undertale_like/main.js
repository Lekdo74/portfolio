const TARGETED_GAMELOOP_FREQUENCY = 1 / 60
const GRAVITY_FORCE = 0.25;

let lastUpTime = performance.now();

let box
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

function createBox(){
    box = createEl("div", document.body);
    box.classList.add("box");

    box.style.top = window.innerHeight / 2 + "px";
    box.style.left = window.innerWidth / 2 + "px";
    box.style.height = "350px";
    box.style.width = "350px";
}

function createHeart(){
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

    heart = createEl("div", document.body);
    heart.classList.add("heart")

    for(let i = 0; i < heartData.length; i++){
        for(let j = 0; j < heartData[0].length; j++){
            let char = heartData[i][j];
            if(char === "x"){
                let pixel = createEl("div", heart);
                pixel.classList.add("pixel", "red")
                pixel.style.top = i + "px";
                pixel.style.left = j + "px";
            }
        }
    }

    heart.style.top = window.innerHeight / 2 + "px";
    heart.style.left = window.innerWidth / 2 + "px";
}

function initGame(){
    createBox()
    createHeart()
    gameLoop()
}

function applyGravity(deltaTime){
    let top = parseFloat(heart.style.top.slice(0, -2));

    let velocity = GRAVITY_FORCE * deltaTime;
    
    heart.style.top = top + velocity + "px";
}

function forceInBox(){
    console.log(parseFloat((box.style.top).slice(0, -2)) + (box.style.height).slice(0, -2) / 2)
}

function gameLoop(){
    setInterval(() => {
        deltaTime = performance.now() - lastUpTime;

        applyGravity(deltaTime);
        forceInBox();

        lastUpTime = performance.now();
    }, TARGETED_GAMELOOP_FREQUENCY)
}

initGame()

document.addEventListener("mousemove", (event) => {
    console.log(event.clientY)
});
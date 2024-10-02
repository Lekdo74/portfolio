const body = document.querySelector("body")
const cliquerCommencer = document.querySelector("#cliquerCommencer")
const textNiveau = document.querySelector("#textNiveau")
const textTimer = document.querySelector("#textTimer")
textTimer.classList.toggle("bigTextTimer")
textNiveau.classList.toggle("bigTextTimer")
const music = document.querySelector("#music")

let waitingScreen = false
let baseTimerRectangleCreation = 0
let timerRectangleCreation = 0
let speed = 0
let timer = 0
let level = 0
let pause = false
let timerEndScreen = 0
let baseTimerParticles = 0
let TimerParticles = 0
let baseTimerNextLevel = 10000
let timerNextLevel = baseTimerNextLevel

let lastInnerWidth = 0
let lastInnerHeight = 0


let rectMinWidthHeight = 0
let rectMaxWidthHeight = 0

myCursor = {
    x:window.innerWidth / 2,
    y:window.innerHeight / 2
}
cursor.setAttribute("style", "top: " + myCursor.y +"px; left: " + myCursor.x + "px;")

particle = {
    div: 0,
    x: 0,
    y: 0,
    size: 0,
    xVel: 0,
    yVel: 0,
    duration: 0
}

let particles = []

rectangle = {
    div: 0,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    xVel: 0,
    yVel: 0
}

let rectangles = []

generateBackground()
waitingScreen = true

let current = Date.now()
let start = Date.now()
let deltaTime = current - start

const intervalFrequency = 1000/60
setInterval(function() {
    current = Date.now()
    deltaTime = (current - start) ;
    start = current;

    if(!waitingScreen){
        if(!pause){
            if(window.innerWidth != lastInnerWidth || window.innerHeight != lastInnerHeight){
                endScreen()
                return
            }
            timer += deltaTime
            timerRectangleCreation -= deltaTime
            if(timerRectangleCreation <= 0){
                timerRectangleCreation = baseTimerRectangleCreation
                createRectangle(Object.create(rectangle))
            }
            timerNextLevel -= deltaTime
            if(timerNextLevel <= 0){
                timerNextLevel = baseTimerNextLevel
                level++
                baseTimerRectangleCreation -= 50
                speed+=0.3
            }
    
            destroyRectanglesOffMap()
            moveRectangles(deltaTime)
            updateText()
            detectCollision()
        }
        else{
            timerEndScreen += deltaTime
    
            if(timerEndScreen <= 2500){
                particles.forEach(function(particle, index){
                    particle.div.style.opacity = "0%"
                })
                if(TimerParticles <= 0){
                    TimerParticles = baseTimerParticles
                    if(baseTimerParticles > 20){
                        baseTimerParticles -= 3
                    }
                    createParticle(Object.create(particle))
                }
                destroyParticles(deltaTime)
                moveParticles(deltaTime)
                TimerParticles -= deltaTime
            }
            else if(timerEndScreen <= 3000){
                destroyParticles(deltaTime)
                moveParticles(deltaTime)
                TimerParticles -= deltaTime
            }
            else{
                cliquerCommencer.classList.toggle("opacityZero")
                textTimer.classList.toggle("bigTextTimer")
                textNiveau.classList.toggle("bigTextTimer")
                pause = false
                waitingScreen = true
            }
        }
    }

}, intervalFrequency);

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

function getRandomNumberDecimal(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function createRectangle(rectangle){
    rectangle.div = document.createElement("div")

    rectangle.width = getRandomNumber(rectMinWidthHeight, rectMaxWidthHeight)
    rectangle.height = getRandomNumber(rectMinWidthHeight, rectMaxWidthHeight)

    const xMin = -rectangle.width + 1
    const yMin = -rectangle.height + 1
    const xMax = window.innerWidth - 1
    const yMax = window.innerHeight - 1

    rectangle.div.style.width = rectangle.width.toString() + "px"
    rectangle.div.style.height = rectangle.height.toString() + "px"

    const position = Math.floor(Math.random() * 4)

    switch(position){
        case 0:
            rectangle.x = -rectangle.width
            rectangle.y = getRandomNumber(-rectangle.height, yMax)
            rectangle.xVel = getRandomNumberDecimal(speed * 0.5, speed * 1.5)
            rectangle.yVel = 0
            break
        case 1:
            rectangle.x = getRandomNumber(-rectangle.width, xMax)
            rectangle.y = -rectangle.height
            rectangle.xVel = 0
            rectangle.yVel = getRandomNumberDecimal(speed * 0.5, speed * 1.5)
            break
        case 2:
            rectangle.x = window.innerWidth
            rectangle.y = getRandomNumber(-rectangle.height, yMax)
            rectangle.xVel = -getRandomNumberDecimal(speed * 0.5, speed * 1.5)
            rectangle.yVel = 0
            break
        case 3:
            rectangle.x = getRandomNumber(-rectangle.width, xMax)
            rectangle.y = window.innerHeight
            rectangle.xVel = 0
            rectangle.yVel = -getRandomNumberDecimal(speed * 0.5, speed * 1.5)
            break
    }

    rectangle.div.style.left = rectangle.x.toString() + "px"
    rectangle.div.style.top = rectangle.y.toString() + "px"

    body.appendChild(rectangle.div)
    rectangle.div.classList.add("rectangle")

    rectangles.push(rectangle)
}

function detectCollision(){
    rectangles.forEach(function(rectangle, index){
        if(myCursor.x >= rectangle.x && myCursor.x <= rectangle.x + rectangle.width && myCursor.y >= rectangle.y && myCursor.y <= rectangle.y + rectangle.height){
            endScreen()
        }
    })
}

function destroyRectanglesOffMap(){
    let indexToRemove = []

    rectangles.forEach(function(rectangle, index){
        let div = rectangle.div
        if((div.style.left.slice(0, -2) <= -rectangle.width && rectangle.xVel <= 0) || (div.style.left.slice(0, -2) >= window.innerWidth && rectangle.xVel >= 0) || (div.style.top.slice(0, -2) <= -rectangle.height && rectangle.yVel <= 0) || (div.style.top.slice(0, -2) >= window.innerHeight && rectangle.yVel >= 0)){
            indexToRemove.push(index)
        }
    })

    for(let i = indexToRemove.length - 1; i >= 0; i--){
        rectangles[indexToRemove[i]].div.remove()
        rectangles.splice(indexToRemove[i], 1)
    }
}

function destroyParticles(intervalFrequency){
    let indexToRemove = []

    particles.forEach(function(particle, index){
        let div = rectangle.div
        if(particle.duration <= 0){
            indexToRemove.push(index)
        }
        else{
            if(particle.duration < 500){
                particle.div.style.opacity = "0%"
            }
            particle.duration -= intervalFrequency
        }
    })

    for(let i = indexToRemove.length - 1; i >= 0; i--){
        particles[indexToRemove[i]].div.remove()
        particles.splice(indexToRemove[i], 1)
    }
}

function moveRectangles(deltaTime){
    rectangles.forEach(function(rectangle, index){
        let div = rectangles[index].div
        rectangle.x += rectangle.xVel * deltaTime / 30
        rectangle.y += rectangle.yVel * deltaTime / 30
        div.style.left = (Number(rectangle.div.style.left.slice(0, -2)) + rectangle.xVel * deltaTime / 30).toString() + "px"
        div.style.top = (Number(rectangle.div.style.top.slice(0, -2)) + rectangle.yVel * deltaTime / 30).toString() + "px"
    })
}

function moveParticles(deltaTime){
    particles.forEach(function(particle, index){
        let div = particles[index].div
        particle.x += particle.xVel * deltaTime / 30
        particle.y += particle.yVel * deltaTime / 30
        div.style.left = (Number(particle.div.style.left.slice(0, -2)) + particle.xVel * deltaTime / 30).toString() + "px"
        div.style.top = (Number(particle.div.style.top.slice(0, -2)) + particle.yVel * deltaTime / 30).toString() + "px"
    })
}

function updateText(){
    textNiveau.innerText = "Niveau " + level.toString()
    let secondes = Math.floor(timer/1000)
    let minutesAffichees = Math.trunc(secondes/60).toString()
    let secondesAffichees = (secondes%60).toString()
    if(secondesAffichees.length <= 1){
        secondesAffichees = "0"+secondesAffichees.toString()
    }
    textTimer.innerText = minutesAffichees + ":" + secondesAffichees
}

function generateBackground(){
    const background = document.createElement("div")
    body.appendChild(background)
    background.style.width = window.screen.width.toString() + "px"
    background.style.height = window.screen.height.toString() + "px"
    background.style.backgroundColor = "black"
}

function endScreen(){
    pause = true
    cursor.classList.toggle("cursoranimation")

    rectangles.forEach(function(rectangle, index){
        rectangle.div.style.opacity = "0%"
    })
}

function createParticle(particle){
    particle.div = document.createElement("div")
    particle.x = myCursor.x
    particle.y = myCursor.y
    particle.div.style.left = myCursor.x.toString() + "px"
    particle.div.style.top = myCursor.y.toString() + "px"
    particle.size = getRandomNumber(2, 5)
    particle.div.style.width = particle.size.toString() + "px"
    particle.div.style.height = particle.size.toString() + "px"
    particle.xVel = getRandomNumberDecimal(1, 8) / 2
    if(getRandomNumber(0, 1) == 0){
        particle.xVel *= -1
    }
    particle.yVel = getRandomNumberDecimal(1, 8) / 2
    if(getRandomNumber(0, 1) == 0){
        particle.yVel *= -1
    }
    particle.duration = getRandomNumber(500, 1000)
    body.appendChild(particle.div)
    particles.push(particle)
    particle.div.classList.add("particle")
    
}

function restart(){
    waitingScreen = false
    rectMinWidthHeight = Math.round(window.innerWidth / 20)
    rectMaxWidthHeight = Math.round(window.innerWidth / 5)
    lastInnerWidth = window.innerWidth
    lastInnerHeight = window.innerHeight
    music.play()
    music.volume=0.5
    cursor.classList.toggle("cursoranimation")
    cliquerCommencer.classList.toggle("opacityZero")
    textTimer.classList.toggle("bigTextTimer")
    textNiveau.classList.toggle("bigTextTimer")
    baseTimerRectangleCreation = 600
    timerRectangleCreation = 0
    speed = 4
    speed = speed / 1920 * window.innerWidth / 1080 * window.innerHeight
    
    timerNextLevel = baseTimerNextLevel
    timer = 0
    level = 1
    timerEndScreen = 0
    baseTimerParticles = 80

    for(let i = rectangles.length - 1; i >= 0; i--){
        rectangles[i].div.remove()
    }
    for(let i = particles.length - 1; i >= 0; i--){
        particles[i].div.remove()
    }
    rectangles = []
    particles = []
}

document.addEventListener('mousemove', e => {
    if(!pause){
        myCursor.x = e.pageX
        myCursor.y = e.pageY
    
        cursor.setAttribute("style", "top: "+(e.pageY - 2)+"px; left: "+(e.pageX - 5)+"px;")
    }
})

document.addEventListener('click', function(e){
    if(waitingScreen){
        cursor.setAttribute("style", "top: "+(e.pageY - 2)+"px; left: "+(e.pageX - 5)+"px;")
        restart()
    }
})
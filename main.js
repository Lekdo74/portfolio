const PDF_URL = "./cv_alexandre_giniaux.pdf";

const css = document.documentElement.style;

var currentCell = null;
var lastCellHovered = null;

function cssVar(name,value){
    if(name[0]!='-') name = '--'+name
    if(value) document.documentElement.style.setProperty(name, value)
    return getComputedStyle(document.documentElement).getPropertyValue(name);
}

function createEl(tag, container){
    element = document.createElement(tag);
    container.appendChild(element);
    return element;
}

function initGrid(){
    grid = createEl("div", document.body);
    grid.id = "background-grid";

    cells_to_generate = Math.ceil(window.screen.width / parseInt(cssVar("cell-width").slice(0, 2)) * window.screen.height / parseInt(cssVar("cell-height").slice(0, 2)))
    
    //il faut en générer plus puisque le grille est penchée pour que ça recouvre tout l'écran
    cells_to_generate *= 4

    for (let i = 0; i < cells_to_generate; i++) {
        addCell(grid);
    }
}

function addCell(container){
    cell = createEl("div", container);
    cell.classList.add("background-cell");
    return cell;
}

function initVignette(){
    vignette = createEl("div", document.body);
    vignette.id = "vignette";
}

function randomCellHoverColor(){
    if(currentCell === lastCellHovered){
        return;
    }

    currentCell = lastCellHovered;

    random_number = Math.floor(Math.random() * 2);

    if(random_number === 0){
        cssVar("cell-hover-color", "rgba(128, 0, 129, 1)");
        return;
    }

    cssVar("cell-hover-color", "rgba(75, 75, 255, 1)");
    return;
}

document.addEventListener('mousemove', (event) => {
    const hoveredElement = document.elementFromPoint(event.clientX, event.clientY);
    if (hoveredElement) {
        lastCellHovered = hoveredElement;
        randomCellHoverColor();
    }
});

function initCV(){
    cv = document.getElementById("cv");
    
    cv.addEventListener("click", () => {
        window.open(PDF_URL, '_blank');
    })
}

initGrid();
initVignette();
initCV();
const css = document.documentElement.style;

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

    for (let i = 0; i < cells_to_generate; i++) {
        addCell(grid);
    }
}

function addCell(container){
    cell = createEl("div", container);
    cell.classList.add("background-cell");
    return cell;
}

initGrid();
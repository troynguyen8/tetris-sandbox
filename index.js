/**
 * An "enum" that maps a color key to a CSS-compatible color
 */
 const PIECE_COLORS = {
    TEAL: 'cyan',
    PURPLE: 'purple',
    RED: 'red',
    BLUE: 'blue',
    YELLOW: 'gold',
    GREEN: 'green',
    ORANGE: 'orange',
    BLACK: 'black',
    WHITE: 'white'
};
const EMPTY_COLOR = PIECE_COLORS.BLACK;

const createGridRow = () => {
    const row = new Array(10);
    row.fill(EMPTY_COLOR);
    return row;
};

/**
 * The in-memory representation of the tetris grid
 * @type {Array} contains 20 subarrays, each of length 10. element 0 is the top row
 */
let grid = new Array(20);
for (let i = 0; i < grid.length; i++) {
    grid[i] = createGridRow();
}

const pcoTemplate = JSON.parse('[["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["red","red","black","black","black","black","orange","orange","orange","cyan"],["purple","red","red","black","black","black","orange","gold","gold","cyan"],["purple","purple","green","green","black","black","blue","gold","gold","cyan"],["purple","green","green","black","black","black","blue","blue","blue","cyan"]]');
grid = pcoTemplate;

const gridContainer = document.querySelector('#table-container');
const colorSelectorContainer = document.querySelector('#color-selector-container');
const lineClearToggleContainer = document.querySelector('#line-clear-toggle-container');
const optionsContainer = document.querySelector('#options-container');
const lineClearToggle = document.querySelector('#line-clear-toggle');
let shouldClearFullLines = lineClearToggle.checked || false;
let selectedColor = PIECE_COLORS.TEAL;
let mouseIsDown = false;
document.onmousedown = () => { mouseIsDown = true; };
document.onmouseup = () => { mouseIsDown = false; };

const onMinoChange = (row, col) => {
    grid[row][col] = selectedColor;
    if (shouldClearFullLines && lineIsFull(row)) {
        clearLine(row);
    }
    disposeGrid();
    constructGridView();
};

const constructColorSelector = () => {
    const htmlSelect = document.createElement('select');
    
    Object.keys(PIECE_COLORS).forEach((colorKey) => {
        const colorFriendlyName = colorKey.toLocaleLowerCase();
        const htmlOption = document.createElement('option');
        htmlOption.text = colorFriendlyName;
        htmlOption.value = colorKey;

        htmlSelect.add(htmlOption);
    });

    htmlSelect.onchange = (ev) => {
        const newlySelectedColor = htmlSelect.value;
        selectedColor = PIECE_COLORS[newlySelectedColor];
    };

    colorSelectorContainer.appendChild(htmlSelect);
};

/**
 * Creates and appends an HTML representation of the TETRIS grid
 */
const constructGridView = () => {
    const htmlTable = document.createElement('table');

    grid.forEach((row, rowIndex) => {
        const htmlRow = htmlTable.insertRow();
        
        row.forEach((mino, colIndex) => {
            const htmlCell = htmlRow.insertCell();
            htmlCell.className = 'mino'
            htmlCell.style = `background-color: ${mino}`;
            htmlCell.onmousedown = () => {
                mouseIsDown = true;
                onMinoChange(rowIndex, colIndex);
            };
            htmlCell.onmouseup = () => {
                mouseIsDown = false;
            };
            htmlCell.onmouseenter = () => {
                if (mouseIsDown) {
                    onMinoChange(rowIndex, colIndex);
                }
            };
        });
    });

    gridContainer.appendChild(htmlTable);
};

const getFilledLinesIndicesSorted = () => {
    const filledLines = [];
    grid.forEach((_, rowIndex) => {
        if (lineIsFull(rowIndex)) {
            filledLines.push(rowIndex);
        }
    });

    return filledLines;
};

const lineIsFull = (rowIndex) => {
    return !grid[rowIndex].some((mino) => mino === EMPTY_COLOR);
};

const clearLine = (rowIndex) => {
    grid.splice(rowIndex, 1);
    grid.unshift(createGridRow());
};

const disposeGrid = () => {
    const table = document.querySelector('table');
    if (table) {
        gridContainer.removeChild(table);
    }
};

// note to self: need to try to solve for ['J', 'S', 'T', 'L', 'Z', 'I', 'O'] and ['O', 'Z', 'S', 'I', 'T', 'J', 'L']
const generateRandomTetrisPieceBag = () => {
    const tetrisPieceNames = ['I', 'L', 'O', 'Z', 'T', 'J', 'S'];
    const randomBag = [];
    while (tetrisPieceNames.length > 0) {
        const randomIndex = Math.floor(Math.random() * tetrisPieceNames.length);
        randomBag.push(tetrisPieceNames.splice(randomIndex, 1));
    }

    return randomBag.flat();
};

disposeGrid();
constructGridView();
constructColorSelector();
lineClearToggle.onchange = (ev) => {
    shouldClearFullLines = ev.target.checked;
    if (shouldClearFullLines) {
        const filledLinesIndices = getFilledLinesIndicesSorted();
        if (filledLinesIndices.length > 0) {
            filledLinesIndices.forEach(index => {
                clearLine(index);
            });

            disposeGrid();
            constructGridView();
        }
        
    }
};

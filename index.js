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

// tracks the last operation done
// is there any way to interact with the actual OS/browser history stack?
// needs to account for line clears as well
// idea 1: keep track of row, col, prev color, next color
    // this does not account for line clears
// idea 2: idea 1 but also keep track if the "operation" triggered a line clear. Keep track of row, col, prev color, next color, entire row
// idea 3: keep track of literally the entire grid every operation
    // easiest but jank - every operation adds like 1.5kb
// idea 4: make remove line an operation in itself
const historyStack = [];

// push onto stack when cmd+z is pressed
// when another operation happens, clear the undostack
const undoStack = [];

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
// variable tracks whether or not a line clear just occurred
// used to ensure unintentional inputs don't occur after line clears
let lineclearDebouncer = false;
document.onmousedown = () => { mouseIsDown = true; };
document.onmouseup = () => { mouseIsDown = false; };
document.onkeydown = (ev) => {
    const isZKey = ev.key === "z" || ev.key === "KeyZ";
    const isYKey = ev.key === "y" || ev.key === "KeyY";

    const isUndo = (isZKey && ev.metaKey && !ev.shiftKey) ||
        (isZKey && ev.ctrlKey && !ev.shiftKey);
    if (isUndo && historyStack.length > 0) {
        // pop off history stack, put onto undo stack
        const operationToUndo = historyStack.pop();
        if (operationToUndo.type === "mino") {
            const { row, col, prevColor } = operationToUndo;
            onMinoChange(row, col, prevColor, true);
            // push onto redo stack?
        }
    }

    const isRedo = (isZKey && ev.metaKey && ev.shiftKey) ||
        (isZKey && ev.ctrlKey && ev.shiftKey) ||
        (isYKey && ev.metaKey);
    if (isRedo) {
        // pop off undo stack, push onto history stack
        console.log('redoing');
    }
};

const onMinoChange = (row, col, newColor = selectedColor, isFromUndo = false) => {
    const prevColor = grid[row][col];
    if (prevColor === newColor) {
        return;
    }

    grid[row][col] = newColor;
    if (!isFromUndo) {
        historyStack.push({
            type: "mino",
            row,
            col,
            prevColor,
            newColor
        });
    }

    if (shouldClearFullLines && lineIsFull(row)) {
        clearLine(row);
        lineclearDebouncer = true;
        setTimeout(() => {
            lineclearDebouncer = false;
        }, 250);
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
                if (mouseIsDown && !lineclearDebouncer) {
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

    // undoing this would entail...
    // removing row off the top
    // adding entire row back at rowIndex
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

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

const getDefaultGrid = () => {
    const defaultGrid = new Array(20);
    for (let i = 0; i < defaultGrid.length; i++) {
        defaultGrid[i] = createGridRow();
    }

    return defaultGrid;
};

const decodeHash = () => {
    if (location.hash) {
        return JSON.parse(decodeURIComponent(location.hash.substring(1)));
    }
    return undefined;
};

// /**
//  * The in-memory representation of the tetris grid
//  * @type {Array} contains 20 subarrays, each of length 10. element 0 is the top row
//  */
let grid;

const gridContainer = document.querySelector('#table-container');
const colorSelectorContainer = document.querySelector('#color-selector-container');
const lineClearToggleContainer = document.querySelector('#line-clear-toggle-container');
const optionsContainer = document.querySelector('#options-container');
const lineClearToggle = document.querySelector('#line-clear-toggle');
let shouldClearFullLines;
let selectedColor;
let mouseIsDown = false;
document.onmousedown = () => { mouseIsDown = true; };
document.onmouseup = () => { mouseIsDown = false; };
document.onkeydown = (ev) => {
    const isZKey = ev.key === "z" || ev.key === "KeyZ";
    const isYKey = ev.key === "y" || ev.key === "KeyY";

    const isUndo = (isZKey && ev.metaKey && !ev.shiftKey) ||
        (isZKey && ev.ctrlKey && !ev.shiftKey);
    if (isUndo) {
        history.back();
    }

    const isRedo = (isZKey && ev.metaKey && ev.shiftKey) ||
        (isZKey && ev.ctrlKey && ev.shiftKey) ||
        (isYKey && ev.metaKey);
    if (isRedo) {
        history.forward();
    }
};

const updateHash = () => {
    location.hash = encodeURIComponent(
        JSON.stringify({
            grid,
            shouldClearFullLines,
            selectedColor
        })
    );
};

const onMinoChange = (row, col) => {
    grid[row][col] = selectedColor;
    if (shouldClearFullLines && lineIsFull(row)) {
        clearLine(row);
    }

    updateHash();
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
        updateHash();
    };

    colorSelectorContainer.appendChild(htmlSelect);

    return htmlSelect;
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

const maybeClearLines = () => {
    if (shouldClearFullLines) {
        const filledLinesIndices = getFilledLinesIndicesSorted();
        if (filledLinesIndices.length > 0) {
            filledLinesIndices.forEach(index => {
                clearLine(index);
            });
        }
    }
};

const colorSelector = constructColorSelector();
lineClearToggle.onchange = (ev) => {
    shouldClearFullLines = ev.target.checked;
    maybeClearLines();
    updateHash();
};

const appStateSetup = () => {
    const newValue = decodeHash();
    if (newValue) {
        grid = newValue.grid;
        shouldClearFullLines = newValue.shouldClearFullLines;
        lineClearToggle.checked = shouldClearFullLines;
        selectedColor = newValue.selectedColor;
        colorSelector.value = Object.keys(PIECE_COLORS).find((colorKey) => PIECE_COLORS[colorKey] === selectedColor);
    } else {
        grid = getDefaultGrid();
        shouldClearFullLines = false;
        lineClearToggle.checked = false;
        selectedColor = PIECE_COLORS.TEAL;
        colorSelector.value = 'TEAL';
    }

    maybeClearLines();
    disposeGrid();
    constructGridView();
}


appStateSetup();
window.addEventListener('hashchange', appStateSetup);

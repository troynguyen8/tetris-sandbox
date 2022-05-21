/**
 * An "enum" that maps a color key to the 
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

/**
 * The in-memory representation of the tetris grid
 * @type {Array} contains 20 subarrays, each of length 10. element 0 is the bottom row
 */
let grid = new Array(20);
for (let i = 0; i < grid.length; i++) {
    const row = new Array(10);
    row.fill(PIECE_COLORS.BLACK)
    grid[i] = row;
}

const pcoTemplate = JSON.parse('[["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["black","black","black","black","black","black","black","black","black","black"],["white","white","white","white","white","white","white","white","white","white"],["white","white","white","white","black","black","black","black","white","white"],["white","white","white","white","black","black","black","white","white","white"],["white","white","white","white","black","black","white","white","white","white"],["white","white","white","white","black","black","black","white","white","white"]]');
grid = pcoTemplate;

const gridContainer = document.querySelector('#table-container');
const optionsContainer = document.querySelector('#options-container');
// TODO: create checkmark select for shouldClearLine, implement logic to remove full lines (splice out of array and prepend)
const shouldClearLine = false;
let selectedColor = PIECE_COLORS.TEAL;

const onMinoClicked = (ev) => {
    // change the color of the mino
    // TODO: reflect the color change back to the grid
    // TODO: dispose previous grid
    // TODO: regenerate grid

    ev.target.style = `background-color: ${selectedColor}`;
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

    optionsContainer.appendChild(htmlSelect);
};

/**
 * Creates and appends an HTML representation of the TETRIS grid
 */
const constructGridView = () => {
    const htmlTable = document.createElement('table');

    grid.forEach((row) => {
        const htmlRow = htmlTable.insertRow();
        
        row.forEach((mino) => {
            const htmlCell = htmlRow.insertCell();
            htmlCell.className = 'mino'
            htmlCell.style = `background-color: ${mino}`;
            htmlCell.onclick = onMinoClicked;
        });
    });

    gridContainer.appendChild(htmlTable);
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

// grid[1][9] = PIECE_COLORS.GREEN;
disposeGrid();
constructGridView();
constructColorSelector();

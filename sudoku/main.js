// Initialize the Sudoku board
document.addEventListener('DOMContentLoaded', () => {
    const switchStyleButton = document.getElementById('switchStyleButton');
    let currentStyle = 'styles.css';

    switchStyleButton.addEventListener('click', () => {
        currentStyle = currentStyle === 'styles.css' ? 'hStyles.css' : 'styles.css';
        switchStyles(currentStyle);
    });
});

function initSudokuBoard(difficulty) {
	const board = document.getElementById('sudokuBoard');
	const sudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
	let solved = false;
	const timeout = 2000; // Timeout in milliseconds
	while (!solved) {
		randomizeRow(sudokuGrid,1); // Randomly fill the first row
		const startTime = new Date().getTime();
		solved = solveSudoku(sudokuGrid, 9, startTime, timeout); // Solve the Sudoku board
		if (!solved) {
			// Reset the board
			for (let i = 1; i < 9; i++) {
				sudokuGrid[i].fill(0);
			}
		}
	}
	blankOutNakedSingles(sudokuGrid, 15); // Blank out up to 15 naked singles
	blankOutHiddenSingles(sudokuGrid, 5 * difficulty); // Blank out up to 30 hidden singles
	blankOutNakedSingles(sudokuGrid, 10 * difficulty); // Blank out any leftover naked singles
	clearBoard();
	for (let i = 0; i < 81; i++) {
		const cell = document.createElement('div');
		cell.classList.add('sudoku-cell');
		cell.setAttribute('data-index', i);
		cell.textContent = sudokuGrid[Math.floor(i / 9)][i % 9] || ''; // Display the number or leave it blank
		if (sudokuGrid[Math.floor(i / 9)][i % 9] === 0) {
			cell.setAttribute('contenteditable', 'true');
			cell.addEventListener('focus', handleCellFocus);
			cell.addEventListener('blur', handleCellBlur);
			cell.addEventListener('input', handleCellInput);
		}
		board.appendChild(cell);
	}
	const checkButton = document.getElementById('checkButton');
	checkButton.addEventListener('click', () => checkSudoku(sudokuGrid));
}
function initFakeSudokuBoard() {
	const board = document.getElementById('sudokuBoard');
	const sudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
	const timeout = 2000; // Timeout in milliseconds
	for (let i = 0; i < 9; i++) {
		randomizeRow(sudokuGrid,i);
	}
	for (let i = 0; i < 81; i++) {
		const cell = document.createElement('div');
		cell.classList.add('sudoku-cell');
		cell.setAttribute('data-index', i);
		cell.textContent = sudokuGrid[Math.floor(i / 9)][i % 9] || ''; // Display the number or leave it blank
		board.appendChild(cell);
	}
}
function getDifficulty() {
	let difficulty = null;
	while (difficulty === null || difficulty < 1 || difficulty > 5) {
		difficulty = parseInt(window.prompt("Please choose a difficulty level (1 to 5):"), 10);
	}
	return difficulty;
}
function checkSudoku(sudokuGrid) {
	const cells = document.getElementsByClassName('sudoku-cell');
	let hasErrors = false;
	let isComplete = true;
	for (let i = 0; i < cells.length; i++) {
		const cell = cells[i];
		const rowIndex = Math.floor(i / 9);
		const colIndex = i % 9;
		const value = parseInt(cell.textContent, 10);
		if (isNaN(value)) {
			isComplete = false;
			continue;
		}
		if (cell.classList.contains('user-entered') && !isSafe(sudokuGrid, rowIndex, colIndex, value)) {
			cell.style.color = 'red';
			hasErrors = true;
		} else {
			cell.style.color = cell.classList.contains('user-entered') ? '#007BFF' : '#333';
		}
	}
	if (!isComplete) {
		alert('The Sudoku is not complete. Please fill in all cells.');
	} else if (!hasErrors) {
		alert('Congratulations! The Sudoku is solved correctly.');
	} else {
		alert('Some errors are present. Please correct them.');
	}
}
function isSafe(board, row, col, num) {
	for (let i = 0; i < 9; i++) {
		if (board[row][i] === num || board[i][col] === num) {
			return false;
		}
	}
	const startRow = row - row % 3;
	const startCol = col - col % 3;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[i + startRow][j + startCol] === num) {
				return false;
			}
		}
	}
	return true;
}
function solveSudoku(board, n, startTime, timeout) {
	let emptyCells = [];
	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			if (board[i][j] === 0) {
				emptyCells.push([i, j]);
			}
		}
	}
	if (emptyCells.length === 0) {
		return true;
	}
	// Shuffle the empty cells array to fill them in a random order
	emptyCells.sort(() => Math.random() - 0.5);
	return solveSudokuHelper(board, n, emptyCells, 0, startTime, timeout);
}
function solveSudokuHelper(board, n, emptyCells, index, startTime, timeout) {
	if (index === emptyCells.length) {
		return true;
	}
	const elapsedTime = new Date().getTime() - startTime;
	if (elapsedTime > timeout) {
		return false;
	}
	const [row, col] = emptyCells[index];
	for (let num = 1; num <= n; num++) {
		if (isSafe(board, row, col, num)) {
			board[row][col] = num;
			if (solveSudokuHelper(board, n, emptyCells, index + 1, startTime, timeout)) {
				return true;
			} else {
				board[row][col] = 0;
			}
		}
	}
	return false;
}
function randomizeRow(board,row) {
	const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
	for (let col = 0; col < 9; col++) {
		board[row][col] = nums[col];
	}
}
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}
function blankOutNakedSingles(board, maxCellsToRemove) {
	let count = 0;
	const nonEmptyCells = shuffle(getNonEmptyCells(board));
	while (count < maxCellsToRemove && nonEmptyCells.length > 0) {
		const [row, col] = nonEmptyCells.pop(); // Get the next non-empty cell
		const originalValue = board[row][col];
		let legalAlternatives = 0;
		for (let num = 1; num <= 9; num++) {
			if (num !== originalValue && isSafe(board, row, col, num)) {
				legalAlternatives++;
				break;
			}
		}
		if (legalAlternatives === 0) {
			board[row][col] = 0;
			count++;
		}
	}
}
function blankOutHiddenSingles(board, maxCellsToRemove) {
	let count = 0;
	const nonEmptyCells = getNonEmptyCells(board);
	nonEmptyCells.sort(() => Math.random() - 0.5); // Shuffle the non-empty cells array
	while (nonEmptyCells.length > 0 && count < maxCellsToRemove) {
		const [row, col] = nonEmptyCells.pop(); // Get the next non-empty cell
		const isHiddenSingle = isSingleInRow(board, row, col) || isSingleInCol(board, row, col) || isSingleInBox(board, row, col);
		if (isHiddenSingle) {
			count++;
		}
	}
}
function isSingleInRow(board, row, col) {
	const value = board[row][col];
	board[row][col] = 0;
	for (let c = 0; c < 9; c++) {
		if (c !== col && board[row][c] === 0 && isSafe(board, row, c, value)) {
			board[row][col] = value;
			return false;
		}
	}
	return true;
}
function isSingleInCol(board, row, col) {
	const value = board[row][col];
	board[row][col] = 0;
	for (let r = 0; r < 9; r++) {
		if (r !== row && board[r][col] === 0 && isSafe(board, r, col, value)) {
			board[row][col] = value;
			return false;
		}
	}
	return true;
}		
function isSingleInBox(board, row, col) {
	const value = board[row][col];
	const boxRowStart = Math.floor(row / 3) * 3;
	const boxColStart = Math.floor(col / 3) * 3;
	board[row][col] = 0;
	for (let r = 0; r < 3; r++) {
		for (let c = 0; c < 3; c++) {
			const newRow = boxRowStart + r;
			const newCol = boxColStart + c;
			if ((newRow !== row || newCol !== col) && board[newRow][newCol] === 0 && isSafe(board, newRow, newCol, value)) {
				board[row][col] = value;
				return false;
			}
		}
	}
	return true;
}
function handleCellFocus(event) {
	event.target.classList.add('focused');
}
function handleCellBlur(event) {
	event.target.classList.remove('focused');
}
function handleCellInput(event) {
	const input = event.data;
	const num = parseInt(input, 10);
	const cell = event.target;
	if (isNaN(num) || num < 1 || num > 9) {
		cell.textContent = '';
		cell.classList.remove('user-entered');
	} else {
		cell.textContent = num;
		cell.classList.add('user-entered');
	}
}
function getNonEmptyCells(board) {
	const nonEmptyCells = [];
	for (let row = 0; row < 9; row++) {
		for (let col = 0; col < 9; col++) {
			if (board[row][col] !== 0) {
				nonEmptyCells.push([row, col]);
			}
		}
	}
	return nonEmptyCells;
}
function showDifficultyPopup() {
	const popup = document.getElementById("difficultyPopup");
	popup.style.display = "block";
	const stars = document.getElementById("stars");
	stars.addEventListener("click", handleStarClick);
}
function handleStarClick(event) {
	if (event.target.classList.contains("star")) {
		const difficulty = parseInt(event.target.getAttribute("data-value"), 10);
		const popup = document.getElementById("difficultyPopup");
		const loadingOverlay = document.getElementById("loadingOverlay");
		popup.style.display = "none";
		loadingOverlay.style.zIndex = "10";
		loadingOverlay.style.visibility = "visible";
		setTimeout(() => {
			initSudokuBoard(difficulty);
			loadingOverlay.style.zIndex = "0";
			loadingOverlay.style.visibility = "hidden";
		}, 100);
	}
}



function switchStyles(styleName) {
    const link = document.querySelector('link[rel="stylesheet"]');
    link.href = styleName;
}

function clearBoard() {
const board = document.getElementById("sudokuBoard");
	while (board.firstChild) {
		board.removeChild(board.firstChild);
	}
}
initFakeSudokuBoard()
showDifficultyPopup()
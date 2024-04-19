// VARIABLES DECLARATION
//game initialized with the following variables: 

let markX = 'x';
let markO = 'o';
const winningPatterns = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

let currentPlayerMark = markO;
let vsPlayer = false;
let oTurn= false;

let winnerX = 0;
let winnerO = 0;
let tie = 0;

let winningArry;
let currentPlayer;

let oppositePlayer = (currentPlayerMark === markO) ? markX : markO; //new addition ref: CPUsmart
 
// Document Object Model (DOM)

const vsCpuBtn = document.getElementById('vs-cpu');
const vsPlayerBtn = document.getElementById('vs-player');
const restartBtn = document.getElementById('restart-btn');

const gameMenuId = document.getElementById('game-menu');
const gamePlayId = document.getElementById('gamePlay');
const pickMarks = document.querySelectorAll('#pick_mark div');
const gameBoardId = document.getElementById('gameBoard_play');

const modeId = document.getElementById('mode');
const backdropId = document.getElementById('backdrop');

const boxes = document.querySelectorAll('.gamePlay-card');


//Functions defined

function setGameModeHandler() {
	const btnClickedId = this.id;

	if (btnClickedId === 'vs-player') vsPlayer = true;

	changeDomLayout(gameMenuId, 'display-block', 'display-none');
	changeDomLayout(gamePlayId, 'display-none', 'display-grid');
	startGame();
}

function changeDomLayout(domELement, firstDisplay, secondDisplay) {
	domELement.classList.remove(firstDisplay);
	domELement.classList.add(secondDisplay);
}

function startGame() {
	setBoardHoverClass();
	setScoreBoard();
	setTurn();

	if (!vsPlayer) playVsCpu();
	else playVsPlayer();
}

function setBoardHoverClass() {
	if (oTurn) {
		gameBoardId.classList.remove(markX);
		gameBoardId.classList.add(markO);
	} else {
		gameBoardId.classList.remove(markO);
		gameBoardId.classList.add(markX);
	}
}

function setScoreBoard() {
	const winnerXId = document.getElementById('x-win');
	const tieId = document.getElementById('tie');
	const winnerOId = document.getElementById('o-win');

	winnerXId.innerHTML = `${
		currentPlayerMark === markX && vsPlayer? 'X (P1)'
		:currentPlayerMark === markO && vsPlayer? 'X (P2)'
		    : currentPlayerMark === markO
			? 'X (CPU)'
			: 'X (YOU)'
	} <span id="x-win-inner" class="gameBoard-highlight">${winnerX}</span>`;
	tieId.innerHTML = `Ties <span id="tie-inner" class="gameBoard-highlight">${tie}</span>`;
	winnerOId.innerHTML = `${
		currentPlayerMark === markX && vsPlayer? 'O (P2)'
		:currentPlayerMark === markO && vsPlayer? 'O (P1)'
			: currentPlayerMark === markO
			?  'O (YOU)'
			:  'O (CPU)'
	} <span id="o-win-inner" class="gameBoard-highlight">${winnerO}</span>`;

updateOppositePlayer(); // Update oppositePlayer accordingly

}

function setTurn() {
	const turnId = document.getElementById('gamePlay-turn');

	turnId.innerHTML = `<svg class="gameBoard-turn-icon">
											<use xlink:href="./assets/icon-${
												oTurn ? markO : markX
											}-default.svg#icon-${
		oTurn ? markO : markX
	}-default"></use>
											</svg> &nbsp; Turn`;
}

function playVsCpu() {
	if (currentPlayerMark === markO) getCpuChoice();
	// CPU starts first
	
	else getPlayerChoice(); 
	// Player starts first

updateOppositePlayer(); // Update oppositePlayer accordingly

}

function playVsPlayer() {
	getPlayerChoice();
}

//CPU made smarter
//..start

function getCpuChoice() {
	currentPlayer = oppositePlayer;

    gameBoardId.classList.remove(markO);
    gameBoardId.classList.remove(markX);

    boxes.forEach(box => box.removeEventListener('click', playHandler));

    setTimeout(() => {
		const bestMove = findBestMove();
		placeMark(boxes[bestMove], currentPlayer);
		setGameLogic();
		getPlayerChoice();
		
	}, Math.floor(Math.random() * 1000) + 1000); //Random delay between 1 and 2 seconds
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < boxes.length; i++) {
        if (!boxes[i].classList.contains(markX) && !boxes[i].classList.contains(markO)) {
            boxes[i].classList.add(oppositePlayer);
            let score = minimax(0, false);
            boxes[i].classList.remove(oppositePlayer);

            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    return bestMove;
}

function minimax(depth, isMaximizing) {

    if (checkWin(currentPlayerMark)) {
		updateOppositePlayer();
        return -1;
    } else if (checkWin(oppositePlayer)) {
        return 1;
    } else if (isDraw()) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;

        for (let i = 0; i < boxes.length; i++) {
            if (!boxes[i].classList.contains(markX) && !boxes[i].classList.contains(markO)) {
                boxes[i].classList.add(oppositePlayer);
                let score = minimax(depth + 1, false);
                boxes[i].classList.remove(oppositePlayer);
                bestScore = Math.max(score, bestScore);
            }
        }

        return bestScore;
    } 
	else {
        let bestScore = Infinity;

        for (let i = 0; i < boxes.length; i++) {
            if (!boxes[i].classList.contains(markX) && !boxes[i].classList.contains(markO)) {
                boxes[i].classList.add(currentPlayerMark);
                let score = minimax(depth + 1, true);
                boxes[i].classList.remove(currentPlayerMark);
                bestScore = Math.min(score, bestScore);
            }
        }

        return bestScore;
    }
}

//..end

function getPlayerChoice() {
	boxes.forEach(box => {
		if (!box.classList.contains('x') && !box.classList.contains('o')) {
			box.addEventListener('click', playHandler, { once: true });
		}
	});
}

function placeMark(box, mark) {
	box.classList.add(mark);
}

function setGameLogic() {
	if (checkWin(currentPlayer)) {
		endGame(false);
	} else if (isDraw()) {
		endGame(true);
	} else {
		swapTurns();
		setBoardHoverClass();
	}
}

function playHandler(event) {
	const box = event.target;
	currentPlayer = oTurn ? markO : markX;

	placeMark(box, currentPlayer);
	setGameLogic();

	if (!vsPlayer && !checkWin(currentPlayer) && !isDraw()) getCpuChoice();
}

function checkWin(currentPlayer) {
	return winningPatterns.some(combination => {
		return combination.every((element, index, array) => {
			let condition = boxes[element].classList.contains(currentPlayer);
			if (condition) winningArry = array;
			return condition;
		});
	});
}

function isDraw() {
	return [...boxes].every(box => {
		return box.classList.contains(markX) || box.classList.contains(markO);
	});
}

function configureModeButtons() {
	const nextRoundBtn = document.getElementById('next-round');
	const quitBtn = document.getElementById('quit');

	nextRoundBtn.addEventListener('click', setNextRound);
	quitBtn.addEventListener('click', () => {
		location.reload();
	});
}

function endGame(draw) {
	const tieInnerId = document.getElementById('tie-inner');

	if (draw) {
		tie++;
		tieInnerId.innerText = tie;

		changeDomLayout(backdropId, 'display-none', 'display-block');
		changeDomLayout(modeId, 'display-none', 'display-block');

		modeId.innerHTML = `
		<h4 class="heading-large">Round Tied</h4>

		<div class="mode-buttons">
			<button id="quit" class="btn silverBtn-small smallBtn">Quit</button>
			<button id="next-round" class="btn yellowBtn-small smallBtn">Next Round</button>
		</div>
		`;
	} else {
		setWinner(oTurn);
	}

	configureModeButtons();
}

function swapTurns() {
	oTurn = !oTurn;
	setTurn();
}

function setWinner() {
	const winnerXInnerId = document.getElementById('x-win-inner');
	const winnerOInnerId = document.getElementById('o-win-inner');

	if (oTurn) winnerO++;
	else winnerX++;

	winnerXInnerId.innerText = winnerX;
	winnerOInnerId.innerText = winnerO;

	winningArry.forEach(index => {
		boxes[index].classList.add('win');
	});

	setTimeout(() => {
		changeDomLayout(backdropId, 'display-none', 'display-block');
		changeDomLayout(modeId, 'display-none', 'display-block');
	}, 500);

	modeId.innerHTML = `<h4 class="heading-small">${
		vsPlayer
			? oTurn
				? 'Player 1 Wins!'
				: 'Player 2 wins!'
			: oTurn && currentPlayerMark === 'o'
			? 'You won!'
			: !oTurn && currentPlayerMark === 'x'
			? 'You won!'
			: 'oh No, you lost...'
			
	}</h4>
	<div class="mode-result">
		<svg class="mode-icon">
			<use xlink:href="./assets/icon-${
				oTurn ? markO : markX
			}.svg#icon-${oTurn ? markO : markX}"></use>
		</svg>
		<h1 class="heading-large heading-large--${
			oTurn ? 'yellow' : 'blue'
		}">takes the round</h1>
	</div>

	<div class="mode-buttons">
		<button id="quit" class="btn silverBtn-small smallBtn">Quit</button>
		<button id="next-round" class="btn yellowBtn-small smallBtn">Next Round</button>
	</div>`;
	updateOppositePlayer();
}

function setNextRound() {
	oTurn = false;

	changeDomLayout(modeId, 'display-block', 'display-none');
	changeDomLayout(backdropId, 'display-block', 'display-none');

	boxes.forEach(box => {
		box.classList.remove(markX);
		box.classList.remove(markO);
		box.classList.remove('win');
		box.removeEventListener('click', playHandler);
	});

	startGame();
}

function restartHandler() {
	modeId.innerHTML = `<h1 class="heading-large">Restart Game?</h1>

	<div class="mode-buttons">
		<button id="btn-cancel" class="btn silverBtn-small smallBtn">
			No, Cancel
		</button>
		<button id="btn-restart" class="btn yellowBtn-small smallBtn">
			Yes, Restart
		</button>
	</div>`;

	const restartBtn = document.getElementById('btn-restart');
	const cancelBtn = document.getElementById('btn-cancel');

	changeDomLayout(modeId, 'display-none', 'display-block');

	restartBtn.addEventListener('click', setNextRound);
	cancelBtn.addEventListener('click', () => {
		changeDomLayout(modeId, 'display-block', 'display-none');
	});
}

function updateOppositePlayer() {
	oppositePlayer = (currentPlayerMark === markO) ? markX : markO;
  }
  

function getUserChoiceHandler() {
	currentPlayerMark = this.id;

	this.classList.add('selected');

	if (this.nextElementSibling)
		this.nextElementSibling.classList.remove('selected');
	else this.previousElementSibling.classList.remove('selected');
updateOppositePlayer(); // Update oppositePlayer accordingly

}

pickMarks.forEach(mark => {
	mark.addEventListener('click', getUserChoiceHandler);
});


restartBtn.addEventListener('click', restartHandler);
vsCpuBtn.addEventListener('click', setGameModeHandler);
vsPlayerBtn.addEventListener('click', setGameModeHandler);
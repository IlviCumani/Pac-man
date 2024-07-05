import ActorClasses from "./actors.js";

export class Ghost {
	constructor(name, startIndexI, startIndexJ, speed, scatterTarget) {
		this.name = name;
		this.startIndexI = startIndexI;
		this.startIndexJ = startIndexJ;
		this.currentIndexI = startIndexI;
		this.currentIndexJ = startIndexJ;
		this.speed = speed;
		this.timerID = NaN;
		this.candyTime = NaN;
		this.mode = this.modes.CHASE;
		this.scatterTarget = scatterTarget;
	}

	modes = {
		CHASE: "chase",
		SCATTER: "scatter",
		CANDY: "m&m",
		DEAD: "dead",
	};

	changeMode() {
		this.timerID = setInterval(() => {
			if (!(this.isCorrectMode(this.modes.CANDY) || this.isCorrectMode(this.modes.DEAD)))
				this.setMode(this.isCorrectMode(this.modes.CHASE) ? this.modes.SCATTER : this.modes.CHASE);
		}, 20000);
	}

	move(grid, squares, pacmanI, pacmanJ, checkForGameOver) {
		let path = this.findPathFromMode(pacmanI, pacmanJ, grid);
		squares[this.currentIndexI][this.currentIndexJ].classList.remove(
			"scared-ghost",
			"ghost",
			"dead-ghost",
			this.name,
		);

		if (path.length > 0) {
			if (grid[this.currentIndexI][this.currentIndexJ] === 0) {
				squares[this.currentIndexI][this.currentIndexJ].classList.add(ActorClasses.PacDot);
			}

			if (grid[this.currentIndexI][this.currentIndexJ] === 2) {
				squares[this.currentIndexI][this.currentIndexJ].classList.add(ActorClasses.GhostLayer);
			}

			const [nextI, nextJ] = path[0];
			this.currentIndexI = nextI;
			this.currentIndexJ = nextJ;

			if (
				this.isCorrectMode(this.modes.DEAD) &&
				this.currentIndexI === this.startIndexI &&
				this.currentIndexJ === this.startIndexJ
			) {
				setTimeout(() => {
					this.mode = this.modes.CHASE;
				}, 2000);
			}

			if (grid[this.currentIndexI][this.currentIndexJ] === 0) {
				squares[this.currentIndexI][this.currentIndexJ].classList.remove(ActorClasses.PacDot);
			}

			if (grid[this.currentIndexI][this.currentIndexJ] === 2) {
				squares[this.currentIndexI][this.currentIndexJ].classList.remove(ActorClasses.GhostLayer);
			}
		}

		squares[this.currentIndexI][this.currentIndexJ].classList.add(
			this.isCorrectMode(this.modes.CANDY)
				? "scared-ghost"
				: this.isCorrectMode(this.modes.DEAD)
				? "dead-ghost"
				: "ghost",

			this.name,
		);

		checkForGameOver();
	}

	findPathFromMode(pacmanI, pacmanJ, grid) {
		switch (this.mode) {
			case this.modes.CHASE:
				return this.findShortestPath(
					this.currentIndexI,
					this.currentIndexJ,
					grid,
					pacmanI,
					pacmanJ,
				);
			case this.modes.SCATTER:
				return this.findShortestPath(
					this.currentIndexI,
					this.currentIndexJ,
					grid,
					this.scatterTarget.pozitionI,
					this.scatterTarget.pozitionJ,
				);
			case this.modes.DEAD:
				return this.findShortestPath(
					this.currentIndexI,
					this.currentIndexJ,
					grid,
					this.startIndexI,
					this.startIndexJ,
				);
			case this.modes.CANDY:
				return this.findShortestPath(
					this.currentIndexI,
					this.currentIndexJ,
					grid,
					this.scatterTarget.pozitionI,
					this.scatterTarget.pozitionJ,
				);
			default:
				return [];
		}
	}

	findShortestPath(ghostRow, ghostCol, gameField, targetRow, targetCol) {
		const fieldRowNum = gameField.length;
		const fieldColNum = gameField[0].length;

		const directions = [
			[-1, 0],
			[0, 1],
			[1, 0],
			[0, -1],
		];

		const visited = Array.from(Array(fieldRowNum), () => Array(fieldColNum).fill(false));

		for (let i = 0; i < fieldRowNum; i++) {
			for (let j = 0; j < fieldColNum; j++) {
				if (gameField[i][j] === 1) {
					visited[i][j] = true;
				}
			}
		}

		const queue = [{ ghostRow, ghostCol, path: [] }];

		visited[ghostRow][ghostCol] = true;

		while (queue.length !== 0) {
			const currentPosition = queue[0];
			queue.shift();

			if (currentPosition.ghostRow === targetRow && currentPosition.ghostCol === targetCol) {
				return currentPosition.path;
			}

			for (const [rowMod, colMod] of directions) {
				const newRow = currentPosition.ghostRow + rowMod;
				const newCol = currentPosition.ghostCol + colMod;

				if (!visited[newRow][newCol]) {
					queue.push({
						ghostRow: newRow,
						ghostCol: newCol,
						path: [...currentPosition.path, [newRow, newCol]],
					});

					visited[newRow][newCol] = true;
				}
			}
		}

		return [];
	}

	handleCandyMode() {
		clearTimeout(this.candyTime);
		if (!this.isCorrectMode(this.modes.DEAD)) {
			this.mode = this.modes.CANDY;
		}

		this.candyTime = setTimeout(() => {
			if (!(this.isCorrectMode(this.modes.DEAD) || this.isCorrectMode("ILVI"))) {
				this.mode = this.modes.CHASE;
				clearInterval(this.timerID);
				this.changeMode();
			}
		}, 6000);
	}

	checkForGhostEaten({ IPosition, JPosition }) {
		return (
			this.isCorrectMode(this.modes.CANDY) &&
			this.currentIndexI === IPosition &&
			this.currentIndexJ === JPosition
		);
	}

	isCorrectMode(correctMode) {
		return this.getMode() === correctMode;
	}

	resetGhost() {
		this.currentIndexI = this.startIndexI;
		this.currentIndexJ = this.startIndexJ;
		clearInterval(this.timerID);
		this.setMode(this.modes.CHASE);
		this.changeMode();
	}

	//? GET && SET
	getName() {
		return this.name;
	}

	getStartPosition() {
		return { startRow: this.startIndexI, startCol: this.currentIndexJ };
	}

	getCurrentPosition() {
		return { currRow: this.currentIndexI, currCol: this.currentIndexJ };
	}

	getMcQueen() {
		return this.speed;
	}

	getMode() {
		return this.mode;
	}

	getTimeID() {
		return this.timerID;
	}

	getAllCSSClasses() {
		return "ghost", "scared-ghost ", this.getName(), "dead-ghost";
	}

	setCurrentPosition(newRow, newCol) {
		this.currentIndexI = newRow;
		this.currentIndexJ = newCol;
	}

	setMode(mode) {
		this.mode = mode;
	}
}

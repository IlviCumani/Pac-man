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
			if (this.mode !== this.modes.CANDY && this.mode !== this.modes.DEAD)
				this.mode = this.mode === this.modes.CHASE ? this.modes.SCATTER : this.modes.CHASE;
		}, 20000);
	}

	move(grid, squares, pacmanI, pacmanJ, checkForGameOver) {
		let path;
		switch (this.mode) {
			case this.modes.CHASE:
				path = this.findShortestPath(
					this.currentIndexI,
					this.currentIndexJ,
					grid,
					pacmanI,
					pacmanJ,
				);
				break;
			case this.modes.SCATTER:
				path = this.findShortestPath(
					this.currentIndexI,
					this.currentIndexJ,
					grid,
					this.scatterTarget.pozitionI,
					this.scatterTarget.pozitionJ,
				);
				break;
			case this.modes.DEAD:
				path = this.findShortestPath(this.currentIndexI, this.currentIndexJ, grid, this.startIndexI, this.startIndexJ);
				break;
			case this.modes.CANDY:
				path = this.findShortestPath(
					this.currentIndexI,
					this.currentIndexJ,
					grid,
					this.scatterTarget.pozitionI,
					this.scatterTarget.pozitionJ,
				);
				break;
			default:
				path = [];
				break;
		}

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

			if (this.mode === this.modes.DEAD && this.currentIndexI === this.startIndexI && this.currentIndexJ === this.startIndexJ) {
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
			this.mode === this.modes.CANDY
				? "scared-ghost"
				: this.mode === this.modes.DEAD
				? "dead-ghost"
				: "ghost",

			this.name,
		);

		checkForGameOver();
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
}

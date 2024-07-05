import ActorClasses from "./actors.js";
import { createBoard, horizontalMovement, verticalMovement } from "./utils.js";
import { Ghost } from "./ghost.js";
import layout from "./layout.js";

window.addEventListener(
	"keydown",
	function (e) {
		if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
			e.preventDefault();
		}
	},
	false,
);

document.addEventListener("DOMContentLoaded", () => {
	const grid = document.querySelector(".grid");
	const scoreDisplay = document.getElementById("score");
	const lives = document.querySelector(".lives");

	const modal = document.getElementById("end-modal");
	const modalText = document.getElementById("restart-text");
	const modalButton = document.getElementById("restart-btn");
	const restartStore = document.getElementById("restart-score");
	const resultImage = document.getElementById("result-image");

	let currLive = 0;
	let winStatus = false;
	const keyInputs = ['a', 'A', 'd', 'D', 's', 'S', 'w', 'W']

	const PACMAN_START_ROW = 28;
	const PACMAN_START_COL = 25;

	let score = 0;
	const squares = createBoard(grid);

	const pacmanPozition = {
		IPosition: PACMAN_START_ROW,
		JPosition: PACMAN_START_COL,
	};

	squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove(ActorClasses.PacDot);
	squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.add(ActorClasses.Pacman);

	const ghosts = [
		new Ghost("blinky", 7, 42, 300, { pozitionI: 1, pozitionJ: 1 }),
		new Ghost("pinky", 7, 45, 150, { pozitionI: 1, pozitionJ: 51 }),
		new Ghost("inky", 9, 42, 200, { pozitionI: 29, pozitionJ: 1 }),
		new Ghost("clyde", 9, 45, 250, { pozitionI: 29, pozitionJ: 51 }),
	];

	ghosts.forEach((ghost) => {
		squares[ghost.startIndexI][ghost.startIndexJ].classList.add(ghost.name, "ghost");
		ghost.changeMode();
		setInterval(() => {
			ghost.move(
				layout,
				squares,
				pacmanPozition.IPosition,
				pacmanPozition.JPosition,
				checkForGameOver,
			);
		}, ghost.speed);
	});

	let keypressed = "d";

	function movePacman() {
		setInterval(() => {
			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove(
				ActorClasses.Pacman,
			);

			switch (keypressed) {
				case "a":
				case "A":
					horizontalMovement(-1, pacmanPozition);
					break;
				case "w":
				case "W":
					verticalMovement(-1, pacmanPozition);
					break;
				case "d":
				case "D":
					horizontalMovement(1, pacmanPozition);
					break;
				case "s":
				case "S":
					verticalMovement(1, pacmanPozition);
					break;
			}
			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.add(
				ActorClasses.Pacman,
			);
			eatPacDot();
			eatPowerPallet();
			checkForWin();
			checkForGameOver();
		}, 120);
	}

	movePacman();

	document.addEventListener("keyup", (event) => {
		for (const keyInput of keyInputs) {
			if(event.key === keyInput)
				keypressed = event.key;
		}
			
	});

	function eatPacDot() {
		if (
			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.contains(
				ActorClasses.PacDot,
			)
		) {
			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove(
				ActorClasses.PacDot,
			);
			layout[pacmanPozition.IPosition][pacmanPozition.JPosition] = -1;
			score++;
			scoreDisplay.innerHTML = score;
		}
	}

	function eatPowerPallet() {
		if (
			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.contains(
				ActorClasses.PowerPallet,
			)
		) {
			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove(
				ActorClasses.PowerPallet,
			);
			layout[pacmanPozition.IPosition][pacmanPozition.JPosition] = -2;
			score += 30;
			scoreDisplay.innerHTML = score;

			ghosts.forEach((ghost) => {
				ghost.handleCandyMode()
			});
		}
	}

	setInterval(() => {
		checkForGhostEaten();
	}, 1);

	function checkForGhostEaten() {
		ghosts.forEach((ghost) => {
			if (
				ghost.checkForGhostEaten(pacmanPozition)
			) {
				if (layout[ghost.currentIndexI][ghost.currentIndexJ] === 0) {
					squares[ghost.currentIndexI][ghost.currentIndexJ].classList.add(ActorClasses.PacDot);
					eatPacDot();
				}

				ghost.setMode(ghost.modes.DEAD)
				scoreDisplay.innerHTML = score += 100;
			}
		});
	}

	function checkForWin() {
		for (let i = 0; i < layout.length; i++) {
			for (let j = 0; j < layout[0].length; j++) {
				if (layout[i][j] === 0 || layout[i][j] === 3) {
					return;
				}
			}
		}
		winStatus = true;
		showEndResult();
		modalButton.addEventListener("click", resetEverything);
	}

	function checkForGameOver() {
		if (squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.contains("ghost")) {
			ghosts.forEach((ghost) => {
				squares[ghost.currentIndexI][ghost.currentIndexJ].classList.remove(
					"scared-ghost",
					"ghost",
					"dead-ghost",
					ghost.name,
				);

				if (layout[ghost.currentIndexI][ghost.currentIndexJ] === 0) {
					squares[ghost.currentIndexI][ghost.currentIndexJ].classList.add(ActorClasses.PacDot);
				}

				ghost.resetGhost()
			});

			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove(
				ActorClasses.Pacman,
			);
			pacmanPozition.IPosition = PACMAN_START_ROW;
			pacmanPozition.JPosition = PACMAN_START_COL;

			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.add(
				ActorClasses.Pacman,
			);

			const currLiveElement = document.getElementById(`live${++currLive}`);
			lives.removeChild(currLiveElement);

			if (currLive === 3) {
				showEndResult();
				modalButton.addEventListener("click", resetEverything);
			}
		}
	}

	function showEndResult() {
		ghosts.forEach((ghost) => {
			ghost.setMode('ILVI')
			clearInterval(ghost.getTimeID());
		});
		keypressed = "";
		modalText.innerHTML = winStatus ? "WIN" : "LOST";
		resultImage.src = winStatus ? "./asset/win.jpeg" : "./asset/lost.png";
		restartStore.innerHTML = `Score: ${score}`;
		modal.showModal();
	}

	function resetEverything() {
		score = 0;
		scoreDisplay.innerHTML = score;
		modal.close();
		winStatus = false;
		for (; currLive >= 1; currLive--) {
			lives.innerHTML += `<img id=live${currLive} src='./asset/pac_the_man.png'>`;
		}

		for (let i = 0; i < layout.length; i++) {
			for (let j = 0; j < layout[0].length; j++) {
				if (layout[i][j] === -1) {
					squares[i][j].classList.add(ActorClasses.PacDot);
					layout[i][j] = 0;
				} else if (layout[i][j] === -2) {
					squares[i][j].classList.add(ActorClasses.PowerPallet);
					layout[i][j] = 3;
				}
			}
		}

		keypressed = "d";

		ghosts.forEach((ghost) => {
			ghost.resetGhost()
		});

		pacmanPozition.IPosition = PACMAN_START_ROW;
		pacmanPozition.JPosition = PACMAN_START_COL;
		squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.add(ActorClasses.Pacman);
	}
});

import layout from "./layout.js";
import ActorClasses from "./actors.js";

const squares = [];

// const layoutt = layout
// 	for (let i = 0; i < layout.length; i++){
// 		for(let j = 0; j < layout[0].length; j++ ){
// 			if(i === 0 || j === 0 || i === layout.length - 1 || j === layout[0].length - 1){
// 				layoutt[i][j] = 1
// 			}
// 			else {
// 				layoutt[i][j] = -1
// 			}
// 		}
// }
// layoutt[3][3] = 3

export function createBoard(grid) {
	for (let i = 0; i < layout.length; i++) {
		squares.push([]);
		for (let j = 0; j < layout[0].length; j++) {
			const square = document.createElement("div");
			square.id = "" + i + j;
			grid.appendChild(square);

			squares[i].push(square);

			if (layout[i][j] === 0) {
				squares[i][j].classList.add(ActorClasses.PacDot);
			}

			if (layout[i][j] === 1) {
				squares[i][j].classList.add(ActorClasses.Wall.Default);

				if (layout[i][j + 1] !== 1) {
					squares[i][j].classList.add(ActorClasses.Wall.Right);
				}

				if (layout[i][j - 1] !== 1) {
					squares[i][j].classList.add(ActorClasses.Wall.Left);
				}

				if (i === layout.length - 1 || layout[i + 1][j] !== 1) {
					squares[i][j].classList.add(ActorClasses.Wall.Bottop);
				}

				if (i === 0 || layout[i - 1][j] !== 1) {
					squares[i][j].classList.add(ActorClasses.Wall.Top);
				}
			}

			if (layout[i][j] === 2) {
				squares[i][j].classList.add(ActorClasses.GhostLayer);
			}
			if (layout[i][j] === 3) {
				squares[i][j].classList.add(ActorClasses.PowerPallet);
			}
		}
	}
	return squares;
}

export function horizontalMovement(direction, pacmanPozition) {
	if (
		!squares[pacmanPozition.IPosition][pacmanPozition.JPosition + direction].classList.contains(
			ActorClasses.Wall.Default,
		) &&
		!squares[pacmanPozition.IPosition][pacmanPozition.JPosition + direction].classList.contains(
			ActorClasses.GhostLayer,
		)
	) {
		squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove("rotateUp");
		squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove("rotateDown");
		squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove(
			"flip-pacman-horizont",
		);
		pacmanPozition.JPosition += direction;

		direction > 0
			? squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove(
					"flip-pacman-horizont",
			  )
			: squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.add(
					"flip-pacman-horizont",
			  );
	}
}

export function verticalMovement(direction, pacmanPozition) {
	if (
		!squares[pacmanPozition.IPosition + direction][pacmanPozition.JPosition].classList.contains(
			ActorClasses.Wall.Default,
		) &&
		!squares[pacmanPozition.IPosition + direction][pacmanPozition.JPosition].classList.contains(
			ActorClasses.GhostLayer,
		)
	) {
		squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove(
			"flip-pacman-horizont",
		);
		squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove("rotateUp");
		squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.remove("rotateDown");
		pacmanPozition.IPosition += direction;
		if (direction < 0) {
			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.add("rotateUp");
		} else {
			squares[pacmanPozition.IPosition][pacmanPozition.JPosition].classList.add("rotateDown");
		}
	}
}
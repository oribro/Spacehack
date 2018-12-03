/* Board size constants */
const X_ASPECT 		= 16;
const Y_ASPECT 		= 9;
const ASPECT_MUL 	= 3;
const HEIGHT 		= Y_ASPECT * ASPECT_MUL;
const WIDTH 		= X_ASPECT * ASPECT_MUL;

/* Game environment ASCII symbols */
const CHARACTER = '@';
const GROUND 	= '#';

/* Create the board and fill environment */
var i, j, biDigI, biDigJ;
for(i = 0; i < HEIGHT; i++) {
	biDigI = ("0" + i).slice(-2);
	var div = document.createElement("div");
	div.setAttribute("id","r"+biDigI);
	document.getElementById("game").appendChild(div);
	for(j = 0; j < WIDTH; j++) {
		biDigJ = ("0" + j).slice(-2);
		var span = document.createElement("span");
		span.setAttribute("id","c"+biDigI+biDigJ);
		document.getElementById("r"+biDigI).appendChild(span);
		document.getElementById("c"+biDigI+biDigJ).innerHTML = "#";
	}
}

// Places the character at the top left.
document.getElementById("c0000").innerHTML = "@";

// TODO: create character position var.

// Temp. movement event.
document.body.onkeydown = function(event) {move(event)}

/* Character movement */
function move(event) {
	var key = event.key;
	console.log(key);
	
	switch(key) {
		case "ArrowRight":
			// TODO: check boundaries.
			// TODO: set current character cell to ground symbol.
			// TODO: set cell to the right to character symbol.
			// TODO: set character position var to new position.
			break;
		case "ArrowLeft":
			// TODO: check boundaries.
			// TODO: set current character cell to ground symbol.
			// TODO: set cell to the left to character symbol.
			// TODO: set character position var to new position.
			break;
		case "ArrowUp":
			// TODO: check boundaries.
			// TODO: set current character cell to ground symbol.
			// TODO: set cell above to character symbol.
			// TODO: set character position var to new position.
		case "ArrowDown":
			// TODO: check boundaries.
			// TODO: set current character cell to ground symbol.
			// TODO: set cell below to character symbol.
			// TODO: set character position var to new position.
	}
}


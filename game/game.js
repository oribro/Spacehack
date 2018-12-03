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
	biDigI = getTwoDigits(i);
	var div = document.createElement("div");
	div.setAttribute("id","r"+biDigI);
	document.getElementById("game").appendChild(div);
	for(j = 0; j < WIDTH; j++) {
		biDigJ = getTwoDigits(j);
		var span = document.createElement("span");
		span.setAttribute("id","c"+biDigI+biDigJ);
		document.getElementById("r"+biDigI).appendChild(span);
		document.getElementById("c"+biDigI+biDigJ).innerHTML = GROUND;
	}
}

var character = {
	x: 0,
	y: 0,
	
	get xPos() {
		return this.x;
	},
	get yPos() {
		return this.y;
	},
	set xPos(n) {
		this.x = n;
	},
	set yPos(n) {
		this.y = n;
	}
};

// Places the character at the top left.
moveChar(0,0);

// Temp. movement event.
document.body.onkeydown = function(event) {move(event)}

/* Character movement */
function move(event) {
	var key = event.key;
	console.log(key);
	
	switch(key) {
		case "ArrowRight":
			if(checkBounds(character.xPos + 1, character.yPos)) {
				moveChar(character.xPos + 1, character.yPos);
			}
			break;
		case "ArrowLeft":
			if(checkBounds(character.xPos - 1, character.yPos)) {
				moveChar(character.xPos - 1, character.yPos);
			}
			break;
		case "ArrowUp":
			if(checkBounds(character.xPos, character.yPos - 1)) {
				moveChar(character.xPos, character.yPos - 1);
			}
			break;
		case "ArrowDown":
			if(checkBounds(character.xPos, character.yPos + 1)) {
				moveChar(character.xPos, character.yPos + 1);
			}
			break;
		default:
			break;
	}
}

/* Returns true if given position is in bounds, false otherwise */
function checkBounds(xPos, yPos) {
	if(xPos < 0 || xPos > (WIDTH - 1)) {
		return false;
	}
	if(yPos < 0 || yPos > (HEIGHT - 1)) {
		return false;
	}
	return true;
}

/* Redraws and sets character at new position */
function moveChar(xPos, yPos) {
	var biDigX = getTwoDigits(xPos);
	var biDigY = getTwoDigits(yPos);
	var biDigCurX = getTwoDigits(character.xPos);
	var biDigCurY = getTwoDigits(character.yPos);
	
	// Set current character cell to ground symbol and new cell to character symbol.
	document.getElementById("c"+biDigCurY+biDigCurX).innerHTML = GROUND;
	document.getElementById("c"+biDigY+biDigX).innerHTML = CHARACTER;
	
	// Set character position properties to new position.
	character.xPos = xPos;
	character.yPos = yPos;
}

/* Returns a 2 digit number of a 1-2 digits number */
function getTwoDigits(n) {
	return ("0" + n).slice(-2);
}


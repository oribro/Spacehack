/* Board size constants */
const X_ASPECT 		= 16;
const Y_ASPECT 		= 9;
const ASPECT_MUL 	= 3;
const HEIGHT 		= Y_ASPECT * ASPECT_MUL;
const WIDTH 		= X_ASPECT * ASPECT_MUL;

/* Game environment ASCII symbols */
const PLAYER = '@';
const GROUND 	= '#';
const ENEMY = '*';

/* Symbol colors */
const C_PLAYER = "white";
const C_GROUND = "orange";
const C_NPC = "red";

'use strict';

/*
* Game setup
*/
window.onload = () => {

	// Create the board.
	boardInit();

	// Create a new player character.
	// Places the character at the top left.
	player = new Player(0, 0);
	
	// Temp. movement event.
	document.body.onkeydown = function(event) {player.move(event)};

	// Create 3 Enemies.
	// Place them at the remaining corners of the board.
	enemy1 = new NPC(0, HEIGHT-1);
	enemy2 = new NPC(WIDTH-1, 0);
	enemy3 = new NPC(WIDTH-1, HEIGHT-1);
}

/* Turn counter */
var turn = 0;

/* Create the board and fill environment */
function boardInit() {
	var i, j, biDigI, biDigJ;
	for(i = 0; i < HEIGHT; i++) {
		biDigI = getTwoDigits(i);
		var div = document.createElement("div");
		div.setAttribute("id","r"+biDigI);
		document.getElementById("game-board").appendChild(div);
		for(j = 0; j < WIDTH; j++) {
			biDigJ = getTwoDigits(j);
			var span = document.createElement("span");
			span.setAttribute("id","c"+biDigI+biDigJ);
			document.getElementById("r"+biDigI).appendChild(span);
			document.getElementById("c"+biDigI+biDigJ).innerHTML = GROUND;
			document.getElementById("c"+biDigI+biDigJ).style.color = C_GROUND;
		}
	}
	document.getElementById("turn-stat").innerHTML = turn;
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


/* Returns a 2 digit number of a 1-2 digits number */
function getTwoDigits(n) {
	return ("0" + n).slice(-2);
}

/* Returns a random position within the given dimensions */
function getRandomPosition(xMax=HEIGHT, yMax=WIDTH) {
	xPos = Math.floor((Math.random() * xMax));
	yPos = Math.floor((Math.random() * yMax));

	return [
		xPos,
		yPos
	];
}

/** Increments turn counter and prints it to the stat line **/
function incrementTurnCounter() {
	turn++;
	document.getElementById("turn-stat").innerHTML = turn;
}

/*
*	Class for a game character
*/

class Character {

	constructor(x=0, y=0){
		this.x = x;
		this.y = y;
	}

	get xPos() {
		return this.x;
	}
	get yPos() {
		return this.y;
	}
	set xPos(n) {
		this.x = n;
	}
	set yPos(n) {
		this.y = n;
	}

	/* Redraws the ground and sets character at new position.
	*  Returns the new position to draw the character symbol at.
	*/
	moveChar(xPos, yPos) {

		var biDigCurX = getTwoDigits(this.xPos);
		var biDigCurY = getTwoDigits(this.yPos);
		
		// Set current character cell to ground symbol and color.
		document.getElementById("c"+biDigCurY+biDigCurX).innerHTML = GROUND;
		document.getElementById("c"+biDigCurY+biDigCurX).style.color = C_GROUND;
		
		// Set character position properties to new position.
		this.xPos = xPos;
		this.yPos = yPos;
		
		// Increment the turn counter.
		incrementTurnCounter();

		return [
			xPos,
			yPos
		];
	}

}


/*
*	Class for the human player character.
*/
class Player extends Character {

	constructor(x=0, y=0){
		super(x, y);
		this.draw(x, y);
	}

	move(event) {
		var key = event.key;
		console.log(key);
		let newBiDig = []; 
		
		switch(key) {
			case "ArrowRight":
				if(checkBounds(this.xPos + 1, this.yPos)) {
					newBiDig = this.moveChar(this.xPos + 1, this.yPos);
					// Draw the character symbol at the updated location.
					this.draw(...newBiDig);
				}
				break;
			case "ArrowLeft":
				if(checkBounds(this.xPos - 1, this.yPos)) {
					newBiDig = this.moveChar(this.xPos - 1, this.yPos);
					// Draw the character symbol at the updated location.
					this.draw(...newBiDig);
				}
				break;
			case "ArrowUp":
				if(checkBounds(this.xPos, this.yPos - 1)) {
					newBiDig = this.moveChar(this.xPos, this.yPos - 1);
					// Draw the character symbol at the updated location.
					this.draw(...newBiDig);
				}
				break;
			case "ArrowDown":
				if(checkBounds(this.xPos, this.yPos + 1)) {
					newBiDig = this.moveChar(this.xPos, this.yPos + 1);
					// Draw the character symbol at the updated location.
					this.draw(...newBiDig);
				}
				break;
			default:
				break;
		}

	}

	/*
	*	Draws the character symbol at the given position. 
	*/
	draw(xPos, yPos){
		const biDigX = getTwoDigits(xPos);
		const biDigY = getTwoDigits(yPos);
		document.getElementById("c"+biDigY+biDigX).innerHTML = PLAYER;
		document.getElementById("c"+biDigY+biDigX).style.color = C_PLAYER;
	}
}

/*
* Class for a Non Playable Character.
*/
class NPC extends Character{

	constructor(x, y){
		super(x, y);
		this.draw(x, y);
	}

	/*
	*	Draws the character symbol at the given position.
	*/
	draw(xPos, yPos){
		const biDigX = getTwoDigits(xPos);
		const biDigY = getTwoDigits(yPos);
		document.getElementById("c"+biDigY+biDigX).innerHTML = ENEMY;
		document.getElementById("c"+biDigY+biDigX).style.color = C_NPC;
	}

}





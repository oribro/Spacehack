/* Board size constants */
const X_ASPECT 		= 16;
const Y_ASPECT 		= 9;
const ASPECT_MUL 	= 3;
const HEIGHT 		= Y_ASPECT * ASPECT_MUL;
const WIDTH 		= X_ASPECT * ASPECT_MUL;

/* Game environment ASCII symbols */
const PLAYER = '@';
const GROUND 	= '#';
const NON_PLAYER = '*';
const SHIP = '^';

/* Symbol colors */
const C_PLAYER = "white";
const C_GROUND = "orange";
const C_NPC = "red";
const C_SHIP = "purple";

/* Character traits */
const DEFAULT_HP = 20;

'use strict';

/*
* Game setup
*/
window.onload = () => {

	// Create the board.
	boardInit();

	// Create a new player character.
	// Places the character at the top left.
	var player = new Player(8, 7);

	promptContinue(player);

	// Temp. movement event.
	//document.body.onkeydown = function(event) {player.move(event)};

	// Create npcs and keep them in the browser storage.
	npcs = getNPCArray();
	sessionStorage.setItem(
		'npcs', JSON.stringify(npcs)
	);
	
}

// Create NPCS.
// Place them at the remaining corners of the board.
function getNPCArray(){
	return [
	 	new NPC(0, HEIGHT-1),
		new NPC(WIDTH-1, 0),
	 	new NPC(WIDTH-1, HEIGHT-1),
		new NPC(
			parseInt((WIDTH/2).toFixed(0)),
			parseInt((HEIGHT/2).toFixed(0))
		)
	];
}

/* Turn counter */
var turn = 0;

/* Game log string */
var log = "";

/* Index for the strings array */
var stringIndex = 1;

/* Enable/disable movement */
var movement = false;

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
			
			setCell("c"+biDigI+biDigJ, GROUND, C_GROUND);
		}
	}
	// Ship.
	setCell("c0505", SHIP, C_SHIP);
	setCell("c0604", SHIP, C_SHIP);
	setCell("c0605", SHIP, C_SHIP);
	setCell("c0606", SHIP, C_SHIP);
	setCell("c0703", SHIP, C_SHIP);
	setCell("c0704", SHIP, C_SHIP);
	setCell("c0705", SHIP, C_SHIP);
	setCell("c0706", SHIP, C_SHIP);
	setCell("c0707", SHIP, C_SHIP);
	
	// Ship debris.
	setCell("c1207", SHIP, C_SHIP);
	setCell("c1208", SHIP, C_SHIP);
	setCell("c1618", SHIP, C_SHIP);
	setCell("c1619", SHIP, C_SHIP);
	setCell("c1718", SHIP, C_SHIP);
	setCell("c1719", SHIP, C_SHIP);
	
	document.getElementById("turn-value").innerHTML = turn;
	document.getElementById("hp-value").innerHTML = DEFAULT_HP;

	// Print first text to log.
	printToLog(STRINGS[0]);
}

/* Deletes the prompt message and prints next string */
function nextString(player) {
	log = log.replace(CONTINUE_PROMPT, HR);
	printToLog(STRINGS[stringIndex]);
	stringIndex++;
	document.body.onkeydown = function(event) {player.move(event)};
}

/* Prompts the player to press a key */
function promptContinue(player) {
	movement = false;
	printToLog(CONTINUE_PROMPT);
	document.body.onkeydown = function(event) {nextString(player)};
}

/* Returns true if given position is in bounds and movable, false otherwise.
*  xPos, yPos: Number.
*	npcs: Array<NPC>. Character cannot stand where an NPC is found.
*/
function checkBounds(xPos, yPos, npcs) {
	// Check for board bounds.
	if(xPos < 0 || xPos > (WIDTH - 1)) {
		return false;
	}
	if(yPos < 0 || yPos > (HEIGHT - 1)) {
		return false;
	}
	
	var biDigX = getTwoDigits(xPos);
	var biDigY = getTwoDigits(yPos);
	
	// Movement possible only if cell is ground.
	if(document.getElementById("c"+biDigY+biDigX).innerText != GROUND) {
		return false;
	}
	return true;
	
	/*// Check for NPCs.
	// If there are npcs in the way the check fails.
	return !npcs.some(
		(npc) => {
			return xPos === npc.x && yPos === npc.y
		}
	);*/
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
	document.getElementById("turn-value").innerHTML = turn;
}


/* Prints string to game log */
function printToLog(string) {
	if(log === "") {
		log += string;
	} else {
		log += "\n" + string;
	}
	
	var logElement = document.getElementById("log");
	logElement.innerHTML = log;
	// Automatic scroll log to bottom.
	//logElement.scrollTop = logElement.scrollHeight;
}

/* TODO: make it work. */
/* Prints to the log 'length' strings starting from STRINGS[index], then prompts to continue */
function plot(index, length, player) {
	for (;index < length; index++) {
		printToLog(STRINGS[index]);
	}
	promptContinue(player);
}

/* Sets a symbol and color to a cell */
function setCell(cell, symbol, color) {
	document.getElementById(cell).innerHTML = symbol;
	document.getElementById(cell).style.color = color;
}
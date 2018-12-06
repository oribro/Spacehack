/* Board size constants */
const X_ASPECT 		= 16;
const Y_ASPECT 		= 9;
const ASPECT_MUL 	= 2;
const HEIGHT 		= Y_ASPECT * ASPECT_MUL;
const WIDTH 		= X_ASPECT * ASPECT_MUL;

/* Assets directory */
const ASSETS = "assets/";

/* Game tileset */
const TILESET = "tileset/"
const T_PLAYER = ASSETS + TILESET + "player1.png";
const T_GROUND 	= ASSETS + TILESET + "ground1.png";
const T_NON_PLAYER = ASSETS + TILESET + "npc1.png";
const T_SHIP = ASSETS + TILESET + "ship1.png";

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

/* Use tileset or ASCII */
const useTileset = true;

'use strict';

/*
* Game setup
*/
window.onload = () => {

	// Create the board.
	boardInit();

	// Subscribe game events.
	var eventSys = new EventSystem();
	subscribeGameEvents(eventSys);

	// Create a new player character.
	// Places the character at the top left.
	var player = new Player(8, 7);

	eventSys.publish(EVENT.WAKEUP, player);

	/*// Create npcs and keep them in the browser storage.
	npcs = getNPCArray();
	sessionStorage.setItem(
		'npcs', JSON.stringify(npcs)
	);
	*/
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
		div.setAttribute("id", "r"+biDigI);
		div.setAttribute("class", "tileline");
		document.getElementById("game-board").appendChild(div);
		for(j = 0; j < WIDTH; j++) {
			biDigJ = getTwoDigits(j);
			var span = document.createElement("span");
			span.setAttribute("id","c"+biDigI+biDigJ);
			document.getElementById("r"+biDigI).appendChild(span);
			setCell("c"+biDigI+biDigJ, T_GROUND, GROUND, C_GROUND);
		}
	}
	
	// Ship.
	setCell("c0505", T_SHIP, SHIP, C_SHIP);
	setCell("c0604", T_SHIP, SHIP, C_SHIP);
	setCell("c0605", T_SHIP, SHIP, C_SHIP);
	setCell("c0606", T_SHIP, SHIP, C_SHIP);
	setCell("c0703", T_SHIP, SHIP, C_SHIP);
	setCell("c0704", T_SHIP, SHIP, C_SHIP);
	setCell("c0705", T_SHIP, SHIP, C_SHIP);
	setCell("c0706", T_SHIP, SHIP, C_SHIP);
	setCell("c0707", T_SHIP, SHIP, C_SHIP);
	
	// Ship debris.
	setCell("c1207", T_SHIP, SHIP, C_SHIP);
	setCell("c1208", T_SHIP, SHIP, C_SHIP);
	setCell("c1618", T_SHIP, SHIP, C_SHIP);
	setCell("c1619", T_SHIP, SHIP, C_SHIP);
	setCell("c1718", T_SHIP, SHIP, C_SHIP);
	setCell("c1719", T_SHIP, SHIP, C_SHIP);
	
	document.getElementById("turn-value").innerHTML = turn;
	document.getElementById("hp-value").innerHTML = DEFAULT_HP;

	// Print first text to log.
	printToLog(STRINGS[EVENT.WAKEUP]);
}

/* Deletes the prompt message and prints next string */
function exitShip(player) {
	const playerPos = [player.xPos, player.yPos];
	player.draw(...playerPos);
	log = log.replace(CONTINUE_PROMPT, HR);
	printToLog(STRINGS[EVENT.EXIT_SHIP]);
	document.body.onkeydown = function(event) {player.move(event)};
}

/* Prompts the player to press a key */
function promptContinue(player) {
	movement = false;
	printToLog(CONTINUE_PROMPT);
	document.body.onkeydown = function(event) {exitShip(player)};
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
	if((!useTileset && (document.getElementById("c"+biDigY+biDigX).innerText != GROUND)) || (useTileset && (document.getElementById("i"+biDigY+biDigX).src.search(T_GROUND) == -1))) {
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
function setCell(cell, tile, symbol, color) {
	var element = document.getElementById(cell);
	if(useTileset) {
		var imgElement = element.getElementsByTagName("img").length
		if(imgElement < 1) {
			var img = document.createElement("img");
			document.getElementById(cell).appendChild(img);
			img.setAttribute("id", cell.replace('c','i'));
			img.setAttribute("src", tile);
		} else {
			element.getElementsByTagName("img")[0].setAttribute("src", tile);
		}
	} else {
		element.innerHTML = symbol;
		element.style.color = color;
	}
}
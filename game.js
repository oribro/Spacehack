/* Board size constants */
const X_ASPECT 		= 16;
const Y_ASPECT 		= 9;
const ASPECT_MUL 	= 2;
const HEIGHT 		= Y_ASPECT * ASPECT_MUL;
const WIDTH 		= X_ASPECT * ASPECT_MUL;
const MAX_FIRE_RANGE = 11;

/* Assets directory */
const ASSETS = "assets/";

/* Game tileset */
const TILESET = "tileset/"
const T_PLAYER = ASSETS + TILESET + "player1.png";
const T_GROUND 	= ASSETS + TILESET + "ground1.png";
const T_NON_PLAYER = ASSETS + TILESET + "npc1.png";
const T_SHIP1 = ASSETS + TILESET + "ship1.png";
const T_SHIP2 = ASSETS + TILESET + "ship2.png";
const T_SHIP3 = ASSETS + TILESET + "ship3.png";
const T_SHIP4 = ASSETS + TILESET + "ship4.png";
const T_SHIP5 = ASSETS + TILESET + "ship5.png";
const T_SHIP6 = ASSETS + TILESET + "ship6.png";
const T_SHIP7 = ASSETS + TILESET + "ship7.png";
const T_DEBRIS1 = ASSETS + TILESET + "debris1.png";
const T_DEBRIS2 = ASSETS + TILESET + "debris2.png";
const T_COINS = ASSETS + TILESET + "coins.png";
const T_RATION = ASSETS + TILESET + "ration.png";
const T_VEGETATION1 = ASSETS + TILESET + "vegetation1.png";
const T_VEGETATION2 = ASSETS + TILESET + "vegetation2.png";
const T_SAND_G = ASSETS + TILESET + "sand_g.png";
const T_BEACH1 = ASSETS + TILESET + "beach1.png";
const T_WATER1 = ASSETS + TILESET + "water1.png";
const T_BOULDER1 = ASSETS + TILESET + "boulder1.png";
const T_BOULDER2 = ASSETS + TILESET + "boulder2.png";
const T_BOULDER3 = ASSETS + TILESET + "boulder3.png";
const T_FIRE1 = ASSETS + TILESET + "fire1.png";
const T_BUCKET = ASSETS + TILESET + "bucket.png";

/* Game sounds */
const SOUNDS = "sounds/"
const FIRE_SOUND = ASSETS + SOUNDS + "fire.mp3";

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
	var player = new Player(6, 5);
	
	// Create an event system and make it accessible to all files.
	var eventSys = new EventSystem();
	// Note: this is a bad practice, we should find other way to do it.
	window.eventSys = eventSys;

	// TODO: Enable subscriptions of class methods so we don't have to pass player.
	// Subscribe game events.
	window.eventSys.subscribeGameEvents(player);
	window.eventSys.publish(EVENT.WAKEUP, player);


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
var movement = true;

/* Sound of fire burning */
var fireSound = new sound(FIRE_SOUND);

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
			if(j == 0) {
				setCell("c"+biDigI+biDigJ, T_WATER1);
				span.setAttribute("walkable", "false");
			} else if (j == 1) {
				setCell("c"+biDigI+biDigJ, T_BEACH1);
				span.setAttribute("walkable", "false");
				span.lastElementChild.setAttribute("class", "water");
			} else if (j == 2) {
				setCell("c"+biDigI+biDigJ, T_SAND_G);
				span.setAttribute("walkable", "true");
			} else if(j == WIDTH - 5) {
				setCell("c"+biDigI+biDigJ, T_VEGETATION2);
				span.setAttribute("walkable", "true");
			} else if(j >= WIDTH - 4) {
				setCell("c"+biDigI+biDigJ, T_VEGETATION1);
				span.setAttribute("walkable", "true");
			} else {
				setCell("c"+biDigI+biDigJ, T_GROUND);
				span.setAttribute("walkable", "true");
			}
		}
	}
	
	spawnGameObjects();

	// Print first text to log.
	printToLog(STRINGS[EVENT.WAKEUP]);
}

/* Checks whether a cell is walkable. */
function isWalkable(cell) {
	var cellElement = document.getElementById(cell);
	if(cellElement.getAttribute("walkable") == "true") {
		return true;
	}
	return false;
}

function spawnGameObjects() {

	// Ship.
	setTileOnTop("c0505", T_SHIP2);
	setTileOnTop("c0605", T_SHIP3);
	setTileOnTop("c0606", T_SHIP4);
	setTileOnTop("c0604", T_SHIP5);
	setTileOnTop("c0705", T_SHIP6);
	setTileOnTop("c0805", T_SHIP7);
	
	// Fire on ship.
	["c0604", "c0705", "c0805"].forEach(
		cell => {
			setTileOnTop(cell, T_FIRE1);
			// Important: assuming fire is on top of the other tile layers.
			// We use here the fact that setTileOnTop sets the fire as the last child element.
			document.getElementById(cell).lastElementChild.setAttribute("class", "fire");
		});

	// Ship debris.
	setTileOnTop("c0318", T_DEBRIS1);
	setTileOnTop("c0512", T_DEBRIS2);
	setTileOnTop("c1205", T_DEBRIS1);
	setTileOnTop("c1619", T_DEBRIS2);
	setTileOnTop("c1018", T_DEBRIS1);
	setTileOnTop("c1704", T_DEBRIS2);

	// Item spawn
	spawnItem(
		"c1010", 
		T_COINS, 
		ITEMS["Coins"]
	);
	spawnItem(
		"c1626", 
		T_COINS, 
		ITEMS["Coins"]
	);
	spawnItem(
		"c0729", 
		T_COINS, 
		ITEMS["Coins"]
	);

	document.getElementById("turn-value").innerHTML = turn;
	document.getElementById("hp-value").innerHTML = DEFAULT_HP;
}

/* Spawns a game item at the given cell with the given item parameters.
*  cell: string. The DOM element that contains the cell.
*  tile: string. Path to the image that represents the tile.
*  item: string. Item string representation.
*/
function spawnItem(cell, tile, item) {
	// Spawn item image
	setTileOnTop(cell, tile);
	document.getElementById(cell).setAttribute("item", item);
}

/*
*  Creates a game item object from the string in the cell assuming such
*  a string is found.
*/
function createItemFromCell(cell) {
	cellElement = document.getElementById(cell);
	if (cellElement.hasAttribute("item")) {
		let item = cellElement.getAttribute("item");
		let itemNameLastIndex = item.indexOf(";");
		let name = item.slice(0, itemNameLastIndex);
		let itemValueFirstIndex = item.lastIndexOf(";") + 1;
		let value = item.slice(itemValueFirstIndex);
		item = new Item(name);
		// Update item value with the value from the cell.
		// TODO: Constructor for name and value maybe?
		item.value = value;
		return item;
	}
	return null;
}

/* Sets the given item on the given cell */
function setItemOntoCell(cell, item) {
	setTileOnTop(cell, item.tile);
	let cellElement = document.getElementById(cell);
	cellElement.setAttribute("item", item.toString());
}

/* Removes item from the given cell if item exists, otherwise nothing happens. */
function removeItemFromCell(cell) {
	let cellElement = document.getElementById(cell);
	if (cellElement.hasAttribute("item")) {
		cellElement.removeAttribute("item");
		removeTileOnTop(cell);
	}
}

/* Function for adding sound files to the game.
*  path: string. The path for the sound file.
*/
function sound(path) {
    this.sound = document.createElement("audio");
    this.sound.src = path;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.setAttribute("loop", "true");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    }
    this.stop = function(){
        this.sound.pause();
    }    
}

/* Plays fire sound as long as the player is close enough */
function shouldFirePlay(fireSound, player) {
	let fire = document.getElementsByClassName("fire")[0];
	// Fire still burning and player is out of range then he can't hear the sound.
	if (fire.getAttribute("display") !== "none") {
		if (player.xPos > MAX_FIRE_RANGE || player.yPos > MAX_FIRE_RANGE) {
			fireSound.stop();
		}
		else
			fireSound.play();
	}
}

/* Deletes the prompt message and prints next string */
function exitShip(player) {
	const playerPos = [player.xPos, player.yPos];
	player.draw(...playerPos);
	log = log.slice(0, log.lastIndexOf("\n") - 1);
	printToLog(STRINGS[EVENT.EXIT_SHIP]);
	fireSound.play();
	document.body.onkeydown = function(event) {
		control(event, player);
		// Check if the player is within a reasonable distance from the fire
		// such that he can still hear it burning.
		shouldFirePlay(fireSound, player);
	};
	
}

/* Prompts the player to press a key */
function promptContinue(player) {
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
	
	// Check if cell is walkable.
	if(!isWalkable("c" + biDigY + biDigX)) {
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
		log += "\n\n" + string;
	}
	
	var logElement = document.getElementById("log");
	logElement.innerHTML = log;
	// Automatic scroll log to bottom.
	logElement.scrollTop = logElement.scrollHeight;
}

/* TODO: make it work. */
/* Prints to the log 'length' strings starting from STRINGS[index], then prompts to continue */
function plot(index, length, player) {
	for (;index < length; index++) {
		printToLog(STRINGS[index]);
	}
	promptContinue(player);
}

/* Sets a tile to a cell */
function setCell(cell, tile) {
	var element = document.getElementById(cell);
	var imgElement = element.getElementsByTagName("img").length
	if(imgElement < 1) {
		var img = document.createElement("img");
		document.getElementById(cell).appendChild(img);
		img.setAttribute("id", cell.replace('c','i'));
		img.setAttribute("src", tile);
	} else {
		element.getElementsByTagName("img")[0].setAttribute("src", tile);
	}
}

/* Sets a tile on top of the tile already in the cell. */
function setTileOnTop(cell, tile) {
	var img = document.createElement("img");
	document.getElementById(cell).appendChild(img);
	document.getElementById(cell).style.position = "relative";
	img.setAttribute("id", cell.replace('c', 'o'));
	img.setAttribute("src", tile);
	img.style.position = "absolute";
	img.style.top = "0";
	img.style.left = "0";
	document.getElementById(cell).setAttribute("walkable", "false");
}

/* Returns the tile on top of the tile already in the cell. */
function getTileOnTop(cell) {
	var cellElement = document.getElementById(cell);
	if(cellElement.getElementsByTagName("img").length > 1) {
		return document.getElementById(cell.replace("c", "o"));
	}
}

/* Removes the tile that covers another tile */
function removeTileOnTop(cell) {
	var overTile = document.getElementById(cell.replace('c','o'));
	document.getElementById(cell).removeChild(overTile);
	document.getElementById(cell).setAttribute("walkable", "true");
}

/*
* Function for introducing delay into the game.
* Calling this function should freeze game execution.
* duration: number. The amount of time to sleep.
*/
function sleep(duration){
	return new Promise(
		resolve => setTimeout(resolve, duration)
	);
}

/* Shows/hides the controls window */
function toggleControls() {
	var controls = document.getElementById("controls");
	if(controls.style.display != "block") {
		controls.style.display = "block";
	} else {
		controls.style.display = "none";
	}
}

/* Shows/hides the inventory window */
function toggleInventory(player) {
	var inventory = document.getElementById("inventory");
	if(inventory.style.display != "block") {
		repopInv(player);
		inventory.style.display = "block";
	} else {
		inventory.style.display = "none";
	}
}

/* Repopulates the player inventory */
function repopInv(player) {
	var invElement = document.getElementById("inventory");
	
	// Removes old inventory list.
	var invLists = document.getElementsByClassName("inv-list");
	if(invLists.length > 0) {
		invElement.removeChild(invLists[0]);
	}

	// Creates new inventory list.
	var olElement = document.createElement("ol");
	olElement.setAttribute("class", "inv-list");
	invElement.appendChild(olElement);
	var inventory = player.getInventory();
	var i;
	for(i = 0; i < inventory.length; i++) {
		var liElement = document.createElement("li");
		var li = olElement.appendChild(liElement);
		li.setAttribute("id", "inv-item-"+i);
		let item = inventory[i];
		li.innerHTML =  item.name + " (" + item.type + ", " + item.value + ")";
	}
	
}

/* Stacks all items in the inventory of the given item into one pile of items.
*  Return the inventory with all items that are similar to the given item
*  stacked as one item.
*/
function itemStack(inventory, sampleItem) {
	return inventory.filter(
		item => item.name !== sampleItem.name
	).concat(
		new Item(
			sampleItem.name,
			sampleItem.type,
			inventory.filter(
				item => item.name === sampleItem.name
			).map(
				item => parseInt(item.value)
			).reduce(
				(val1, val2) => val1 + val2,
				0
			)
		)
	);
}


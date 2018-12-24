/*** util.js 
   * File for utility functions.
 ***/

 
/******************* TILES *******************/ 

/* Sets a tile on top of the tile already in the cell. */
function setTileOnTop(cell, tile, walkable) {
	var img = document.createElement("img");
	var cellElement = document.getElementById(cell);
	cellElement.appendChild(img);
	cellElement.style.position = "relative";
	img.setAttribute("id", cell.replace('c', 'o'));
	img.setAttribute("src", tile);
	img.style.position = "absolute";
	img.style.top = "0";
	img.style.left = "0";
	cellElement.setAttribute("walkable", walkable.toString());
	setEnv(cell, tile);
}

/* 'Overloaded' function for setting a tile on top of a tile.
 * Calls setTileOnTop() with any number of cells passed as arguments after 'tile' and 'walkable'. */
function setTilesOnTop(tile, walkable) {
	for(i = 2; i < arguments.length; i++) {
		setTileOnTop(arguments[i], tile, walkable);
	}
}


/* Removes the tile that covers another tile and set the 'env' attribute to the value of the bottom tile.
 * walkable: boolean. optional parameter to set the walkable attribute of the cell */
function removeTileOnTop(cell, walkable) {
	var overTile = document.getElementById(cell.replace('c','o'));
	if(overTile) {
		var cellElement = document.getElementById(cell);
		cellElement.removeChild(overTile);
		
		let bottomTile = cellElement.getElementsByTagName("img")[0].getAttribute("src");
		setEnv(cell, bottomTile);
		
		if(walkable != undefined) {
			if(walkable == true) {
				document.getElementById(cell).setAttribute("walkable", "true");
			} else {
				document.getElementById(cell).setAttribute("walkable", "false");
			}
		}
	}
}

/* Hides the given tile in the given cell */
function hideTile(cell, tile) {
	var cellImgElements = document.getElementsByTagName("img");
	let i;
	for(i = 0; i < cellImgElements.length; i++) {
		if(cellImgElements[i].getAttribute("src").search(tile) != -1) {
			cellImgElements[i].style.visibility = "hidden";
		}
	}
}


/******************* CELLS *******************/

/* Returns true if given position is in bounds, false otherwise */
function inBounds(cell) {
	let xPos = parseInt(cell.slice(3));
	let yPos = parseInt(cell.slice(1,3));
	// Check for board bounds.
	if(xPos < 0 || xPos > (WIDTH - 1)) {
		return false;
	}
	if(yPos < 0 || yPos > (HEIGHT - 1)) {
		return false;
	}
	return true;
}

/* Checks whether a cell is walkable. */
function isWalkable(cell) {
	var cellElement = document.getElementById(cell);
	if(cellElement.getAttribute("walkable") == "true") {
		return true;
	}
	return false;
}

/* Checks if a cell is movable. 
 * Cell is movable only if it's within board bounds and its 'walkable' attribute is set to 'true' */
function isMovable(cell) {
	return (inBounds(cell) && isWalkable(cell));
}

/* Sets a tile to a cell */
function setCell(cell, tile, walkable) {
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
	setEnv(cell, tile);
	element.setAttribute("walkable", walkable.toString());
}

/* Sets the cell to an environment game object */
function setEnv(cell, tile) {
	var cellElement = document.getElementById(cell);
	var env = tile.slice(15).toLowerCase();
	env = env.slice(0, -4);
	cellElement.setAttribute("env", env);
}

/* Takes a cell and returns its env attribute, or null if it doesn't have it */
function getEnv(cell) {
	var cellElement = document.getElementById(cell);
	if(cellElement.hasAttribute("env")) {
		return cellElement.getAttribute("env");
	}
	return null;
}


/******************* LOG *******************/

/* Prompts the player to press a key */
function promptContinue(player) {
	printToLog(CONTINUE_PROMPT);
	document.body.onkeydown = function(event) {exitShip(player)};
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

/* Stops movement and prompts the user to input a direction for the action */
function promptDirection(action) {
	movement = false;
	actionExecuted = action;
	printToLog("In what direction do you want to perform the action?");
}


/******************* INTERFACE *******************/

/* Hides any open left windows */
function hideLeftWindow() {
	var leftWindows = document.getElementsByClassName("left-window");
	Array.from(leftWindows).forEach(function (window) {
		window.style.display = "none";
	});
}

/* Shows/hides the controls window */
function toggleExtStats() {
	var stats = document.getElementById("extended-stats");
	if(stats.style.display != "block") {
		stats.style.display = "block";
	} else {
		stats.style.display = "none";
	}
}

/* Shows/hides the extended stats window */
function toggleControls() {
	var controls = document.getElementById("controls");
	if(controls.style.display != "block") {
		hideLeftWindow();
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

/* Shows/hides the equipment window */
function toggleEquipment() {
	var equipment = document.getElementById("equipment");
	if(equipment.style.display != "block") {
		hideLeftWindow();
		equipment.style.display = "block";
	} else {
		equipment.style.display = "none";
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
		if(item.isEquipped) {
			li.style.color = "green";
		}
		if(!item.meetsReq(player)) {
			li.style.color = "red";
		}
		if(item.lvl != 0) {
			li.innerHTML =  item.name + " (" + item.type + ", " + item.value + ", Lvl " + item.lvl + ")";
		} else {
			li.innerHTML =  item.name + " (" + item.type + ", " + item.value + ")";
		}
	}
	
}

/* Takes an item name and sets its information in the relevant equipment slot */
function updateEquipment(name) {
	let type = ITEMS[name].split(";")[1];
	let value = ITEMS[name].split(";")[2];
	
	switch (type) {
		case "Weapon":
			var equipmentSlot = document.getElementById("weapon-slot");
			break;
		case "Mask":
			var equipmentSlot = document.getElementById("mask-slot");
			break;
		case "Suit":
			var equipmentSlot = document.getElementById("suit-slot");
			break;
	}
	equipmentSlot.innerHTML = name + " (" + value + ")";
}


/******************* SOUND *******************/

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
	this.volume = function(vol) {
		this.sound.volume = vol;
	}
	this.loop = function(shouldLoop) {
		this.sound.loop = shouldLoop;
	}
}

function createSound(soundPath, isLoop) {
	let newSound = new sound(soundPath);
	newSound.loop(isLoop);
	newSound.play();
	return newSound;
}

/* Plays fire sound in a volume according to player position */
function shouldFirePlay(fireSound, player, fireXPos, fireYPos) {
	let fire = document.getElementsByClassName("fire")[0];
	// Distance between player and source of fire.
	var distance = Math.sqrt(Math.pow((player.xPos - fireXPos), 2) + Math.pow((player.yPos - fireYPos), 2));
	// Volume to reduce.
	var distVolOffset = distance/10;
	// Reduce volume by distVolOffset+FIRE_DIST_OFFSET but stay within 0 and 1.
	fireSound.volume(Math.max(Math.min(1, 1-distVolOffset+FIRE_DIST_OFFSET), 0));
}


/******************* OTHER *******************/

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

/** Increments turn counter and prints it to the stat line, advances NPCs **/
function incrementTurnCounter(player) {
	turn++;
	document.getElementById("turn-value").innerHTML = turn;
	player.updateLevel();
	npcs.forEach(function(npc) {
		if(npc.status == "enemy") {
			if(!npc.die()) {
				npc.attack(player);
				npc.move(player);
			}
			return;
		}
	});
	if(plot == 1) {
		plot++;
		npcs.push(new NPC(31, 9, "Dogfish", "enemy"));
		var dogfishSnarl = new sound(DOGFISH_SNARL);
		dogfishSnarl.loop(false);
		dogfishSnarl.play();
		printToLog("\"What was that?!\"");
	}
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
 
// DEPRECATED
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

/* To Infinity and beyond! */
function godmode(player) {
	player.hp = Infinity;
	player.hunger = Infinity;
	let hpVal = document.getElementById("hp-value");
	hpVal.innerHTML = "&infin;";
	hpVal.style.fontSize = "1em";
}

/* Util function for creating a range of numbers in an array.
*  The range is from start to end - inclusive.
*/
function range(start, end) {
  return Array(end - start + 1).fill().map(
  	(_, idx) => start + idx
  );
}
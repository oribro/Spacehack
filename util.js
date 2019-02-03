/*** util.js 
   * File for utility functions.
 ***/

// Variable for keeping track of sleep function calls.
var sleepNum;
 
/******************* TILES *******************/ 

/* Sets a tile on top of the tile already in the cell. */
function setTileOnTop(cell, tile, walkable) {
	var img = document.createElement("img");
	var cellElement = document.getElementById(cell);
	var lastChild = cellElement.lastElementChild;
	if(lastChild.getAttribute("src").search("player") != -1) {
		cellElement.insertBefore(img, lastChild);
	} else {
		cellElement.appendChild(img);
	}
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
	var overTile = document.getElementById(cell).lastElementChild;
	if(overTile) {
		var cellElement = document.getElementById(cell);
		cellElement.removeChild(overTile);
		
		let bottomTile = cellElement.lastElementChild.getAttribute("src");
		setEnv(cell, bottomTile);
		
		if(walkable != undefined) {
			if(walkable == true) {
				document.getElementById(cell).setAttribute("walkable", "true");
			} else {
				document.getElementById(cell).setAttribute("walkable", "false");
			}
		}
		if(document.getElementById(cell).lastElementChild != null) {
			if(document.getElementById(cell).lastElementChild.getAttribute("src").search("player") != -1) {
				removeTileOnTop(cell, walkable);
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
	// If game is loaded from storage, pass keydown event straight to control.
	if(localStorage.length != 0) {
		document.body.onkeydown = function(event) {
			if(plot <= PLOT.DOGFISH) {
				fireSound.play();
			}
			control(event, player);
			// Check if the player is within a reasonable distance from the fire
			// such that he can still hear it burning.
			shouldFirePlay(fireSound, player, 5, 7);
		};
	} else {
		printToLog(CONTINUE_PROMPT);
		document.body.onkeydown = function(event) {exitShip(player)};
	}
}

/* Prints string to game log 
 * inline: Optional. If set, prints string in the same line as last string.
 */
function printToLog(string, inline) {
	if(log === "" || inline) {
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

/* Prints a message and prompts the user for input. 
 * confirm: Optional. If set, acts as a confirm prompt. Will only return Y/N. 
 */
async function promptInput(message, confirm) {
	if(confirm === undefined) {
		printToLog(message + " ");
	} else {
		printToLog(message + " (Y/n): ");
	}
	
	var inputLength = 0; // Counts the number of characters the user has entered.
	var enterPressed = false; // Changes to true when user pressed the enter key.
	
	var handler;
	document.addEventListener("keydown", handler = function(event) {
		event.stopPropagation();
		if(confirm && isConfirmInput(event.key)) {
			printToLog(event.key, true); // Echo key to log.
			inputLength++;
			enterPressed = true;
		} else if (confirm === undefined) {
			// If key pressed is a number, letter, or a valid character, echo it to the log.
			if(isNumOrAlphabetKey(event.keyCode)) {
				printToLog(event.key, true); // Echo key to log.
				inputLength++;
			}
			// keyCode 13 is enter.
			if(event.keyCode == 13) {
				enterPressed = true;
			} 
			// keyCode 8 is backspace.
			else if (event.keyCode == 8) {
				if(inputLength > 0) {
					// Remove one inputted character from the log.
					log = log.slice(0, -1);
					inputLength--;
					printToLog("", true);
				}
			}
		}
	}, true);
	
	// Function will not return until user presses enter.
	while(!enterPressed) {
		await sleep(100); // This is needed because the loop hangs the browser.
	}
	
	document.removeEventListener("keydown", handler, true);
	
	// Returns the inputted string.
	return log.slice(-inputLength);
}

/* Takes a keyCode (ASCII value of a key pressed) and returns whether the key is a number or a letter. */
function isNumOrAlphabetKey(keyCode) {
	if(keyCode >= '0'.charCodeAt(0) && keyCode <= '9'.charCodeAt(0) || 
	   keyCode >= 'A'.charCodeAt(0) && keyCode <= 'Z'.charCodeAt(0) || 
	   keyCode >= 'a'.charCodeAt(0) && keyCode <= 'z'.charCodeAt(0) ||
	   keyCode == 188 || keyCode == 189)
	{
		return true;
	}
	return false;
}

/* Takes a key and returns whether the key is a valid confirmation input (Y/y/N/n). */
function isConfirmInput(key) {
	if(key == 'y' || key == 'Y' || key == 'n' || key == 'N') {
		return true;
	}
	return false;
}

/******************* INTERFACE *******************/

/* Hides any open left windows */
function hideLeftWindow() {
	var leftWindows = document.getElementsByClassName("left-window");
	Array.from(leftWindows).forEach(function (window) {
		window.style.display = "none";
	});
}

/* Shows/hides the given window.
 * name: string. The name of the window to toggle.
 * player: Optional. The player object.
 * force: Optional. If set opens the window even if it is already opened.
 * Returns true if window was open when called, false otherwise.
 */
function toggleWindow(name, player, force) {
	var window = document.getElementById(name);
	if(window.style.display != "block") {
		if(window.getAttribute("id") == "inventory") {
			repopInv(player);
		} else if (window.getAttribute("class") == "left-window") {
			hideLeftWindow();
		}
		window.style.display = "block";
		return false;
	} else if (force === undefined) {
		window.style.display = "none";
	}
	return true;
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
	
	// Checks whether player equips a ranged weapon and if so updates the equipment window to update the projectile amount.
	if(player.equipment.Weapon != null) {
		if(player.equipment.Weapon.weaponType == "Ranged") {
			updateEquipment(player.equipment.Weapon.name, player);
		}
	}
}

/* Takes an item name and sets its information in the relevant equipment slot */
function updateEquipment(name, player) {
	let type = ITEMS[name].split(";")[1];
	let value = ITEMS[name].split(";")[2];
	
	switch (type) {
		case "Weapon":
			var equipmentSlot = document.getElementById("weapon-slot");
			if(ITEMS[name].split(";")[WEAPON_TYPE_SLOT] == "Ranged") {
				let projectile = ITEMS[name].split(";")[PROJECTILE_SLOT];
				let projItem = player.getInvItem(projectile);
				let projValue = 0;
				if(projItem) {
					projValue = projItem.value;
				}
				equipmentSlot.innerHTML = name + " (" + value + "), " + projectile + ": " + projValue;
				return;
			}
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

/* Takes a requirements list (e.g.: PARTS_REQS) and populates the suitable window */
function popBuildList(reqList) {
	for(let [key, value] of Object.entries(reqList)) {
		var elementId = key.toLowerCase() + "-reqs";
		var metal = value.split(";")[0];
		var wood = value.split(";")[1];
		var gravel = value.split(";")[2];
		var reqString = "";
		if(metal != 0) {
			reqString += "Metal: " + metal;
		}
		if(wood != 0) {
			if(reqString != "") {
				reqString += "; ";
			}
			reqString += "Wood: " + wood;
		}
		if(gravel != 0) {
			if(reqString != "") {
				reqString += "; ";
			}
			reqString += "Gravel: " + gravel;
		}
		document.getElementById(elementId).innerHTML = reqString;
	}
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
	managePlot(player);
	saveGame(player);
}

/*
* Function for introducing delay into the game.
* Calling this function should freeze game execution.
* duration: number. The amount of time to sleep.
*/
function sleep(duration){
	return new Promise(
		resolve => sleepNum = setTimeout(resolve, duration)
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

/* Uses the map's mapItems key to check if the map was visited before. */
function isInitialVisit(map) {
	if(mapItems[map] === undefined) {
		return true;
	}
	return false;
}

/* Retrieves a list of items for each game cell that contains item(s). */ 
function getGameItems(itemCells) {
	let items = {};

	for (let cell of itemCells) {
		items[cell] = getItemsInCell(cell).map(
			itemElement => itemElement.getAttribute("item")
		);
	}
	
	return items;
}

/* Saves the game state to the localStorage object. */
function saveGame(player) {
	// Save main game variables.
	localStorage.setItem("turn", turn);
	localStorage.setItem("log", log);
	localStorage.setItem("plot", plot);
	localStorage.setItem("movement", movement);
	localStorage.setItem("currMap", currMap);
	localStorage.setItem("npcs", JSON.stringify(npcs));
	localStorage.setItem("containers", JSON.stringify(containers));
	items = getGameItems(itemCells);
	localStorage.setItem("items", JSON.stringify(items));

	// Save current map items.
	saveMapItems(player.mapX+","+player.mapY);
	localStorage.setItem("mapItems", JSON.stringify(mapItems));

	// Save player properties.
	localStorage.setItem("playerX", player.xPos);
	localStorage.setItem("playerY", player.yPos);
	localStorage.setItem("playerHp", player.hp);
	localStorage.setItem("playerInv", JSON.stringify(player.inventory));
	localStorage.setItem("playerDmg", player.dmg);
	localStorage.setItem("playerXp", player.xp);
	localStorage.setItem("playerLvl", player.lvl);
	localStorage.setItem("playerMapX", player.mapX);
	localStorage.setItem("playerMapY", player.mapY);
	
	// Save big objects.
	localStorage.setItem("bigObjects", JSON.stringify(bigObjects));
}

/* Loads the game state from the localStorage object.
 * afterGameDraw: optional. used to load objects that require interaction with the DOM elements,
 * as they are only created after the first time this function runs. */
function loadGame(afterGameDraw) {
	if(localStorage.length != 0) {
		if(afterGameDraw === undefined) {
			// If player died, force a new game.
			if(parseInt(localStorage.getItem("playerHp")) <= 0) {
				newGame();
				return;
			}
			
			// Load main game variables.
			turn = parseInt(localStorage.getItem("turn"));
			log = localStorage.getItem("log");
			plot = parseInt(localStorage.getItem("plot"));
			movement = JSON.parse(localStorage.getItem("movement"));
			currMap = localStorage.getItem("currMap");
			containers = JSON.parse(localStorage.getItem("containers"));
			items = JSON.parse(localStorage.getItem("items"));
			
			// Load player properties.
			var player = new Player(localStorage.getItem("playerX"), localStorage.getItem("playerY"));
			player.xPos = parseInt(localStorage.getItem("playerX"));
			player.yPos = parseInt(localStorage.getItem("playerY"));
			player.hp = parseInt(localStorage.getItem("playerHp"));
			player.dmg = parseInt(localStorage.getItem("playerDmg"));
			player.xp = parseInt(localStorage.getItem("playerXp"));
			player.lvl = parseInt(localStorage.getItem("playerLvl"));
			player.mapX = parseInt(localStorage.getItem("playerMapX"));
			player.mapY = parseInt(localStorage.getItem("playerMapY"));
			
			// Load current map items.
			mapItems = JSON.parse(localStorage.getItem("mapItems"));
			
			// Load big objects.
			bigObjects = JSON.parse(localStorage.getItem("bigObjects"));
			
			// Load inventory items.
			var restoredInv = JSON.parse(localStorage.getItem("playerInv"));
			for(i = 0; i < restoredInv.length; i++) {
				var restoredVal = restoredInv[i].itemValue;
				var restoredEquipStatus = restoredInv[i].equipped;
				restoredInv[i] = new Item(restoredInv[i].itemName);
				restoredInv[i].value = restoredVal;
				restoredInv[i].isEquipped = restoredEquipStatus;
			}
			player.setInventory(restoredInv);

			return player;
		} else {
			// Load NPCs
			npcs = JSON.parse(localStorage.getItem("npcs"));
			if(npcs.length == 0) {
				npcs = [];
			} else {
				for(i in npcs) {
					var hp = npcs[i].hp;
					npcs[i] = new NPC(npcs[i].x, npcs[i].y, npcs[i].type, npcs[i].friendStatus);
					npcs[i].health = hp;
					npcs[i].currMap = currMap;
				}
			}
		}
	}
}

/* Clears the local storage and forces a new game. */
function newGame() {
	localStorage.clear();
	location.reload();
}

/* Repairs the given ship part (changes the tiles). */
function repairShip(part) {
	switch(part) {
		case "HULL":
			removeTileOnTop("c0505");
			setTileOnTop("c0505", T_SHIP2F, false);
			
			removeTileOnTop("c0605");
			setTileOnTop("c0605", T_SHIP3F, false);
			
			removeTileOnTop("c0705");
			setTileOnTop("c0705", T_SHIP6F, false);
			break;
		default:
			break;
	}
}

/* Spawns the big objects that were built in the given map */
function loadMapBigObjects(map) {
	if(bigObjects[map]) {
		for(bigObject = 0; bigObject < bigObjects[map].length; bigObject++) {
			let cell = bigObjects[map][bigObject][0];
			let object = bigObjects[map][bigObject][1];
			setTileOnTop(cell, eval("T_"+object.toUpperCase()), false);
			if(object == "BRIDGE") {
				document.getElementById(cell).setAttribute("walkable", "true");
			}
		}
	}
}
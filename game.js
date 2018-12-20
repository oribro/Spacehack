/* Board size constants */
const X_ASPECT 		= 16;
const Y_ASPECT 		= 9;
const ASPECT_MUL 	= 2;
const HEIGHT 		= Y_ASPECT * ASPECT_MUL;
const WIDTH 		= X_ASPECT * ASPECT_MUL;
const MAX_FIRE_RANGE = 11;

'use strict';

/*
* Game setup
*/
window.onload = () => {

	// Create the board and fill environment.
	spawnGameObjects();

	// Print first text to log.
	printToLog(STRINGS[EVENT.WAKEUP]);

	// Create a new player character.
	// Places the character at the top left.
	var player = new Player(6, 5);
	//godmode(player);
	
	document.getElementById("turn-value").innerHTML = turn;
	document.getElementById("hp-value").innerHTML = SPAWN_HP;
	document.getElementById("dmg-value").innerHTML = SPAWN_DMG;
	
	
	promptContinue(player);

	/*// Create npcs and keep them in the browser storage.
	npcs = getNPCArray();
	sessionStorage.setItem(
		'npcs', JSON.stringify(npcs)
	);
	*/
}

/* Turn counter */
var turn = 0;

/* Game log string */
var log = "";

/* Plot advancement counter */
var plot = 0;

/* Enable/disable movement */
var movement = true;

/* Sound of fire burning */
var fireSound = new sound(FIRE_SOUND);

function spawnGameObjects() {

	// Spawn terrain environment elements.
	var i, j, biDigI, biDigJ;
	for(i = 0; i < HEIGHT; i++) {
		biDigI = getTwoDigits(i);
		var div = document.createElement("div");
		div.setAttribute("id", "r"+biDigI);
		div.setAttribute("class", "tileline");
		document.getElementById("game-board").appendChild(div);
		for(j = 0; j < WIDTH; j++) {
			biDigJ = getTwoDigits(j);
			let cell = "c"+biDigI+biDigJ
			var span = document.createElement("span");
			span.setAttribute("id", cell);
			document.getElementById("r"+biDigI).appendChild(span);
			if(j == 0) {
				setCell(cell, T_WATER1, "false");
				setEnv(cell, T_WATER1);
			} else if (j == 1) {
				setCell(cell, T_BEACH1, "false");
				setEnv(cell, T_BEACH1);
				span.lastElementChild.setAttribute("class", "water");
			} else if (j == 2) {
				setCell(cell, T_SAND_G, "true");
				setEnv(cell, T_SAND_G);
			} else if(j == WIDTH - 5) {
				setCell(cell, T_VEGETATION2, "true");
				setEnv(cell, T_VEGETATION2);
			} else if(j >= WIDTH - 4) {
				setCell(cell, T_VEGETATION1, "true");
				setEnv(cell, T_VEGETATION1);
			} else {
				setCell(cell, T_GROUND, "true");
				setEnv(cell, T_GROUND);
			}
		}
	}

	// Spawn game objects above the terrain.
	// Ship.
	setTileOnTop("c0505", T_SHIP2, "false");
	setTileOnTop("c0605", T_SHIP3, "false");
	setTileOnTop("c0606", T_SHIP4, "false");
	setTileOnTop("c0604", T_SHIP5, "false");
	setTileOnTop("c0705", T_SHIP6, "false");
	setTileOnTop("c0805", T_SHIP7, "false");
	setEnv("c0505", T_SHIP2);
	setEnv("c0605", T_SHIP3);
	setEnv("c0606", T_SHIP4);
	setEnv("c0604", T_SHIP5);
	setEnv("c0705", T_SHIP6);
	setEnv("c0805", T_SHIP7);

	// Fire on ship.
	["c0604", "c0705", "c0805"].forEach(
		cell => {
			setTileOnTop(cell, T_FIRE1, "false");
			setEnv(cell, T_FIRE1);
			// Important: assuming fire is on top of the other tile layers.
			// We use here the fact that setTileOnTop sets the fire as the last child element.
			document.getElementById(cell).lastElementChild.setAttribute("class", "fire");
		});

	// Ship debris.
	setTileOnTop("c0318", T_DEBRIS1, "false");
	setTileOnTop("c0512", T_DEBRIS2, "false");
	setTileOnTop("c1205", T_DEBRIS1, "false");
	setTileOnTop("c1619", T_DEBRIS2, "false");
	setTileOnTop("c1018", T_DEBRIS1, "false");
	setTileOnTop("c1704", T_DEBRIS2, "false");
	setEnv("c0318", T_DEBRIS1);
	setEnv("c0512", T_DEBRIS2);
	setEnv("c1205", T_DEBRIS1);
	setEnv("c1619", T_DEBRIS2);
	setEnv("c1018", T_DEBRIS1);
	setEnv("c1704", T_DEBRIS2);
	
	// Container
	containers["c1423"] = new Container([
		new Item("FirstAid"),
		new Item("Ration"),
		new Item("Bucket")
	],
		"c1423",
		true
	);

	//hideTile("c1423", T_FIRSTAID);
	//setTileOnTop("c1423", T_CONTAINER, "false");
	//setEnv("c1423", T_CONTAINER);

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
	spawnItem(
		"c1310", 
		T_FIRSTAID, 
		ITEMS["FirstAid"]
	);
	spawnItem(
		"c1431",
		T_BONES,
		ITEMS["Bones"]
	);
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
		shouldFirePlay(fireSound, player, 5, 7);
	};
	
}

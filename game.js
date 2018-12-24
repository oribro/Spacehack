/* Board size constants */
const X_ASPECT 		= 16;
const Y_ASPECT 		= 9;
const ASPECT_MUL 	= 2;
const HEIGHT 		= Y_ASPECT * ASPECT_MUL;
const WIDTH 		= X_ASPECT * ASPECT_MUL;
const MAX_FIRE_RANGE = 11;

'use strict';

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

/*
* Game setup
*/
window.onload = () => {

	// Create the board and fill environment.
	spawnGameObjects("0,0");

	// Print first text to log.
	printToLog(STRINGS[EVENT.WAKEUP]);

	// Create a new player character.
	// Places the character at the top left.
	var player = new Player(6, 5);
	
	/* Uncomment this for testing */
	//npcs.push(new NPC(31, 9, "Dogfish", "enemy"));
	
	document.getElementById("turn-value").innerHTML = turn;
	document.getElementById("hp-value").innerHTML = SPAWN_HP;
	document.getElementById("dmg-value").innerHTML = SPAWN_DMG;
	document.getElementById("xp-value").innerHTML = SPAWN_XP;
	document.getElementById("lvl-value").innerHTML = SPAWN_LVL;
	document.getElementById("coords-value").innerHTML = "(" + player.mapX + "," + player.xPos + " ; " + player.mapY + "," + player.yPos + ")";

	/* Uncomment this for testing */
	//godmode(player);
	//plot = 2;
	
	promptContinue(player);
	
}

/* Draws a map on the game board according to the map parameter.
 * Map: string. formatted "x,y" where x represents the horizontal location and y the vertical location.
 * e.g.: "0,0" is the starting map, so "1,0" is the map to the right. "0,1" is the map below. 
 */
function spawnGameObjects(map) {
	var i, j, biDigI, biDigJ;
	// Delete and recreate the game-board DOM element.
	var board = document.getElementById("game-board");
	document.getElementById("game").removeChild(board);
	board = document.createElement("div");
	board.setAttribute("id", "game-board");
	document.getElementById("game").appendChild(board);
	switch (map) {
		// Map 0,0 (Spawn map).
		case "0,0":
			document.getElementById("map-value").innerHTML = "Crash site";
			// Spawn terrain environment elements.
			//var i, j, biDigI, biDigJ;
			for(i = 0; i < HEIGHT; i++) {
				biDigI = getTwoDigits(i);
				var div = document.createElement("div");
				div.setAttribute("id", "r"+biDigI);
				div.setAttribute("class", "tileline");
				document.getElementById("game-board").appendChild(div);
				for(j = 0; j < WIDTH; j++) {
					biDigJ = getTwoDigits(j);
					let cell = "c"+biDigI+biDigJ;
					var span = document.createElement("span");
					span.setAttribute("id", cell);
					document.getElementById("r"+biDigI).appendChild(span);
					if(j == 0) {
						setCell(cell, T_WATER1, "false");
					} else if (j == 1) {
						setCell(cell, T_BEACH1, "false");
						span.lastElementChild.setAttribute("class", "water");
					} else if (j == 2) {
						setCell(cell, T_SAND_G, "true");
					} else if(j == WIDTH - 5) {
						setCell(cell, T_VEGETATION2, "true");
					} else if(j >= WIDTH - 4) {
						setCell(cell, T_VEGETATION1, "true");
					} else {
						setCell(cell, T_GROUND, "true");
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

			// Fire on ship.
			["c0604", "c0705", "c0805"].forEach(
				cell => {
					setTileOnTop(cell, T_FIRE1, "false");
					//setEnv(cell, T_FIRE1);
					// Important: assuming fire is on top of the other tile layers.
					// We use here the fact that setTileOnTop sets the fire as the last child element.
					document.getElementById(cell).lastElementChild.setAttribute("class", "fire");
				});

			// Ship debris.
			setTilesOnTop(T_DEBRIS1, "false", "c0318", "c1205", "c1018");
			setTilesOnTop(T_DEBRIS2, "false", "c0512", "c1619", "c1704");
			
			// Container
			containers["c1423"] = new Container([
				new Item("FirstAid"),
				new Item("Ration"),
				new Item("Bucket")
			],
				"c1423",
				true
			);

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
			break;
		
		// Map 1,0 (Right of spawn).
		case "1,0":
			document.getElementById("map-value").innerHTML = "Plains";
			for(i = 0; i < HEIGHT; i++) {
				var div = document.createElement("div");
				biDigI = getTwoDigits(i);
				div.setAttribute("id", "r"+biDigI);
				div.setAttribute("class", "tileline");
				board.appendChild(div);
				
				// Fill the board with vegetation.
				for(j = 0; j < WIDTH; j++) {
					biDigJ = getTwoDigits(j);
					let cell = "c"+biDigI+biDigJ;
					var span = document.createElement("span");
					span.setAttribute("id", cell);
					document.getElementById("r"+biDigI).appendChild(span);
					setCell(cell, T_VEGETATION1, "true");				
				}	
			}
			
			// Green trees.
			setTilesOnTop(T_TREE1, "false", "c0208", "c1513", "c1019", 
											"c0417", "c1418", "c1506", 
											"c0702", "c1203", "c0214", 
											"c0910", "c0719"
						  );
			
			// Green fruit.
			spawnItems(T_FRUIT1, ITEMS["Green fruit"], "c0703", "c1202", "c0810", "c1413", "c1018", "c0114");
			
			// Red trees.
			setTilesOnTop(T_TREE2, "false", "c1005", "c0512", "c1209", 
											"c0914", "c1501", "c0303", 
											"c1215", "c0607", "c0118"
						  );
			
			// Red fruit.
			spawnItems(T_FRUIT2, ITEMS["Red fruit"], "c0302", "c0707", "c0513", "c1309", "c1214", "c0218");
			
			break;
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
		shouldFirePlay(fireSound, player, 5, 7);
	};
	
}

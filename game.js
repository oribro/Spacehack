/* Board size constants */
const X_ASPECT 		= 16;
const Y_ASPECT 		= 9;
const ASPECT_MUL 	= 2;
const HEIGHT 		= Y_ASPECT * ASPECT_MUL;
const WIDTH 		= X_ASPECT * ASPECT_MUL;
const MAX_FIRE_RANGE = 11;
const RANGED_ATTACK = 10;

'use strict';

/* Turn counter */
var turn = 0;

/* Game log string */
var log = "";

/* Enable/disable movement */
var movement = true;

/* Current game map */
var currMap = "0,0";

/* Sound of fire burning */
var fireSound = new sound(FIRE_SOUND);

/* Plot constants */
const PLOT = {
	INTRO: 0,
	DOGFISH: 1,
	RIVER_AMBUSH: 2,
	CHICK_MEETING: 3,
	CHICK_CARNAGE: 4
}

/* Plot advancement counter */
var plot = PLOT.INTRO;

/*
* Game setup
*/
window.onload = () => {
	
	var player;
	
	if(localStorage.length != 0) {
		player = loadGame();
		
		// Create the board and fill environment.
		spawnGameObjects(player.mapX+","+player.mapY, isInitialVisit(player.mapX+","+player.mapY));
		loadMapItems(player.mapX+","+player.mapY);
		
		// Load objects that require the DOM elements (i.e.: NPCs).
		loadGame(true);

		printToLog(log);
		printToLog("Game restored.");
				
		const playerPos = [player.xPos, player.yPos];
		player.draw(...playerPos);
		
		document.getElementById("turn-value").innerHTML = turn;
		document.getElementById("hp-value").innerHTML = player.health;
		document.getElementById("dmg-value").innerHTML = player.dmg;
		document.getElementById("xp-value").innerHTML = player.xp;
		document.getElementById("lvl-value").innerHTML = player.lvl;
		document.getElementById("coords-value").innerHTML = "(" + player.mapX + "," + player.xPos + " ; " + player.mapY + "," + player.yPos + ")";

		promptContinue(player);
	} else {
		// Create the board and fill environment.
		spawnGameObjects("0,0", true);

		// Create a new player character.
		// Places the character at the top left.
		player = new Player(6, 5);
		
		/* Uncomment this for testing */
		//npcs.push(new NPC(31, 9, "Dogfish", "enemy"));
		
		document.getElementById("turn-value").innerHTML = turn;
		document.getElementById("hp-value").innerHTML = SPAWN_HP;
		document.getElementById("dmg-value").innerHTML = SPAWN_DMG;
		document.getElementById("xp-value").innerHTML = SPAWN_XP;
		document.getElementById("lvl-value").innerHTML = SPAWN_LVL;
		document.getElementById("coords-value").innerHTML = "(" + player.mapX + "," + player.xPos + " ; " + player.mapY + "," + player.yPos + ")";
		
		/* Uncomment this for testing */
		
		godmode(player);
		plot = 3;
		player.lvl = 5;
		document.getElementById("lvl-value").innerHTML = player.lvl;

		// Play game start cinematic.
		//playGameIntro(player);
		promptContinue(player);
	}
	
	// Populate build lists.
	popBuildList(PARTS_REQS);
	popBuildList(WORKBENCH_REQS);
	popBuildList(BIG_OBJECTS_REQS);
	
}

/* Draws a map on the game board according to the map parameter.
 * Map: string. formatted "x,y" where x represents the horizontal location and y the vertical location.
 * e.g.: "0,0" is the starting map, so "1,0" is the map to the right. "0,1" is the map below.
 * Initial: boolean. optional. if true spawns all first spawn items. otherwise they will be loaded from items list.
 */
function spawnGameObjects(map, initial) {
	var i, j, biDigI, biDigJ;
	// Delete and recreate the game-board DOM element.
	var board = document.getElementById("game-board");
	document.getElementById("game-board-wrapper").removeChild(board);
	board = document.createElement("div");
	board.setAttribute("id", "game-board");
	document.getElementById("game-board-wrapper").insertBefore(board, document.getElementById("game-board-wrapper").lastElementChild);
	switch (map) {
		// Map 0,0 (Spawn map).
		case "0,0":
			document.getElementById("map-value").innerHTML = "Crash site";
			// Spawn terrain environment elements.
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

			// Ship debris.
			setTilesOnTop(T_DEBRIS1, "false", "c0318", "c1205", "c1018");
			setTilesOnTop(T_DEBRIS2, "false", "c0512", "c1619", "c1704");
			
			// Container
			containers["c1423"] = new Container([
				new Item("FirstAid"),
				new Item("Ration"),
				new Item("Bucket"),
				new Item("Axe"),
				new Item("Pickaxe"),
				new Item("Hammer")
			],
				"c1423",
				true
			);

			// These happen only on the first time the map is visited.
			if(initial) {
				
					
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
			
			// Draw fire on ship only if it hadn't been put out yet.
			if(plot <= PLOT.DOGFISH) {
				// Fire on ship.
				["c0604", "c0705", "c0805"].forEach(
					cell => {
						setTileOnTop(cell, T_FIRE1, "false");
						// Important: assuming fire is on top of the other tile layers.
						// We use here the fact that setTileOnTop sets the fire as the last child element.
						document.getElementById(cell).lastElementChild.setAttribute("class", "fire");
					});
			}
			
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
			
			// Red trees.
			setTilesOnTop(T_TREE2, "false", "c1005", "c0512", "c1209", 
											"c0914", "c1501", "c0303", 
											"c1215", "c0607", "c0118"
						  );
						  
			// Lake.
			for(i = 0; i < HEIGHT; i++) {
				let biDigY = getTwoDigits(i);
				if(i <= 4) {
					setTilesOnTop(T_WATER1, "false", "c"+biDigY+"25", "c"+biDigY+"26", 
													 "c"+biDigY+"27", "c"+biDigY+"28", "c"+biDigY+"29");
				} else if(i <= 8) {
					setTilesOnTop(T_WATER1, "false", "c"+biDigY+"25", "c"+biDigY+"26", 
													 "c"+biDigY+"27", "c"+biDigY+"28", "c"+biDigY+"29", "c"+biDigY+"30");
				} else {
					setTilesOnTop(T_WATER1, "false", "c"+biDigY+"26", "c"+biDigY+"27", 
													 "c"+biDigY+"28", "c"+biDigY+"29", "c"+biDigY+"30");
				}
			}

			// Rocks.
			setTilesOnTop(
				T_ROCK, 
				"false", 
				"c1725", "c0925", "c0024"			
			);
			
			if(initial) {
				// Green fruit.
				spawnItems(T_FRUIT1, ITEMS["Green fruit"], "c0703", "c1202", "c0810", "c1413", "c1018", "c0114");
				// Red fruit.
				spawnItems(T_FRUIT2, ITEMS["Red fruit"], "c0302", "c0707", "c0513", "c1309", "c1214", "c0218");
			}
			
			break;
			
		// Map 0,-1 (Above spawn).
		case "0,-1":
			document.getElementById("map-value").innerHTML = "Beach";
			// Spawn terrain environment elements.
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
			break;
	}
}

/* Manages plot events */
function managePlot(player) {
	switch(plot) {
		case PLOT.DOGFISH:
			fireSound.stop();
			plot++;
			npcs.push(new NPC(31, 9, "Dogfish", "enemy"));
			/*var dogfishSnarl = new sound(DOGFISH_SNARL);
			dogfishSnarl.loop(false);
			dogfishSnarl.play();*/
			createSound(DOGFISH_SNARL, false);
			printToLog("\"What was that?!\"");
			break;
		case PLOT.RIVER_AMBUSH:
			if(player.mapX == 1 && player.mapY == 0 && player.xPos == 19) {
				plot++;
				npcs.push(new NPC(24, 1, "Dogfish", "enemy"));
				npcs.push(new NPC(24, 8, "Dogfish", "enemy"));
				npcs.push(new NPC(25, 15, "Dogfish", "enemy"));
				createSound(WATER_SPLASH, false);
				createSound(DOGFISH_SNARL, false);
				printToLog("\"Not this thing again...\"");
			}
			break;
		case PLOT.CHICK_MEETING:
			if(player.mapX == 0 && player.mapY == -1) {
				plot++;
				npcs.push(new NPC(16, 9, "Chick", "enemy"));
				createSound(CHICK_CHIRP, false);
				printToLog("\"Look at that cute little chick!\"");
			}
			break;
		case PLOT.CHICK_CARNAGE:
			if(player.mapX == 0 && player.mapY == -1 && player.nextTo(npcs[npcs.length-1])) {
				plot++;
				for(i = 2; i < WIDTH; i++) {
					npcs.push(new NPC(i, 0, "Chick", "enemy"));
				}
				for(i = 0; i < HEIGHT; i++) {
					npcs.push(new NPC(WIDTH-1, i, "Chick", "enemy"));
				}
				createSound(CHICK_CHIRP, false);
				printToLog("\"Oh no.\"");
			}
			break;
	}
}

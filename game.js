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


var allowSounds = true;

var activeSounds = [];

/* Plot nodes */
const INTRO = new PlotNode("Intro", null);
const FIRE = new PlotNode("Fire", INTRO);
const DOGFISH = new PlotNode("Dogfish", FIRE);
const RIVER_AMBUSH = new PlotNode("River Ambush", DOGFISH);
const CHICK_MEETING = new PlotNode("Chick Meeting", DOGFISH);
const CHICK_CARNAGE = new PlotNode("Chick Carnage", CHICK_MEETING);
const SNAKE_ISLAND = new PlotNode("Snake Ambush", DOGFISH);
const RETURN_WALLET = new PlotNode("Return Wallet", SNAKE_ISLAND);

/* Plot tree */
const PLOT = {
	INTRO: INTRO,
	FIRE: FIRE,
	DOGFISH: DOGFISH,
	RIVER_AMBUSH: RIVER_AMBUSH,
	CHICK_MEETING: CHICK_MEETING,
	CHICK_CARNAGE: CHICK_CARNAGE,
	SNAKE_ISLAND: SNAKE_ISLAND,
	RETURN_WALLET: RETURN_WALLET
}

/* Saves the "big objects" built in each map */
var bigObjects = {};

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

		resumePlayerMovementAndCheckFireOnLoad(player);
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
		
		// godmode(player);
		// plot = 3;
		// player.lvl = 5;
		// document.getElementById("lvl-value").innerHTML = player.lvl;
		
		// Play game start cinematic.
		playGameIntro(player);
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
				new Item("Hammer"),
				new Item("Fishing Rod")
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
			if(!PLOT.FIRE.isCompleted) {
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
			// Fishing spot with animation.
			setTileOnTop("c1330", T_FISHING_SPOT, "false");
			document.getElementById("o1330").style.webkitAnimation = "glitter 2s linear 0s infinite normal";
			document.getElementById("c1330").lastElementChild.id = "f1331";

			// Rocks.
			setTilesOnTop(
				T_ROCK, 
				"false", 
				"c1725", "c0925", "c0024"			
			);
			
			// Sign.
			setTileOnTop("c0624", T_SIGN_R, "false");
			
			// Three headed man.
			npcs.push(new NPC(30, 4, "Three Headed Humanoid", "friend"));
			
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
			
			// Ship debris.
			setTilesOnTop(T_DEBRIS1, "false", "c1506", "c1004", "c0706", "c0412", "c1108", "c0519");
			setTilesOnTop(T_DEBRIS2, "false", "c0610", "c0811", "c0112", "c1404", "c0308", "c1314");
				
			// Green trees.
			setTilesOnTop(T_TREE1, "false", "c0428", "c0730", "c1029", "c0129");
			setTilesOnTop(T_TREE2, "false", "c1330", "c1529");
			
			// Rocks.
			setTilesOnTop(T_ROCK, "false", "c0404", "c0714", "c1218", "c0721", "c0317", "c1525");
			
			// Container
			containers["c0205"] = new Container([
				new Item("FirstAid"),
				new Item("FirstAid"),
				new Item("FirstAid"),
				new Item("Ration"),
				new Item("Ration"),
				new Item("Ration"),
				new Item("Metal"),
				new Item("Wood"),
				new Item("Gravel"),
			],
				"c0205",
				true
			);
			
			if(initial) {
				// Green fruit.
				spawnItems(T_FRUIT1, ITEMS["Green fruit"], "c1129", "c0729", "c0229");
				// Red fruit.
				spawnItems(T_FRUIT2, ITEMS["Red fruit"], "c1528");
			}
			
			break;
		
		case "1,-1":
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
			
			// Lake.
			for(i = 0; i < HEIGHT; i++) {
				let biDigY = getTwoDigits(i);
				if(i >= 2 && i <= 8) {
					for(j = 14; j <= 30; j++) {
						if(!(i == 2 && j == 14) && !(i == 8 && j == 14)) {
							// Island.
							if(!(i >= 4 && i <= 6 && j >= 24 && j <= 26)) {
								let biDigX = getTwoDigits(j);
								setTileOnTop("c"+biDigY+biDigX, T_WATER1, "false");
							}
						}
					}
				} else {
					setTilesOnTop(T_WATER1, "false", "c"+biDigY+"25", "c"+biDigY+"26", "c"+biDigY+"27", 
													 "c"+biDigY+"28", "c"+biDigY+"29");
				}
			}
			setTilesOnTop(T_WATER1, "false", "c0122", "c0123", "c0124");
			setTilesOnTop(T_WATER1, "false", "c0922", "c0923", "c0924", "c0930", "c1030");
			setTilesOnTop(T_WATER1, "false", "c0413", "c0513", "c0613");
			setTileOnTop("c1024", T_WATER1, "false");
			
			// Green trees.
			setTilesOnTop(T_TREE1, "false", "c0103", "c0105", "c0113",
											"c0202", "c0206", "c0211", 
											"c0302", "c0305", "c0308",
											"c0401", "c0408", "c0411",
											"c0502", "c0506", "c0508",
											"c0603", "c0605", "c0610",
											"c0702", "c0710", "c0809", 
											"c0901", "c0909", "c0913",
											"c1002", "c1004", "c1010",
											"c1106", "c1111", "c1118",
											"c1204", "c1210", "c1220",
											"c1301", "c1308", "c1315",
											"c1403", "c1412", "c1418",
											"c1505", "c1510", "c1522",
											"c0525"
			);
			
			// Quest item.
			if(initial) {
				spawnItem("c0524", T_WALLET, ITEMS["Wallet"]);
			}
			
			break;

		case "2,0":
			document.getElementById("map-value").innerHTML = "Alien city";
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
						setCell(cell, T_VEGETATION1, "true");
					} else if (j == 1) {
						setCell(cell, T_VEGETATION3, "true");
					} else {
						setCell(cell, T_GROUND, "true");
					}
				}
			}

			// City wall vertical
			for(i = 3; i <= 14; i++) {
				let biDigY = getTwoDigits(i);
				if (i == 3) {
					setTilesOnTop(T_BRICK_WALL2, "false", "c"+biDigY+"04", "c"+biDigY+"27");
				}
				else if (i == 9) {
					setTileOnTop("c"+biDigY+"04", T_GATE, "false");
					setTileOnTop("c"+biDigY+"27", T_BRICK_WALL1, "false");
				}
				else if (i == 14) {
					setTilesOnTop(T_BRICK_WALL3, "false", "c"+biDigY+"04", "c"+biDigY+"27");
				}
				else {
					setTilesOnTop(T_BRICK_WALL1, "false", "c"+biDigY+"04", "c"+biDigY+"27");
				}
			}

			// City wall horizontal
			for(i = 5; i < WIDTH; i++) {
				let biDigX = getTwoDigits(i);
				setTilesOnTop(T_BRICK_WALL1, "false", "c"+"03"+biDigX, "c"+"14"+biDigX);
			}

			// City floor
			for(i = 4; i <= 13; i++) {
				for(j = 5; j < WIDTH; j++) {
					let biDigX = getTwoDigits(j);
					let biDigY = getTwoDigits(i);
					setTileOnTop("c"+biDigY+biDigX, T_URBAN_FLOOR, "true");
				}
			}
			
			break;
	}
	loadMapBigObjects(map);
}

/* Manages plot events */
function managePlot(player) {
	if(PLOT.DOGFISH.parentNode.isCompleted && !PLOT.DOGFISH.isCompleted) {
		PLOT.DOGFISH.complete();
		npcs.push(new NPC(31, 9, "Dogfish", "enemy"));
		createSound(DOGFISH_SNARL, false);
		printToLog("\"What was that?!\"");
	}
	if(PLOT.RIVER_AMBUSH.parentNode.isCompleted && !PLOT.RIVER_AMBUSH.isCompleted) {
		if(player.mapX == 1 && player.mapY == 0 && player.xPos == 19) {
			PLOT.RIVER_AMBUSH.complete();
			npcs.push(new NPC(24, 1, "Dogfish", "enemy"));
			npcs.push(new NPC(24, 8, "Dogfish", "enemy"));
			npcs.push(new NPC(25, 15, "Dogfish", "enemy"));
			createSound(WATER_SPLASH, false);
			createSound(DOGFISH_SNARL, false);
			printToLog("\"Not this thing again...\"");
		}
	}
	if(PLOT.CHICK_MEETING.parentNode.isCompleted && !PLOT.CHICK_MEETING.isCompleted) {
		if(player.mapX == 0 && player.mapY == -1) {
			PLOT.CHICK_MEETING.complete();
			npcs.push(new NPC(16, 9, "Chick", "enemy"));
			createSound(CHICK_CHIRP, false);
			printToLog("\"Look at that cute little chick!\"");
		}
	}
	if(PLOT.CHICK_CARNAGE.parentNode.isCompleted && !PLOT.CHICK_CARNAGE.isCompleted) {
		if(player.mapX == 0 && player.mapY == -1 && player.nextTo(npcs[npcs.length-1])) {
			PLOT.CHICK_CARNAGE.complete();
			for(i = 10; i < 20; i++) {
				npcs.push(new NPC(i, 0, "Chick", "enemy"));
			}
			createSound(CHICK_CHIRP, false);
			printToLog("\"Oh no.\"");
		}
	}
	if(!PLOT.SNAKE_ISLAND.isCompleted) {
		if(player.mapX == 1 && player.mapY == -1) {
			if((player.xPos >= 24 && player.xPos <= 26) && (player.yPos >= 4 && player.yPos <= 6)) {
				PLOT.SNAKE_ISLAND.complete();
				for(var i = -1; i <= 1; i++) {
					for(var j = -1; j <= 1; j++) {
						if(!(i == 0 && j == 0)) {
							var biDigY = getTwoDigits(player.yPos + i);
							var biDigX = getTwoDigits(player.xPos + j);
							var playerAdj = document.getElementById("c"+biDigY+biDigX);
							if(playerAdj.getAttribute("walkable") == "true" && playerAdj.getAttribute("env") == "vegetation1") {
								npcs.push(new NPC(player.xPos + j, player.yPos + i, "Snake", "enemy"));
								createSound(SNAKE_HISS, false);
								return;
							}
						}
					}
				}
				
			}
		}
	}
}

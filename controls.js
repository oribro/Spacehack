/*
 *	Controls for the game.
 */

/* Key bindings */
const MOVE_RIGHT = "ArrowRight";
const MOVE_LEFT = "ArrowLeft";
const MOVE_UP = "ArrowUp";
const MOVE_DOWN = "ArrowDown";
const EXAMINE = "e";
const INVENTORY = "i";
const USE = "u";
const PICKUP = "p";
const CONTROLS = "c";
const DROP = "d";
const ATTACK = "f";
const EQUIPMENT = "q";
const REMOVE = "r";
const STATS = "s";
const PARTS = "m";
const BUILD = "b";
const TALK = "t";
const WORLD_MAP = "n";

/* Show the key bindings on the 'controls' list */
document.getElementById("examine-key").innerHTML = "'"+EXAMINE+"'";
document.getElementById("inventory-key").innerHTML = "'"+INVENTORY+"'";
document.getElementById("use-key").innerHTML = "'"+USE+"'";
document.getElementById("pickup-key").innerHTML = "'"+PICKUP+"'";
document.getElementById("controls-key").innerHTML = "'"+CONTROLS+"'";
document.getElementById("drop-key").innerHTML = "'"+DROP+"'";
document.getElementById("attack-key").innerHTML = "'"+ATTACK+"'";
document.getElementById("equipment-key").innerHTML = "'"+EQUIPMENT+"'";
document.getElementById("remove-key").innerHTML = "'"+REMOVE+"'";
document.getElementById("stats-key").innerHTML = "'"+STATS+"'";
document.getElementById("parts-key").innerHTML = "'"+PARTS+"'";
document.getElementById("build-key").innerHTML = "'"+BUILD+"'";
document.getElementById("talk-key").innerHTML = "'"+TALK+"'";
document.getElementById("world-map-key").innerHTML = "'"+WORLD_MAP+"'";

/* Holds the current action so control() will know what to do */
var actionExecuted;

/* Passes the direction pressed to the requesting function */
function passToAction(direction, player) {
	switch(actionExecuted) {
		case "examine":
			player.examine(direction);
			break;
		case "utilItem":
			utilItem(itemHolder, player, direction);
			break;
		case "attack":
			player.attack(direction);
			break;
		case "pickup":
			player.pickup(direction);
			break;
		case "build":
			player.build(direction);
			break;
		case "talk":
			player.talk(direction);
	}
}

/* Passes the keydown event to the suitable function */
function control(event, player) {
	var key = event.key;
	switch (key) {
		case MOVE_RIGHT:
			if(movement == false) {
				passToAction(MOVE_RIGHT, player);
				movement = true;
			} else {
				player.move(event);
			}
			break;
		case MOVE_LEFT:
			if(movement == false) {
				passToAction(MOVE_LEFT, player);
				movement = true;
			} else {
				player.move(event);
			}
			break;
		case MOVE_UP:
			if(movement == false) {
				passToAction(MOVE_UP, player);
				movement = true;
			} else {
				player.move(event);
			}
			break;
		case MOVE_DOWN:
			if(movement == false) {
				passToAction(MOVE_DOWN, player);
				movement = true;
			} else {
				player.move(event);
			}
			break;
		case EXAMINE:
			player.examine();
			break;
		case INVENTORY:
			toggleWindow("inventory", player);
			break;
		case USE:
			player.use();
			break;
		case PICKUP:
			player.pickup();
			break;
		case CONTROLS:
			toggleWindow("controls");
			break;
		case DROP:
			player.drop();
			break;
		case ATTACK:
			player.attack();
			break;
		case EQUIPMENT:
			toggleWindow("equipment");
			break;
		case REMOVE:
			player.unequip(true);
			break;
		case STATS:
			toggleWindow("extended-stats");
			break;
		case PARTS:
			toggleWindow("parts");
			break;
		case BUILD:
			player.build();
			break;
		case TALK:
			player.talk();
			break;
		case WORLD_MAP:
			toggleWindow("world-map-wrapper");
			break;
	}
}
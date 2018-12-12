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

/* Show the key bindings on the 'controls' list */
document.getElementById("examine-key").innerHTML = "'"+EXAMINE+"'";
document.getElementById("inventory-key").innerHTML = "'"+INVENTORY+"'";
document.getElementById("use-key").innerHTML = "'"+USE+"'";
document.getElementById("pickup-key").innerHTML = "'"+PICKUP+"'";
document.getElementById("controls-key").innerHTML = "'"+CONTROLS+"'";
document.getElementById("drop-key").innerHTML = "'"+DROP+"'";

/* Passes the keydown event to the suitable function */
function control(event, player) {
	var key = event.key;
	switch (key) {
		case MOVE_RIGHT:
			player.move(event);
			break;
		case MOVE_LEFT:
			player.move(event);
			break;
		case MOVE_UP:
			event.preventDefault();
			player.move(event);
			break;
		case MOVE_DOWN:
			event.preventDefault();
			player.move(event);
			break;
		case EXAMINE:
			player.examine();
			break;
		case INVENTORY:
			toggleInventory(player);
			break;
		case USE:
			player.use();
			break;
		case PICKUP:
			player.examine(true);
			break;
		case CONTROLS:
			toggleControls();
			break;
		case DROP:
			player.drop();
			break;
	}
}
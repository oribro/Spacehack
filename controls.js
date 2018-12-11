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
			player.move(event);
			break;
		case MOVE_DOWN:
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
	}
}
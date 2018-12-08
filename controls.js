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
			examine(player);
			break;
		case INVENTORY:
			inventory();
			break;
	}
}
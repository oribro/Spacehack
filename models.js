/*
*	Class for a game character
*/
class Character {

	constructor(x=0, y=0){
		this.x = x;
		this.y = y;
		this.hp = DEFAULT_HP;
	}

	get xPos() {
		return this.x;
	}
	get yPos() {
		return this.y;
	}
	get health() {
		return this.hp;
	}
	set xPos(n) {
		this.x = n;
	}
	set yPos(n) {
		this.y = n;
	}
	set health(hp){
		this.hp = hp;
	}
	/* Redraws the ground and sets character at new position.
	*  Returns the new position to draw the character symbol at.
	*/
	moveChar(xPos, yPos) {

		var biDigCurX = getTwoDigits(this.xPos);
		var biDigCurY = getTwoDigits(this.yPos);
		
		// Set current character cell to ground.
		removeTileOnTop("c"+biDigCurY+biDigCurX);
		
		// Set character position properties to new position.
		this.xPos = xPos;
		this.yPos = yPos;
		
		// Increment the turn counter.
		incrementTurnCounter();

		return [
			xPos,
			yPos
		];
	}

}


/*
*	Class for the human player character.
*/
class Player extends Character {

	constructor(x=0, y=0){
		super(x, y);
		this.hunger = 100;
		// TODO: We wouldn't need this if we had enabled EventSystem.publish
		// to accept methods. Right now the binding is needed because currently
		// die is defined at WINDOW (global) scope.  
		this.die = this.die.bind(this);
		this.inventory = [new Item("Ration"),
						  new Item("Ration")];
	}

	move(event) {
		var key = event.key;
		// Vars for computing the new position to move the character.
		let newBiDig = [];
		let newPos = [];
		// Obtain the npcs from the storage to check for bounds.
		let npcs = JSON.parse(
			sessionStorage.getItem('npcs')
		); 
		
		switch(key) {
			case "ArrowRight":
				newPos = [this.xPos + 1, this.yPos];
				break;
			case "ArrowLeft":
				newPos = [this.xPos - 1, this.yPos];
				break;
			case "ArrowUp":
				newPos = [this.xPos, this.yPos - 1]
				break;
			case "ArrowDown":
				newPos = [this.xPos, this.yPos + 1]
				break;
			default:
				return;
		}

		if(checkBounds(...newPos, npcs)) {
			newBiDig = this.moveChar(...newPos);
			// Draw the character symbol at the updated location.
			this.draw(...newBiDig);
			this.getHungrier();
		}
	}

	/*
	*	Draws the character at the given position. 
	*/
	draw(xPos, yPos){
		const biDigX = getTwoDigits(xPos);
		const biDigY = getTwoDigits(yPos);
		setTileOnTop("c"+biDigY+biDigX, T_PLAYER);
	}
	
	/*
	*	Returns the player's image on the tileset.
	*/
	getImage(){
		const biDigX = getTwoDigits(this.xPos);
		const biDigY = getTwoDigits(this.yPos);
		return "o" + biDigY + biDigX;
	}

	/* Reduces hunger value with each turn and eventually reduces health */
	getHungrier() {
		this.hunger--;
		// TODO: Subscribe and publish the different hunger events.

		if(this.hunger == 50) {
			printToLog(STRINGS[EVENT.HUNGRY1]);
		}
		if(this.hunger == 20) {
			printToLog(STRINGS[EVENT.HUNGRY2]);
		}
		if(this.hunger == 0) {
			printToLog(STRINGS[EVENT.HUNGRY3]);
		}
		if(this.hunger < 0) {
			this.health = this.health - 1;
			document.getElementById("hp-value").innerHTML = this.health;
		}
		if(this.health === 0){
			// Disable player movement. The syntax could be improved with JQuery.
			document.body.onkeydown = null;
			window.eventSys.publish(EVENT.STARVATION, "Staying hungry for too long");
		}

	}
	
	getInventory() {
		return this.inventory;
	}
	
	setInventory(newInv) {
		this.inventory = newInv;
	}
	
	/* Returns the cell in the direction given */
	getCellFromDirection(direction) {		
		switch (direction) {
			case MOVE_RIGHT:
				var biDigCurX = getTwoDigits(this.xPos + 1);
				var biDigCurY = getTwoDigits(this.yPos);
				return "c" + biDigCurY + biDigCurX;
			case MOVE_UP:
				var biDigCurX = getTwoDigits(this.xPos);
				var biDigCurY = getTwoDigits(this.yPos - 1);
				return "c" + biDigCurY + biDigCurX;
			case MOVE_LEFT:
				var biDigCurX = getTwoDigits(this.xPos - 1);
				var biDigCurY = getTwoDigits(this.yPos);
				return "c" + biDigCurY + biDigCurX;
			case MOVE_DOWN:
				var biDigCurX = getTwoDigits(this.xPos);
				var biDigCurY = getTwoDigits(this.yPos + 1);
				return "c" + biDigCurY + biDigCurX;
		}
	}
	
	/* Stops movement and prompts the user to input a direction for the action */
	promptDirection(action) {
		movement = false;
		printToLog("In what direction do you want to " + action +"?");
	}
	
	/* On key press of matching key, examines the perimeter around the player and prints information to log. */
	examine(direction) {
		if(direction === undefined) {
			this.promptDirection("examine");
		} else {
			var cell = this.getCellFromDirection(direction);
			var cellElement = document.getElementById(cell);
			// Check if the cell has item in it.
			var item = createItemFromCell(cell);
			if (item) {
				printToLog(item.description);
				return;
			// TODO: Examine non-items!
			// The cell does not contain item. What if it contains a background element?
			} else if(cellElement.hasAttribute("env")) {
				printToLog(getDescription(cellElement.getAttribute("env")));
			} else {
				printToLog(STRINGS[EVENT.EXAMINE_NOTHING]);
			}
		}
		/*
		var i,j;
		for(i = -1; i <= 1; i++) {
			for(j = -1; j <= 1; j++) {
				if(i == 0 && j == 0) {
					continue;
				}
				if((this.xPos + i) >= 0 && (this.xPos + i) < WIDTH && 
					(this.yPos + j) >= 0 && (this.yPos + j) < HEIGHT) {
					var biDigX = getTwoDigits(this.xPos + i);
					var biDigY = getTwoDigits(this.yPos + j);
					// Check if the cell has item in it.
					var item = createItemFromCell("c" + biDigY + biDigX);
					if (item) {
						printToLog(item.description);
						return;
					}
					// TODO: Examine non-items!
					// The cell does not contain item. What if it contains a background element?
					else
						continue;
				}
			}
		}*/
	}
	
	/* On key press of matching key, prompts the player whether to pick up an item around him and picks up the item if player decides to. */
	pickup() {
		var i,j;
		for(i = -1; i <= 1; i++) {
			for(j = -1; j <= 1; j++) {
				if(i == 0 && j == 0) {
					continue;
				}
				if((this.xPos + i) >= 0 && (this.xPos + i) < WIDTH && 
					(this.yPos + j) >= 0 && (this.yPos + j) < HEIGHT) {
					var biDigX = getTwoDigits(this.xPos + i);
					var biDigY = getTwoDigits(this.yPos + j);
					var cell = "c" + biDigY + biDigX;
					// Check if the cell has item in it.
					var item = createItemFromCell(cell);
					if (item) {
						if (confirm(`Do you want to pick-up ${item.name}?`)) {
							// Adds the item to player's inventory and removes it from the cell.
							this.inventory = [...this.inventory, item];
							removeItemFromCell(cell);
							// Checks if the items can be stacked together.

							// TODO: Not all items should be stackable!

							//if (item.isStackable) {
							this.inventory = itemStack(this.inventory, item);
							this.setInventory(this.inventory);
							//}
							repopInv(this);
						}
						return;
					}
				}
			}
		}
	}
	
	/* Prompts the player for an item number and returns the input. */
	itemSelection() {
		var itemSel = parseInt(prompt("Choose item number from the inventory:"), 10);
		if(typeof itemSel != "number") {
			printToLog(STRINGS["use_err_msg"]);
		} else if (itemSel < 1 || itemSel > this.getInventory().length) {
			printToLog(STRINGS["use_err_msg"]);
		} else {
			return itemSel;
		}
	}
	
	/* Prompts the player for an item number and uses the item.
	*	drop: boolean. Determines whether to use the item or drop it.
	*/
	use() {
		var itemSel = this.itemSelection();
		var item = this.getInventory()[itemSel-1];

		// TODO: Iterate predefined item list in a generic way and find matching type.
		// There should be a way to generalize this function behaviour. We don't want
		// 'use' and 'examine' to get too bloated.
		// This is a nasty code duplication right here.
		switch(item.type) {
			case "Food":
				this.incHunger = item.value;
				printToLog("You eat the " + item.name + ". You feel satiated.");
				this.getInventory().splice(itemSel-1, 1);
				repopInv(this);
				break;
			case "Currency":
				// TODO: Implement usage of coins i.e for buying items at a shop
			default:
				printToLog(STRINGS["not_implemented_err"]);
		}
	}
	
	/* Prompts the player for an item number and drops the item. */
	drop() {
		var itemSel = this.itemSelection();
		var item = this.getInventory()[itemSel-1];
		const biDigX = getTwoDigits(this.xPos);
		const biDigY = getTwoDigits(this.yPos);
		setItemOntoCell("c" + biDigY + biDigX, item);
		printToLog("You dropped " + item.name + " on the ground.");
		this.getInventory().splice(itemSel-1, 1);
		repopInv(this);
	}

	/*
	*  The tragic event of the player's health reaching zero.
	*  cause: string. The reason why the player died.
	*/
	async die(cause) {
		await sleep(700);
		const turn = document.getElementById("turn-value").innerText;
		let image = document.getElementById(this.getImage());
		document.getElementById("log").style.display = "none";
		document.getElementById("stats").style.display = "none";
		// Using the power of ES to make a beautiful async animation:
		// Once the animation starts, the program waits for it to finish.
		image.style.animation = "rotate90 2s";
		await sleep(2500);
		image.style.display = "none";
		// ES6 style for writing multiline strings with variables.
		alert(`Oh no! You died.\n` +
		`Sadly, this is where your journey ends.\n` +
		`You survived for ${ turn } turns.\n` +
		`Cause of death: ${ cause }.`
		);
	}
	get hungerVal() {
		return this.hunger;
	}
	set hungerVal(newHunger) {
		this.hunger = newHunger;
	}
	set incHunger(addHunger) {
		this.hunger += addHunger;
	}
}

/*
* Class for a Non Playable Character.
*/
class NPC extends Character{

	constructor(x, y){
		super(x, y);
		this.draw(x, y);
	}

	/*
	*	Draws the character at the given position.
	*/
	draw(xPos, yPos){
		const biDigX = getTwoDigits(xPos);
		const biDigY = getTwoDigits(yPos);
		if(useTileset) {
			setTileOnTop("c"+biDigY+biDigX, T_NPC);
		} else {
		setCell("c"+biDigY+biDigX, T_NPC, NON_PLAYER, C_NPC);
		}
	}

}


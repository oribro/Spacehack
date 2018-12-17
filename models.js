/* Character traits */
const MAX_HP = 100;
const SPAWN_HP = 20;

const NPC_LIST = {
				"Dogfish": T_DOGFISH_R + ";50"
				 };
				 
var npcs = [];

/*
*	Class for a game character
*/
class Character {

	constructor(x=0, y=0){
		this.x = x;
		this.y = y;
		this.hp = SPAWN_HP;
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
		removeTileOnTop("c"+biDigCurY+biDigCurX, true);
		
		// Set character position properties to new position.
		this.xPos = xPos;
		this.yPos = yPos;

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
						  new Item("Ration")
						 ];
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
			// Increment the turn counter.
			incrementTurnCounter(this);
		}
	}

	/*
	*	Draws the character at the given position. 
	*/
	draw(xPos, yPos){
		const biDigX = getTwoDigits(xPos);
		const biDigY = getTwoDigits(yPos);
		setTileOnTop("c"+biDigY+biDigX, T_PLAYER, "true");
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
	
	/* On key press of matching key, examines the perimeter around the player and prints information to log. */
	examine(direction) {
		if(direction === undefined) {
			promptDirection("examine");
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
					if(getEnv(cell) == "container1") {
						var container;
						let i;
						for(i = 0; i < containers.length; i++) {
							if(containers[i].cell == cell) {
								container = containers[i]
							}
						}
						for(i = 0; i < container.content.length; i++) {
							if (confirm(`Do you want to pick-up ${container.content[i].name}?`)) {
								this.inventory = [...this.inventory, container.content[i]];
								container.popItem(container.content[i]);
								
								//this.inventory = itemStack(this.inventory, container.content[i]);
								//this.setInventory(this.inventory);
								repopInv(this);
							}
							return;
						}
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
			case "Health":
				// Check if the first aid is needed.
				if (this.hp === MAX_HP) {
					printToLog("You're already healthy as a horse.");
					break;
				}
				this.incHealth = item.value;
				printToLog("You use the " + item.name + ". You feel healthier.");
				this.getInventory().splice(itemSel-1, 1);
				repopInv(this);
				break;
			case "Currency":
				// TODO: Implement usage of coins i.e for buying items at a shop
			case "Utility":
				utilItem(item, this);
				break;
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
		document.getElementById("c" + biDigY + biDigX).setAttribute("walkable", "false");
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
		var sadTrombone = new sound(SAD_TROMBONE);
		sadTrombone.loop(false);
		sadTrombone.play();
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
	// Increase player health without exceeding max possible health.
	set incHealth(addHp) {
		MAX_HP - this.hp >= addHp ? this.hp += addHp : this.hp += MAX_HP - this.hp;
		document.getElementById("hp-value").innerHTML = this.hp;
	}
}

/*
* Class for a Non Player Character.
*/
class NPC extends Character{

	/** Constructor for NPC.
	 *	x: x position to spawn the NPC.
	 *	y: y position to spawn the NPC.
	 *	type: NPC type as specified in NPC_LIST.
	 *	status: string, "friend" or "enemy".
	 **/
	constructor(x, y, type, status){
		super(x, y);
		this.type = type;
		this.tile = NPC_LIST[type].slice(0, NPC_LIST[type].indexOf(";"));
		this.hp = NPC_LIST[type].slice(NPC_LIST[type].indexOf(";") + 1);
		this.status = status;
		this.draw(x, y);
	}

	/*
	*	Draws the character at the given position.
	*/
	draw(xPos, yPos){
		const biDigX = getTwoDigits(xPos);
		const biDigY = getTwoDigits(yPos);
		setTileOnTop("c"+biDigY+biDigX, this.tile, "false");
		setEnv("c"+biDigY+biDigX, this.tile);
	}
	
	/* Moves the NPC to a cell in the direction of the player. */
	move(player) {
		let xDist = Math.abs(player.xPos - this.x);
		let yDist = Math.abs(player.yPos - this.y);
		if(xDist < 2 && yDist < 2) {
			return;
		}
		if(player.xPos > this.x) {
			this.tile = this.tile.replace(this.type + "_r", this.type + "_l");
			if(xDist > yDist) {
				this.moveChar(this.x + 1, this.y);
			} else {
				if(player.yPos > this.y) {
					this.moveChar(this.x, this.y + 1);
				} else {
					this.moveChar(this.x, this.y - 1);
				}
			}
		} else {
			this.tile = this.tile.replace(this.type + "_l", this.type + "_r");
			if(xDist > yDist) {
				this.moveChar(this.x - 1, this.y);
			} else {
				if(player.yPos > this.y) {
					this.moveChar(this.x, this.y + 1);
				} else {
					this.moveChar(this.x, this.y - 1);
				}
			}
		}
		this.draw(this.x, this.y);
	}
	
}

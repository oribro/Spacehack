/* Character traits */
const MAX_HP = 100;
const SPAWN_HP = 20;
const SPAWN_DMG = 5;
const SPAWN_XP = 0;
const SPAWN_LVL = 1;
const XP_TURN = 5;
const XP_MULTIPLIER = 10;
const POISON_PERIOD = 10;

const NPC_LIST = {
				"Dogfish": T_DOGFISH_L + ";" + DOGFISH_WHINE + ";20;11;500",
				"Chick": T_CHICK_R + ";" + CHICK_CHIRP + ";50;13;800",
				"Three Headed Humanoid": T_TRIHEADHUMANOID + ";" + PUNCH + ";300;100;10000",
				"Snake": T_SNAKE_L + ";" + SNAKE_HISS + ";100;15;2000",
				"Octoman": T_OCTOMAN + ";" + PUNCH + ";300;100;10000",
				 };

/* Constants for the different statuses the player can be at */
const PLAYER_STATUS = {
	"HEALTHY": "Healthy",
	"POISONED": "Poisoned",
	"MALNOURISHED": "Malnourished"
}

/* Constants for user actions */
const USER_ACTION = {
	"PICKUP": "pickup",
	"EXAMINE": "examine"
}

var npcs = [];
var storeInv = [
	new Item("Bow"),
	new Item("Crossbow"),
	new Item("Arrows")
];

/*
*	Class for a game character
*/
class Character {

	constructor(x=0, y=0){
		this.x = x;
		this.y = y;
		this.hp = SPAWN_HP;
		this.alive = true;
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
	get isAlive() {
		return this.alive;
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
	set isAlive(newIsAlive) {
		this.alive = newIsAlive;
	}

	/* Redraws the ground and sets character at new position.
	*  Returns the new position to draw the character symbol at.
	*  noTile: Optional. If set does not remove tile.
	*/
	moveChar(xPos, yPos, noTile) {

		var biDigCurX = getTwoDigits(this.xPos);
		var biDigCurY = getTwoDigits(this.yPos);
		
		// Check if the player just dropped an item on the current cell.
		if(noTile === undefined) {
			var items = getItemsInCell("c"+biDigCurY+biDigCurX);
			if(items.length > 0) {
				removeTileOnTop("c"+biDigCurY+biDigCurX, false);
			} else {
			// Move the char from the current position.
				removeTileOnTop("c"+biDigCurY+biDigCurX, true);
			}
		}

		// Set character position properties to new position.
		this.xPos = xPos;
		this.yPos = yPos;

		return [
			xPos,
			yPos
		];
	}
	
	/* Checks whether the character is standing next to the given character. */
	nextTo(character) {
		var xOffset,yOffset;
		var biDigThisX, biDigThisY;
		for(xOffset = -1; xOffset <= 1; xOffset++) {
			biDigThisX = getTwoDigits(this.xPos + xOffset);
			for(yOffset = -1; yOffset <= 1; yOffset++) {
				biDigThisY = getTwoDigits(this.yPos + yOffset);
				if(inBounds("c"+biDigThisY+biDigThisX)) {
					if(this.xPos + xOffset == character.xPos && this.yPos + yOffset == character.yPos) {
						return true;
					}	
				}
			}
		}
		return false;
	}
}


/*
*	Class for the human player character.
*/
class Player extends Character {

	constructor(x=0, y=0){
		
		super(x, y);
		this.hunger = 100;
		var weapon = null;
		var mask = new Item("Std. Mask");
		var suit = new Item("Std. Suit");
		this.inventory = [new Item("Ration"),
						  new Item("Ration"),
						  mask,
						  suit,
						  // Uncomment to test workbench.
						  
						  new Item("Metal", "Resource", 999),
						  new Item("Wood", "Resource", 999),
						  new Item("Gravel", "Resource", 999)
						  
						 ];
		this.dmg = SPAWN_DMG;
		this.xp = SPAWN_XP;
		this.lvl = SPAWN_LVL;
		this.def = 0;
		
		this.equipment = {
				Weapon: null,
				Mask: mask,
				Suit: suit,
				Accessory: null
			};
		
		this.equip(this.inventory[2], false);
		this.equip(this.inventory[3], false);
		
		this.mapX = 0;
		this.mapY = 0;

		this.pStatus = PLAYER_STATUS.HEALTHY;
		setStatusStat(this.pStatus);
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

		let biDigX = getTwoDigits(newPos[0]);
		let biDigY = getTwoDigits(newPos[1]);
		
		// If out of bounds change map
		if(!inBounds("c" + biDigY + biDigX)) {
			if(!PLOT.DOGFISH.isCompleted) {
				printToLog("\"I should find a way to put out the fire before I begin exploring this place.\"");
			} else {
				saveMapItems(this.mapX+","+this.mapY, true);
				// Remove world map position indicator from the previous map.
				let youAreHere = document.getElementsByClassName("you_are_here")[0];
				youAreHere.parentNode.removeChild(youAreHere);
				if(newPos[0] >= WIDTH) {
					this.mapX++;
					newBiDig = this.moveChar(0, newPos[1]);
				} else if (newPos[0] < 0) {
					this.mapX--;
					newBiDig = this.moveChar(WIDTH-1, newPos[1]);
				} else if(newPos[1] < 0) {
					this.mapY--;
					newBiDig = this.moveChar(newPos[0], HEIGHT-1);
				} else {
					this.mapY++;
					newBiDig = this.moveChar(newPos[0], 0);
				}
				currMap = this.mapX+","+this.mapY;
				if(isInitialVisit(this.mapX+","+this.mapY)) {
					spawnGameObjects(this.mapX+","+this.mapY, true);
				} else {
					spawnGameObjects(this.mapX+","+this.mapY);
				}
				loadMapItems(this.mapX+","+this.mapY);
				// Set world map position indicator to the next map.
				setPlayerWorldMapPositionIndicatorTo(this.mapX+","+this.mapY);
				// Draw the character symbol at the updated location.
				this.draw(...newBiDig);
				this.getHungrier();
				// Increment the turn counter.
				incrementTurnCounter(this);
				// Increase XP on every turn.
				this.xp += XP_TURN;
				setXpStat(this.xp);
				// Update the coordinates stat.
				setCoordsStat(this.mapX, this.xPos, this.mapY, this.yPos);
			}
		}
		
		if(isMovable("c" + biDigY + biDigX)) {
			newBiDig = this.moveChar(...newPos);
			// Draw the character symbol at the updated location.
			this.draw(...newBiDig);
			this.getHungrier();
			// Check for poison
			this.poisonCheck();
			// Increment the turn counter.
			incrementTurnCounter(this);
			// Increase XP on every turn.
			this.xp += XP_TURN;
			setXpStat(this.xp);
			// Update the coordinates stat.
			setCoordsStat(this.mapX, this.xPos, this.mapY, this.yPos);
		}
	}

	/* Checks if the player is poisoned and updates the remaining time left until cured */
	poisonCheck() {
		// Check if the player is poisoned and update poison status.
		this.updateIfPoisoned();
		// Check for poisonous environment
		this.checkForPoisonousEnv();
	}

	updateIfPoisoned() {
		if (this.pStatus === PLAYER_STATUS.POISONED) {
			if (this.poisonCounter === POISON_PERIOD) {
				this.pStatus = PLAYER_STATUS.HEALTHY;
				setStatusStat(this.pStatus);
				this.poisonCounter = 1;
				printToLog("The poison fades away and you're cured.");
				return;
			}
			this.decHealth(1);
			this.poisonCounter++;
		}
	}

	checkForPoisonousEnv() {
		let toxicTreeCell = this.searchPerimeterFor("tree2");
		if (toxicTreeCell !== null) {
			let treePos = getRowAndColFromCell(toxicTreeCell);
			let distanceFromTree = getDistanceBetweenTwoPoints(this.xPos, this.yPos, treePos.col, treePos.row);
			// Check if the player is around the poisonous tree.
			if (distanceFromTree < 2) {
				this.pStatus = PLAYER_STATUS.POISONED;
				setStatusStat(this.pStatus);
				printToLog(STRINGS["poisonous_tree"]);
			}

			// Check if the player escaped the poisonous tree.
			else if (distanceFromTree >= 2 && distanceFromTree < 3 &&
				this.pStatus === PLAYER_STATUS.POISONED) {
				this.pStatus = PLAYER_STATUS.HEALTHY;
				setStatusStat(this.pStatus);
				printToLog(STRINGS["poisonous_tree_withdrawal"]);
			}
		}
	}

	/* Check if the surroundings of the player contain some enviorment object.
	 Return the matching cell if found, null otherwise   */ 
	searchPerimeterFor(env) {
		for (let i = -2; i <= 2; i++) {
			for (let j = -2; j <= 2; j++) {
				// The player cell isn't on the perimeter.
				if (j == 0 && i == 0)
					continue;
				let cell = getCell(this.yPos + i, this.xPos + j);
				if (getEnv(cell) === env)
					return cell;
			}
		}
		return null;
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
			this.pStatus = PLAYER_STATUS.MALNOURISHED;
			setStatusStat(this.pStatus);
		}
		if(this.hunger < 0) {
			this.health = this.health - 1;
			setHpStat(this.health);
		}
		if(this.health === 0 && this.hunger < 0){
			this.die("Staying hungry for too long");
		}

	}
	
	/* Reduces dmg amount from player's hp and plays a grunting sound */
	getHit(dmg) {
		// Check for godmode state.
		if (Number.isFinite(this.health)) {
			var computedDmg = dmg - this.def;
			if(computedDmg < 0) {
				computedDmg = 0;
			}
			this.health = this.health - computedDmg;
			setHpStat(this.health);
		}
		
		var grunt = new sound(GRUNT);
		grunt.loop(false);
		grunt.play();
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
				return getCell(this.yPos, this.xPos + 1);
			case MOVE_UP:
				return getCell(this.yPos - 1, this.xPos);
			case MOVE_LEFT:
				return getCell(this.yPos, this.xPos - 1);
			case MOVE_DOWN:
				return getCell(this.yPos + 1, this.xPos);
		}
	}
	
	/* On key press of matching key, examines the perimeter in the given direction
	* and prints information to log. 
	*/
	async examine(direction) {
		if(direction === undefined) {
			promptDirection("examine");
		} else {
			var cell = this.getCellFromDirection(direction);
			if(!inBounds(cell)) {
				printToLog(STRINGS["out_of_bounds"]);
				return;
			}
			var cellElement = document.getElementById(cell);
			// Check if the cell has item in it. 
			// In case of multiple items, Only the top item will be examined.
			let numItems = getItemsInCell(cell).length; 
			if (numItems === 1) {
				let topItem = createItemsFromCell(cell, [SINGLE_ITEM_INDEX]);
				printToLog(topItem[SINGLE_ITEM_INDEX - 1].description);
				return;

			// Examine multiple items.
			} else if (numItems > 1) {
				let itemList = createItemsFromCell(cell, range(1, numItems));
				let choice = await promptMultItemsChoice(itemList, 1, USER_ACTION.EXAMINE);
				if (choice) {
					if (parseInt(choice) < 1 || 
						parseInt(choice) > itemList.length) {
							printToLog("The number you've entered is invalid. " +
							"Please select a number from the list and try again.");
							return;
						}
					else if (isNaN(choice)) {
						printToLog("Ilegal choice. Please follow the instructions and try again");
						return;
					}

					printToLog(itemList[parseInt(choice) - 1].description);
					return;
				}
				else{
					printToLog("You chose nothing.");
					return;
				}

			} else if(cellElement.hasAttribute("env")) {
				if (cellElement.getAttribute("env") === "gate" && cellElement.getAttribute("walkable") === "false") {
					let accessory = document.getElementById("accessory-slot").innerHTML.split(" ")[0];
					if (accessory === "Babelfish") 
						await attemptToOpenCityGate(cellElement);
					else 
						printToLog("Some alien language is scribbled on the gate which you cannot understand.");
					return;
				}
				printToLog(getDescription(cellElement.getAttribute("env")));
				if(cellElement.getAttribute("env").search("ship") != -1) {
					toggleWindow("parts", null, true);
				}
			} else {
				printToLog(STRINGS[EVENT.EXAMINE_NOTHING]);
			}
		}
	}

	/* On key press of matching key, prompts the player whether to pick up an item
	*  in the given direction and picks up the item if player decides to. */
	async pickup(direction) {
		if(direction === undefined) {
			promptDirection("pickup");
		} else {
			var cell = this.getCellFromDirection(direction);
			if(!inBounds(cell)) {
				printToLog(STRINGS["out_of_bounds"]);
				return;
			}
			// We need to know how many items are in the cell in the wanted direction.
			var numItems = getItemsInCell(cell).length;

			// Single item case: check if the cell has item in it.
			if (numItems === 1) {
				let items = createItemsFromCell(cell, [SINGLE_ITEM_INDEX]);
				let item = items[SINGLE_ITEM_INDEX - 1];
				if (item) {
					if (await promptInput(`Do you want to pick-up ${item.name}?`, true)) {
						// Adds the item to player's inventory and removes it from the cell.
						this.inventory = [...this.inventory, item];
						removeItemsFromCell(cell, [SINGLE_ITEM_INDEX]);
						// Checks if the items can be stacked together.
						if (item.isStackable) {
							this.inventory = itemStack(this.inventory, item);
							this.setInventory(this.inventory);
						}
						printToLog("You picked up the " + item.name + ".");
						repopInv(this);
						saveGame(this);
					} else {
						printToLog("You did not pick up the " + item.name + ".");
					}
					return;
				}
			}

			// Multiple item case: prompt the user to choose items.
			else if (numItems > 1) {
				let itemList = createItemsFromCell(cell, range(1, numItems));
				let choice = await promptMultItemsChoice(itemList, 1, USER_ACTION.PICKUP);
				let method = validateMultItemsChoice(choice, itemList);
				let itemIndices;
				let items;

				// Check if choice is validated.
				if (method !== "") {
					itemIndices = getItemIndicesFromChoice(choice, method, numItems);

					// Add the items to the inventory and remove them from the cell.
					items = createItemsFromCell(cell, itemIndices);
					this.addItemsToInventory(items);
					removeItemsFromCell(cell, itemIndices);
					
					// Print a message to the log with the items that were picked up.
					var pickupMsg = "You picked up the";
					var i = 0;
					do {
						pickupMsg += " " + items[i].name + ",";
						i++;
					} while(i < items.length - 1);	
					if(i < items.length) {
						pickupMsg = pickupMsg.slice(0, length-1) + " and " + items[i].name + ".";
					} else {
						pickupMsg = pickupMsg.slice(0, length-1) + ".";
					}
					printToLog(pickupMsg);
					
					saveGame(this);
					return;
				}
			}

			// Container case: prompt the user to choose items and loot the container.
			else if (getEnv(cell) == "container1") {
				let container = containers[cell];
				if (!container || container === undefined)
					alert("Programming Error. Details: Check env variable for container.");

				createSound(CONTAINER_OPEN, false);
				if (container.content.length === 0) {
					printToLog("The container is empty. Nothing to do here.");
					return;
				}

				let itemList = container.content;
				let numItems = container.content.length;
				let choice = await promptMultItemsChoice(itemList, 2, USER_ACTION.PICKUP);
				let method = validateMultItemsChoice(choice, itemList);

				if (method !== "") {
					let itemIndices = getItemIndicesFromChoice(choice, method, numItems);
					// Remove the items from the container and add them to the inventory.
					let items = [];
					// Iterate backwards similar to the algorithm in removeItemFromCell,
					// because the indices found after the removal having their index reduced by one.
					for (let i = itemIndices.length -1 ; i >= 0; i--) {
						let chosenIndex = itemIndices[i] - 1;
						items.push(container.content[chosenIndex]);
						container.popItem(chosenIndex);
					}
					this.addItemsToInventory(items);
					
					// Print a message to the log with the items that were picked up.
					var pickupMsg = "You picked up the";
					var i = 0;
					do {
						pickupMsg += " " + items[i].name + ",";
						i++;
					} while(i < items.length - 1);	
					if(i < items.length) {
						pickupMsg = pickupMsg.slice(0, length-1) + " and " + items[i].name + ".";
					} else {
						pickupMsg = pickupMsg.slice(0, length-1) + ".";
					}
					printToLog(pickupMsg);
					
					saveGame(this);
				}

			}

			// No items case: nothing to do here.
			else {
				printToLog(STRINGS["pickup_nothing"]);
				return;
			}
		}
	}
	
	/*
	*	Add the given array of items to the player's inventory.
	*/
	addItemsToInventory(items) {
		this.inventory = [...this.inventory, ...items];

		items.forEach(
			item => {
				if (item.isStackable) {
					this.inventory = itemStack(this.inventory, item);
					this.setInventory(this.inventory);
				}
			}
		)

		repopInv(this);
	}
	
	/* Remove the given item from the inventory.
	 * Optional: itemValue, the value of the item to reduce if the item is stackable. 
	 */
	removeItemFromInventory(itemName, itemValue) {
		var i = -1;
		var inv = this.inventory;
		this.inventory.forEach(function (invItem) {
			i++;
			if(invItem.name == itemName) {
				if(itemValue !== undefined) {
					if(itemValue < invItem.value && invItem.isStackable) {
						invItem.value = invItem.value - itemValue;
						return;
					}
				}
				inv.splice(i, 1);
				return;
			}
		});
		repopInv(this);
	}
	
	/* Takes item name and value and returns whether this item with at least that value is in the inventory */
	inInv(itemName, itemValue) {
		for(i = 0; i < this.inventory.length; i++) {
			if(this.inventory[i].name == itemName && this.inventory[i].value >= itemValue) {
				return true;
			}
		}
		return false;
	}
	
	/* Takes item name and returns the item from the inventory. If not in inventory returns null */
	getInvItem(itemName) {
		for(i = 0; i < this.inventory.length; i++) {
			if(this.inventory[i].name == itemName) {
				return this.inventory[i];
			}
		}
		return null;
	}

	/* Prompts the player for a selection number and returns the input.
	 * category: the name of the list from which the player selects.
	 */
	async itemSelection(category) {
		var listLength;
		switch(category) {
			case "inventory":
				var itemSel = parseInt(await promptInput("Choose item number from the inventory:"));
				listLength = this.getInventory().length;
				break;
			case "equipment":
				var itemSel = parseInt(await promptInput("Choose type number from the equipment list:"));
				listLength = Object.keys(this.equipment).length;
				break;
			case "parts":
				var itemSel = parseInt(await promptInput("Choose part number from the ship parts list:"));
				listLength = Object.keys(PARTS_REQS).length;
				break;
			case "workbench":
				var itemSel = parseInt(await promptInput("Choose item number from the workbench list:"));
				listLength = Object.keys(WORKBENCH_REQS).length;
				break;
			case "big-objects":
				var itemSel = parseInt(await promptInput("Choose item number from the big objects list:"));
				listLength = Object.keys(BIG_OBJECTS_REQS).length;
				break;
			case "trade":
				var itemSel = parseInt(await promptInput("Choose item number from the inventory to sell," +
					"or choose an item letter from the store to buy:"));
		}
		if(isNaN(itemSel)) {
			printToLog(STRINGS["use_err_msg"]);
			return null;
		} else if (itemSel < 1 || itemSel > listLength) {
			printToLog(STRINGS["not_in_range"]);
			return null;
		} else {
			return itemSel;
		}
	}
	
	/* Prompts the player for an item number and uses the item.
	*	drop: boolean. Determines whether to use the item or drop it.
	*/
	async use() {
		var persist = toggleWindow("inventory", this, true);
		var itemSel = await this.itemSelection("inventory");
		if(!persist) {
			toggleWindow("inventory", this);
		}
		// Ilegal selection. Nothing to do here.
		if (!itemSel)
			return;
		var item = this.getInventory()[itemSel-1];

		// TODO: Iterate predefined item list in a generic way and find matching type.
		// There should be a way to generalize this function behaviour. We don't want
		// 'use' and 'examine' to get too bloated.
		// This is a nasty code duplication right here.
		switch(item.type) {
			case "Food":
				// Check if the item is considered poisonous.
				if (POISONOUS_FOOD.indexOf(item.name) !== -1) {
					this.pStatus = PLAYER_STATUS.POISONED;
					setStatusStat(this.pStatus);
					printToLog(STRINGS["poisoned"]);
					this.poisonCounter = 1;
				}
				else {
					this.incHunger = item.value;
					printToLog("You eat the " + item.name + ". You feel satiated.");
				}
				this.getInventory().splice(itemSel-1, 1);
				repopInv(this);
				createSound(CHEWING, false);
				break;
			case "Health":
				// Check if the first aid is needed.
				if (this.hp === MAX_HP) {
					printToLog("You're already healthy as a horse.");
					break;
				}
				// Check for godmode state.
				if (Number.isFinite(this.hp))
					this.incHealth = item.value;
				// Check for poison
				if (this.pStatus === PLAYER_STATUS.POISONED) {
					this.pStatus = PLAYER_STATUS.HEALTHY;
					setStatusStat(this.pStatus);
					printToLog("The " + item.name + " cures you of poison.");
				}
				createSound(RELIEF, false);
				printToLog("You use the " + item.name + ". You feel healthier.");
				this.getInventory().splice(itemSel-1, 1);
				repopInv(this);
				break;
			case "Currency":
				// TODO: Implement usage of coins i.e for buying items at a shop
			case "Utility":
				utilItem(item, this);
				break;
			case "Weapon":
				this.equip(item);
				break;
			case "Mask":
				this.equip(item);
				break;
			case "Suit":
				this.equip(item);
				break;
			case "Accessory":
				this.equip(item);
				break;
			default:
				printToLog(STRINGS["not_implemented_err"]);
		}
		saveGame(this);
	}
	
	/* Use acquired resources for constructing beneficial items and spaceship parts */
	async build(direction) {
		if(direction === undefined) {
			promptDirection("build");
		} else {
			var cell = this.getCellFromDirection(direction);
			var cellElement = document.getElementById(cell);
			var env = cellElement.getAttribute("env");
			
			// Build ship parts.
			if (env && env.search("ship") != -1) {
				if(!PLOT.FIRE.isCompleted) {
					printToLog("\"I should probably extinguish the fire before I worry about fixing the ship.\"");
					return;
				}
				var persist = toggleWindow("parts", null, true);
				// Prompt user for ship part selection.
				var partSel = await this.itemSelection("parts") - 1;
				if(!persist) {
					toggleWindow("parts");
				}
				
				var partKey = Object.keys(PARTS_REQS)[partSel];
				var partReqs = PARTS_REQS[partKey];

				// If the player has already repaired the part, it is already working.
				if (builtShipParts.has(partKey)) {
					printToLog("You have already repaired the " + partKey.toLowerCase() +".");
					return;
				}

				if(this.inInv("Metal", parseInt(partReqs.split(";")[0])) && 
				   this.inInv("Wood", parseInt(partReqs.split(";")[1])) && 
				   this.inInv("Gravel", parseInt(partReqs.split(";")[2]))) {
					createSound(BUILDING, false);
					// Reduce resources from inventory.
					this.removeItemFromInventory("Metal", parseInt(partReqs.split(";")[0]));
					this.removeItemFromInventory("Wood", parseInt(partReqs.split(";")[1]));
					this.removeItemFromInventory("Gravel", parseInt(partReqs.split(";")[2]));
					// Mark the part off the parts list.
					markBuilt(partKey);
					// Add part to ship visually.
					repairShip(partKey);
					// Mark that the part was built and save for later.
					builtShipParts.add(partKey);
					saveGame(this);
					printToLog("You have built and repaired the " + partKey.toLowerCase() + ".");
				} else {
					printToLog("You don't have enough resources to build this.");
					return;
				}
			// Build from workbench.
			} else if(env && env.search("workbench") != -1) {
				var persist = toggleWindow("workbench", null, true);
				// Prompt user for workbench item selection.
				var benchSel = await this.itemSelection("workbench") - 1;
				var benchKey = Object.keys(WORKBENCH_REQS)[benchSel];
				var workbenchReqs = WORKBENCH_REQS[benchKey];
				if(!persist) {
					toggleWindow("workbench");
				}
				if(this.inInv("Metal", parseInt(workbenchReqs.split(";")[0])) && 
				   this.inInv("Wood", parseInt(workbenchReqs.split(";")[1])) && 
				   this.inInv("Gravel", parseInt(workbenchReqs.split(";")[2]))) {
					createSound(BUILDING, false);
					// Reduce resources from inventory.
					this.removeItemFromInventory("Metal", parseInt(workbenchReqs.split(";")[0]));
					this.removeItemFromInventory("Wood", parseInt(workbenchReqs.split(";")[1]));
					this.removeItemFromInventory("Gravel", parseInt(workbenchReqs.split(";")[2]));
					// Create selected item and add to inventory.
					var wbItemName = benchKey.toLowerCase();
					wbItemName = wbItemName.charAt(0).toUpperCase() + wbItemName.slice(1);
					var wbItem = new Item(wbItemName);
					if(wbItem.type == "Projectile") {
						wbItem.value = PROJECTILE_STACK;
					}
					this.addItemsToInventory([wbItem]);
					saveGame(this);
					printToLog("You have built a " + wbItemName + ".");
				} else {
					printToLog("You don't have enough resources to build this.");
					return;
				}
			// Build a big object (e.g.: workbench).
			} else if(cellElement.getAttribute("walkable") == "true" || env.search("water") != -1) {
				var persist = toggleWindow("big-objects", null, true);
				// Prompt user for big object selection.
				var objectSel = await this.itemSelection("big-objects") - 1;
				if(!persist) {
					toggleWindow("big-objects");
				}
				var objectKey = Object.keys(BIG_OBJECTS_REQS)[objectSel];
				var objectReqs = BIG_OBJECTS_REQS[objectKey];
				if(objectKey != "BRIDGE" && env.search("water") != -1) {
					printToLog("You cannot build there.");
					return;
				}
				if(this.inInv("Metal", parseInt(objectReqs.split(";")[0])) && 
				   this.inInv("Wood", parseInt(objectReqs.split(";")[1])) && 
				   this.inInv("Gravel", parseInt(objectReqs.split(";")[2]))) {
					createSound(BUILDING, false);
					setTileOnTop(cell, eval("T_"+objectKey.toUpperCase()), false);
					// Reduce resources from inventory.
					this.removeItemFromInventory("Metal", parseInt(objectReqs.split(";")[0]));
					this.removeItemFromInventory("Wood", parseInt(objectReqs.split(";")[1]));
					this.removeItemFromInventory("Gravel", parseInt(objectReqs.split(";")[2]));
					// If bridge set to walkable.
					if(objectKey == "BRIDGE") {
						cellElement.setAttribute("walkable", "true");
					}
					// Save object in the big objects list.
					if(!bigObjects[this.mapX+","+this.mapY]) {
						bigObjects[this.mapX+","+this.mapY] = [];
					}
					bigObjects[this.mapX+","+this.mapY].push([cell, objectKey]);
					saveGame(this);
					printToLog("You have built a " + objectKey.toLowerCase() + ".");
				} else {
					printToLog("You don't have enough resources to build this.");
				}
			} else {
				printToLog("You cannot build there.");
			}
		}
	}

	/* Starts a conversation with the target in the given direction */
	talk(direction) {
		if(direction === undefined) {
			promptDirection("talk");
		} else {
			var cell = this.getCellFromDirection(direction);
			var cellElement = document.getElementById(cell);
			var env = cellElement.getAttribute("env");
			
			if (!env) 
				return;

			switch (env) {
				case "octoman":
					this.trade();
					break;

				case "triheadhumanoid":
					talkToTriHeadHumanoid(this);
					break;

				default:
					printToLog(STRINGS["talk_to_yourself"]);
					break;
			}
		}
	}

	async trade() {
		createSound(TRADE, false);
		var persist = toggleWindow("inventory", this, true);
		toggleWindow("store", this);
		repopInv(this, true);
		var itemSel = await this.itemSelection("trade");
		if(!persist) {
			toggleWindow("inventory", this);
		}
		hideLeftWindow();
		// Ilegal selection. Nothing to do here.
		if (!itemSel)
			return;
		var item = this.getInventory()[itemSel-1];
		if (item.value > 1) {
			var amount = parseInt(await promptInput("How many would you like to sell?"));
			if (amount < 1 || amount > item.value) {
				printToLog(STRINGS["not_in_range"]);
				return;
			}
			if (amount == item.value) {
				this.removeItemFromInventory(item.name, item.value)
				return;
			}
			item.value -= amount;
			repopInv(this);
		}
		else {
			this.removeItemFromInventory(item.name, item.value)
		}
	}

	/* Takes an item and equips it 
	 * playSound: boolean, optional. if defined doesnt play the equip sound. necessary for player construction */
	equip(item, playSound) {
		if(item.lvl > this.lvl) {
			printToLog("You need to be at least level " + item.lvl + " to use this item.");
			return;
		}
		// Remove currently equipped item.
		this.unequip(item.type);
		
		updateEquipment(item.name, this);
		item.isEquipped = true;
		if(item.type == "Weapon") {
			this.equipment.Weapon = item;
			this.dmg += parseInt(item.value);
			setDmgStat(this.dmg);
			createSound(EQUIP_WEAPON, false);
		} else {
			if(item.type == "Mask") {
				this.equipment.Mask = item;
			} else if(item.type == "Suit") {
				this.equipment.Suit = item;
			}
			else {
				this.equipment.Accessory = item;
			}
			this.def += parseInt(item.value);
			setDefStat(this.def);
			if(playSound === undefined) {
				createSound(EQUIP_CLOTHING, false);
			}
		}
		
		repopInv(this);
		
		if(this.mapX !== undefined) {
			saveGame(this);
		}
	}
	
	/* Removes an equipped item from player's equipment 
	 * type: item type or 'true' for user prompt.
	 */
	async unequip(type) {
		if(type == true) {
			var persist = toggleWindow("equipment", null, true);
			await sleep(100);
			var typeNum = await this.itemSelection("equipment");
			if(!persist) {
				toggleWindow("equipment");
			}
			// Illegal selection. Nothing to do here.
			if (!typeNum)
				return;
			switch (typeNum) {
				case 1:
					type = "Weapon";
					this.equipment.Weapon = null;
					break;
				case 2:
					type = "Mask";
					this.equipment.Mask = null;
					break;
				case 3:
					type = "Suit";
					this.equipment.Suit = null;
					break;
				case 4:
					type = "Accessory";
					this.equipment.Accessory = null;
					break;
				default:
					return;
			}
		}
		var item;
		this.inventory.forEach(function(invItem) {
			if(invItem.type == type && invItem.isEquipped) {
				item = invItem;
			}
		});
		
		if(item) {
			
			item.isEquipped = false;
			if(item.type == "Weapon") {
				createSound(EQUIP_WEAPON, false);
				this.dmg -= parseInt(item.value);
				setDmgStat(this.dmg);
				setWeaponSlot("Hands (0)");
			} else {
				createSound(EQUIP_CLOTHING, false);
				this.def -= parseInt(item.value);
				setDefStat(this.def);
				if(item.type == "Mask") {
					setMaskSlot("");
				} else if(item.type == "Suit") {
					setSuitSlot("");
				} else {
					setAccessorySlot("");
				}
			}
			repopInv(this);
			saveGame(this);
		}
	}
	
	/* Prompts the player for an item number and drops the item. */
	async drop() {
		var persist = toggleWindow("inventory", this, true);
		var itemSel = await this.itemSelection("inventory");
		if(!persist) {
			toggleWindow("inventory", this);
		}
		// Check for ilegal item selection.
		if (!itemSel)
			return;
		var item = this.getInventory()[itemSel-1];
		if(item.isEquipped) {
			printToLog("This item is currently equipped, remove it to drop.");
			return;
		}
		const biDigX = getTwoDigits(this.xPos);
		const biDigY = getTwoDigits(this.yPos);
		setItemsOntoCell("c" + biDigY + biDigX, [item]);
		printToLog("You dropped " + item.name + " on the ground.");
		this.getInventory().splice(itemSel-1, 1);
		repopInv(this);
		saveGame(this);
	}
	
	/* Prompts the player for a direction and if there's an NPC in that direction attacks it */
	attack(direction) {
		var target;
		var xPos = this.xPos;
		var yPos = this.yPos;
		if(direction === undefined) {
			promptDirection("attack");
		} else {
			var cell = this.getCellFromDirection(direction);
			var weapon = this.equipment.Weapon;
			var weaponType = "Melee";
			if(weapon != null) {
				weaponType = weapon.weaponType;
			}
			// Check if player has a ranged weapon equipped.
			if(weaponType == "Ranged") {
				if(!this.inInv(weapon.projectile, 1)) {
						printToLog("You are out of " + weapon.projectile + ".");
						return;
				} else {
					var projectile = this.getInvItem(weapon.projectile);
					projectile.value = projectile.value - 1;
					repopInv(this);
				}
				for(i = 1; i <= RANGED_ATTACK; i++) {
					if(parseInt(cell.slice(3)) > xPos) {
						var biDigChkX = getTwoDigits(xPos + i);
						var biDigChkY = cell.slice(1,3);
					} else if(parseInt(cell.slice(3)) < xPos) {
						var biDigChkX = getTwoDigits(xPos - i);
						var biDigChkY = cell.slice(1,3);
					} else if(parseInt(cell.slice(1, 3)) > yPos) {
						var biDigChkX = cell.slice(3);
						var biDigChkY = getTwoDigits(yPos + i);
					} else if(parseInt(cell.slice(1, 3)) < yPos) {
						var biDigChkX = cell.slice(3);
						var biDigChkY = getTwoDigits(yPos - i);
					}
					// Check for the closest NPC. If cell is unwalkable - return because projectile is stopped.
					if(!inBounds("c"+biDigChkY+biDigChkX)) {
						break;
					}
					for(var npc = 0; npc < npcs.length; npc++) {
						var biDigTgtX = getTwoDigits(npcs[npc].xPos);
						var biDigTgtY = getTwoDigits(npcs[npc].yPos);
						if("c"+biDigChkY+biDigChkX == "c"+biDigTgtY+biDigTgtX) {
							target = npcs[npc];
							break;
						}
					}
					if(target === undefined && document.getElementById("c"+biDigChkY+biDigChkX).getAttribute("walkable") == "false") {
						if(getItemsInCell("c"+biDigChkY+biDigChkX).length == 0) {
							printToLog("Your " + projectile.name + " hit something and broke.");
							return;
						}
					}
					if(target === undefined && i == RANGED_ATTACK) {
						let fallenProj = new Item(projectile.name);
						fallenProj.value = 1;
						setItemsOntoCell("c"+biDigChkY+biDigChkX, [fallenProj]);
					}
				}
			}
			// Weapon is melee.
			
			for(var npc = 0; npc < npcs.length; npc++) {
				var biDigTgtX = getTwoDigits(npcs[npc].xPos);
				var biDigTgtY = getTwoDigits(npcs[npc].yPos);
				if(cell == ("c" + biDigTgtY + biDigTgtX)) {
					target = npcs[npc];
				}
			}
			if(target != undefined) {
				target.getHit(this.dmg);
				var punch = new sound(PUNCH);
				punch.loop(false);
				punch.play();
				printToLog("You attack the " + target.type.toLowerCase() + ".");
				// Increase player xp when attacking.
				if(target.health <= 0) {
					this.xp += XP_MULTIPLIER * XP_TURN + target.getXpBonus;
				} else {
					this.xp += XP_MULTIPLIER * XP_TURN;
				}
				setXpStat(this.xp);
			} else {
				printToLog("You attack the air next to you. The air is oblivious.");
			}
			incrementTurnCounter(this);
		}
	}
	
	/*
	*  The tragic event of the player's health reaching zero.
	*  cause: string. The reason why the player died.
	*/
	async die(cause) {
		this.isAlive = false;
		// Disable player movement. The syntax could be improved with JQuery.
		document.body.onkeydown = null;
		await sleep(700);
		var sadTrombone = new sound(SAD_TROMBONE);
		sadTrombone.loop(false);
		sadTrombone.play();
		const turn = document.getElementById("turn-value").innerText;
		let image = document.getElementById(this.getImage());
		document.getElementById("log").style.display = "none";
		document.getElementById("stats").style.display = "none";
		document.getElementById("extended-stats").style.display = "none";
		[...document.getElementsByClassName("right-window")].concat(
			[...document.getElementsByClassName("left-window")]
		).forEach(
			element => element.style.display = "none"
		);
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
	get status() {
		return this.pStatus;
	}
	set hungerVal(newHunger) {
		this.hunger = newHunger;
	}
	set incHunger(addHunger) {
		// Check if the player is overcoming malnourishment.
		if (this.hunger <= 0 && this.hunger + addHunger > 0) {
			this.pStatus = PLAYER_STATUS.HEALTHY;
			setStatusStat(this.pStatus);
		}
		this.hunger += addHunger;
	}
	// Increase player health without exceeding max possible health.
	set incHealth(addHp) {
		MAX_HP - this.hp >= addHp ? this.hp += addHp : this.hp += MAX_HP - this.hp;
		setHpStat(this.hp);
	}
	// Decrease player health by 'value'. If health becomes non-positive kill the player and show cause.
	decHealth(value, cause) {
		this.health = this.health - value;
		setHpStat(this.hp);
		if(this.health <= 0) {
			this.die(cause);
		}
	}
	set status(newStatus) {
		this.pStatus = newStatus;
	}
	// Updates the player's level according to the xp.
	updateLevel() {
		if(this.xp >= this.lvl * 1000 - XP_TURN) {
			this.xp -= this.lvl * 1000;
			this.lvl++;
			this.dmg += this.lvl * 5;
			setXpStat(this.xp);
			setLvlStat(this.lvl);
			setDmgStat(this.dmg);
			repopInv(this);
			printToLog("You are now level " + this.lvl + ".");
		}
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
		var npcString = NPC_LIST[type].split(";");
		this.tile = npcString[0];
		this.hurt = new sound(npcString[1]);
		this.hurt.loop(false);
		this.hp = npcString[2];
		this.dmg = npcString[3];
		this.xpBonus = parseInt(npcString[4]);
		this.friendStatus = status;
		// Item list dropped when the NPC gets killed.
		this.dropLi = [new Item("Meat"), new Item("Bones")];
		this.draw(x, y);
		this.currMap = currMap;
	}
	
	get getXpBonus() {
		return this.xpBonus;
	}
	
	get status() {
		return this.friendStatus;
	}

	get dropList() {
		return this.dropLi;
	}
	set dropList(newList) {
		this.dropLi = newList;
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
		let xDest, yDest;
		
		if(player.mapX+","+player.mapY != this.currMap) {
			let currMapX = this.currMap.split(",")[0];
			let currMapY = this.currMap.split(",")[1];
			// The map distance between the player and the NPC.
			let mapXOffset = player.mapX - currMapX;
			let mapYOffset = player.mapY - currMapY;
			let mapOffset = Math.abs(mapXOffset + mapYOffset);

			// If the map distance is 1 follow player to his map.
			if(mapOffset == 1) {
				// Check the direction to go.
				if(Math.abs(mapXOffset) == 1) {
					xDest = this.x + mapXOffset;
					yDest = this.y;
				} else if(Math.abs(mapYOffset) == 1) {
					xDest = this.x;
					yDest = this.y + mapYOffset;
				}
				
				let biDigXDest = getTwoDigits(xDest);
				let biDigYDest = getTwoDigits(yDest);
				
				// Check if still within map. 
				// If still in bounds - keep moving towards edge without drawing the NPC.
				// If reached the edge - place the NPC in the player's map in the suitable edge.
				if(!inBounds("c"+biDigYDest+biDigXDest)) {
					this.currMap = player.mapX+","+player.mapY;
					if(xDest >= WIDTH) {
						xDest = 0;
					} else if(yDest >= HEIGHT) {
						yDest = 0;
					} else if(xDest < 0) {
						xDest = WIDTH-1;
					} else if(yDest < 0) {
						yDest = HEIGHT-1;
					}
					this.moveChar(xDest, yDest, true);
					this.draw(this.x, this.y);
					return;
				} else {
					this.moveChar(xDest, yDest, true);
					return;
				}
			}
		}
		
		if(xDist < 2 && yDist < 2) {
			return;
		}
		if(player.xPos > this.x) {
			this.tile = this.tile.replace(this.type.toLowerCase() + "_l", this.type.toLowerCase() + "_r");
			if(xDist > yDist) {
				xDest = this.x + 1;
				yDest = this.y;
			} else {
				if(player.yPos > this.y) {
					xDest = this.x;
					yDest = this.y + 1;
				} else {
					xDest = this.x;
					yDest = this.y - 1;
				}
			}
		} else {
			this.tile = this.tile.replace(this.type.toLowerCase() + "_r", this.type.toLowerCase() + "_l");
			if(xDist > yDist) {
				xDest = this.x - 1;
				yDest = this.y;
			} else {
				if(player.yPos > this.y) {
					xDest = this.x;
					yDest = this.y + 1;
				} else {
					xDest = this.x;
					yDest = this.y - 1;
				}
			}
		}
		let biDigXDest = getTwoDigits(xDest);
		let biDigYDest = getTwoDigits(yDest);
		if(isWalkable("c" + biDigYDest + biDigXDest)) {
			this.moveChar(xDest, yDest);
			this.draw(this.x, this.y);
		} /*else {
			biDigXDest = getTwoDigits(xDest + 1);
			biDigYDest = getTwoDigits(yDest - 1);
			if(isWalkable("c" + biDigYDest + biDigXDest)) {
				xDest += 1;
				yDest -= 1;
				this.moveChar(xDest, yDest);
				this.draw(this.x, this.y);
				console.log("x="+xDest+" , y="+yDest);
				return;
			}
			biDigXDest = getTwoDigits(xDest - 1);
			biDigYDest = getTwoDigits(yDest + 1);
			if(isWalkable("c" + biDigYDest + biDigXDest)) {
				yDest += 1;
				this.moveChar(xDest, yDest);
				this.draw(this.x, this.y);
				console.log("x="+xDest+" , y="+yDest);
				return;
			}
		}
		console.log("x="+xDest+" , y="+yDest);*/		
	}
	
	/* If NPC is close enough to player, attacks player */
	attack(player) {
		let xDist = Math.abs(player.xPos - this.x);
		let yDist = Math.abs(player.yPos - this.y);
		if(xDist < 2 && yDist < 2) {
			player.getHit(this.dmg);
			if (player.health <= 0 && player.isAlive) {
				player.die(`Killed by ${this.type}`);
			}
			printToLog("The " + this.type.toLowerCase() + " attacks!");
			if (this.type === "Snake")
				this.applyPoison(player, 5)
		}
		return;
	}

	/* Poisons the player for the given duration in turns */
	applyPoison(player, duration) {
		player.pStatus = PLAYER_STATUS.POISONED;
		setStatusStat(player.pStatus);
		printToLog(STRINGS["poisoned"]);
		player.poisonCounter = POISON_PERIOD - duration;
	}
	
	/* Reduces dmg amount from NPC's hp and plays a grunting sound */
	getHit(dmg) {
		this.health = this.health - dmg;
		this.hurt.play();
	}
	
	/* When NPC's HP reaches zero, remove it from the game */
	die() {
		if(this.hp <= 0) {
			this.isAlive = false;
			var biDigCurX = getTwoDigits(this.x);
			var biDigCurY = getTwoDigits(this.y);
			removeTileOnTop("c"+biDigCurY+biDigCurX, true);
			npcs.splice(npcs.indexOf(this), 1);
			
			// Drop meat and bones
			setItemsOntoCell("c"+biDigCurY+biDigCurX, this.dropList);
			
			printToLog("The " + this.type.toLowerCase() + " is dead!");
			return true;
		}
		return false;
	}
	
}

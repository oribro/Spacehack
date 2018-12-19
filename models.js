/* Character traits */
const MAX_HP = 100;
const SPAWN_HP = 20;
const SPAWN_DMG = 5;

const NPC_LIST = {
				"Dogfish": T_DOGFISH_L + ";" + DOGFISH_WHINE + ";20;1"
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
		var item = createItemFromCell("c"+biDigCurY+biDigCurX);
		if(item) {
			removeTileOnTop("c"+biDigCurY+biDigCurX, false);
		} else {
		removeTileOnTop("c"+biDigCurY+biDigCurX, true);
		}
		
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
		this.dmg = SPAWN_DMG;
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
		if(this.health === 0 && this.hunger < 0){
			this.die("Staying hungry for too long");
		}

	}
	
	/* Reduces dmg amount from player's hp and plays a grunting sound */
	getHit(dmg) {
		this.health = this.health - dmg;
		document.getElementById("hp-value").innerHTML = this.health;
		
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
	
	/* Attempt to pickup items from a container */
	loot(cell) {
		if(getEnv(cell) == "container1") {
			var visibleContainer = false;
			var cellElement = document.getElementById(cell);
			var imgElements = cellElement.getElementsByTagName("img");
			Array.from(imgElements).forEach(function(img) {
				if(img.getAttribute("src") == T_CONTAINER)
					visibleContainer = true;
			});
			if(visibleContainer) {
				var containerOpen = createSound(CONTAINER_OPEN, false);
			}
			var container;
			let i;
			
			container = containers[cell];
			if (!container || container === undefined)
				alert("Programming Error. Details: Check env variable for container.");

			if (container.content.length === 0) {
				printToLog("The container is empty. Nothing to do here.");
				return;
			}
			var containerLength = container.content.length;
			
			let lootText;
			if(visibleContainer) {
				lootText = "These are the items inside the container:\n";
			} else {
				lootText = "There are several items here:\n";
			}
			for (let itemEntry of container.content.entries()) {
				let number = itemEntry[0];
				let item = itemEntry[1];
				lootText += number + 1 + ". " + item.name + " (" + 
				item.type + ", " + item.value + 
				")\n";
			}
			lootText += `\nPlease pick the item(s) you wish to take.\n` +
						`Enter item numbers seperated by comma (,)\n` +
						`or two numbers seperated by dash (-) for a range of items.\n` +
						`If you want to take all of them, enter the word: ALL\n` +
						`Examples of item choices:\n` + 
						`1,2,3\n` +
						`2-5\n` + 
						`ALL`;  
			let choice = prompt(lootText);

			// Check for legal input
			if (choice) {
				// Regex patterns to check if the user entered valid input.
				const individuals = /^[0-9]+(,[0-9]+)*$/;
				const range = /^[0-9]+-[0-9]+$/
				const all = "ALL";

				if (individuals.test(choice)) {

					let ilegalIndices = choice.split(",").filter(
						index => parseInt(index) < 1 || parseInt(index) > container.content.length

					);
					if (ilegalIndices.length > 0) {
						alert("Numbers are not in range. Please enter numbers from the specified list.");
						return null;
					}

					let result = choice.split(",").map(
						index => container.content[parseInt(index) - 1]
					);
					
					result.forEach(function(chosenItem) {
						container.popItem(chosenItem);
					});
					
					if(container.content.length == 0 && !visibleContainer) {
						while(containerLength != 0) {
							removeTileOnTop(cell, true);
							containerLength--;
						}
						delete containers[cell];
					}

					return result;
				}
				else if (range.test(choice)) {
					let [start, end] = choice.split("-");

					// Check for ilegal range
					if (parseInt(start) >= parseInt(end) || 
						parseInt(start) < 1 || 
						parseInt(end) > container.content.length
					) {
						alert("The range you've entered is invalid. " +
							"Please select numbers from the list and try again.");
						return null;
					}

					const chosenItems = container.content.slice(parseInt(start) - 1, parseInt(end));
					
					chosenItems.forEach(function(chosenItem) {
						container.popItem(chosenItem);
					});
					
					if(container.content.length == 0 && !visibleContainer) {
						while(containerLength != 0) {
							removeTileOnTop(cell, true);
							containerLength--;
						}
						delete containers[cell];
					}

					return chosenItems;
				}
				else if (choice === all) {
					var chosenItems = container.content;
					container.content = [];
					if(!visibleContainer) {
						while(containerLength != 0) {
								removeTileOnTop(cell, true);
								containerLength--;
						}
						delete containers[cell];
					}
					return chosenItems;
				}
				// No match -> ilegal input
				else {
					alert("Ilegal choice. Please follow the instructions and try again");
					return null;
				}

			}
		}
		else
			return null;
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

							if (item.isStackable) {
								this.inventory = itemStack(this.inventory, item);
								this.setInventory(this.inventory);
							}
							repopInv(this);
						}
						return;
					}

					// Try to loot a container.
					let loot = this.loot(cell);
					if (loot) {
						this.inventory = [...this.inventory, ...loot];

						loot.forEach(
							item => {
								if (item.isStackable) {
									this.inventory = itemStack(this.inventory, item);
									this.setInventory(this.inventory);
								}
							}
						)

						repopInv(this);
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
		printToLog("You dropped " + item.name + " on the ground.");
		this.getInventory().splice(itemSel-1, 1);
		repopInv(this);
	}
	
	/* Prompts the player for a direction and if there's an NPC in that direction attacks it */
	attack(direction) {
		var target;
		if(direction === undefined) {
			promptDirection("attack");
		} else {
			var cell = this.getCellFromDirection(direction);
			npcs.forEach(function(npc) {
				var biDigTgtX = getTwoDigits(npc.xPos);
				var biDigTgtY = getTwoDigits(npc.yPos);
				if(cell == ("c" + biDigTgtY + biDigTgtX)) {
					
					target = npc;
				}
			});
			if(target != undefined) {
				target.getHit(this.dmg);
				var punch = new sound(PUNCH);
				punch.loop(false);
				punch.play();
				printToLog("You attack the " + target.type.toLowerCase() + ".");
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
		var npcString = NPC_LIST[type].split(";");
		this.tile = npcString[0];
		this.hurt = new sound(npcString[1]);
		this.hurt.loop(false);
		this.hp = npcString[2];
		this.dmg = npcString[3];
		this.friendStatus = status;
		this.draw(x, y);
	}
	
	get status() {
		return this.friendStatus;
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
		if(xDist < 2 && yDist < 2) {
			return;
		}
		if(player.xPos > this.x) {
			this.tile = this.tile.replace(this.type.toLowerCase() + "_l", this.type.toLowerCase() + "_r");
			if(xDist > yDist) {
				xDest = this.x +1;
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
			if (player.health === 0) {
				player.die(`Killed by ${this.type}`);
			}
			printToLog("The " + this.type.toLowerCase() + " attacks!");
		}
		return;
	}
	
	/* Reduces dmg amount from NPC's hp and plays a grunting sound */
	getHit(dmg) {
		this.health = this.health - dmg;
		this.hurt.play();
	}
	
	/* When NPC's HP reaches zero, remove it from the game */
	die() {
		if(this.hp <= 0) {
			var biDigCurX = getTwoDigits(this.x);
			var biDigCurY = getTwoDigits(this.y);
			removeTileOnTop("c"+biDigCurY+biDigCurX, true);
			npcs.splice(npcs.indexOf(this), 1);
			
			// Drop meat and bones
			setItemOntoCell("c"+biDigCurY+biDigCurX, new Item("Meat"));
			setItemOntoCell("c"+biDigCurY+biDigCurX, new Item("Bones"));
			
			printToLog("The " + this.type.toLowerCase() + " is dead!");
			return true;
		}
		return false;
	}
	
}

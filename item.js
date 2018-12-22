// Constant item values.
const DEFAULT_COINS_VALUE = 10;
const DEFAULT_RATION_VALUE = 100;
const DEFAULT_FIRSTAID_VALUE = 10;
const DEFAULT_MEAT_VALUE = 50;

// Constant slots for item properties.
const NAME_SLOT = 0;
const TYPE_SLOT = 1;
const VALUE_SLOT = 2;
const STACKABLE_SLOT = 3;
const LVL_SLOT = 4;
const TILE_SLOT = 5;

// Other constants.
const SINGLE_ITEM_INDEX = 1;

// Item list. 
const ITEMS = {
		"Ration": `Ration;Food;${DEFAULT_RATION_VALUE};false;0;T_RATION`,
		"Coins":  `Coins;Currency;${DEFAULT_COINS_VALUE};true;0;T_COINS`,
		"Bucket": `Bucket;Utility;Empty;false;0;T_BUCKET`,
		"FirstAid": `FirstAid;Health;${DEFAULT_FIRSTAID_VALUE};true;0;T_FIRSTAID`,
		"Meat": `Meat;Food;${DEFAULT_MEAT_VALUE};true;0;T_MEAT`,
		"Bones": `Bones;Weapon;5;false;1;T_BONES`,
		"Std. Mask": `Std. Mask;Mask;3;false;1;T_STD_MASK`,
		"Std. Suit": `Std. Suit;Suit;7;false;1;T_STD_SUIT`
	};

// Object containing containers found in game identified by their unique cell.
var containers = {};

/*
 *	Class for game items.
 */
class Item {
	
	/* Constructor for Item.
	 * Default construction should be with using only the name of the item from ITEMS as argument.
	 */
	constructor(name, type, value) {
		if(type === undefined) {
			const itemProperties = ITEMS[name].split(";");

			this.itemName = itemProperties[NAME_SLOT];
			this.itemType = itemProperties[TYPE_SLOT];
			// Check if the value is a number as a string and convert if true.
			isNaN(itemProperties[VALUE_SLOT]) ? 
				this.itemValue = itemProperties[VALUE_SLOT] : 
				this.itemValue = parseInt(itemProperties[VALUE_SLOT]);
			this.itemLvl = parseInt(itemProperties[LVL_SLOT]);
			this.itemTile = eval(itemProperties[TILE_SLOT]);
			this.itemDescription = STRINGS[`examine_${name.toLowerCase()}`];
			// This is a good way to convert string to boolean in JS.
			this.isItemStackable = itemProperties[STACKABLE_SLOT] === "true";
			this.equipped = false;

		/* TODO: This should be deprecated soon */
		} else {
			this.itemName = name;
			this.itemType = type;
			this.itemValue = value;
			this.itemTile = eval("T_" + name.toUpperCase());
			this.itemDescription = STRINGS[`examine_${name.toLowerCase()}`];
		}
	}
	
	get name() {
		return this.itemName;
	}
	get type() {
		return this.itemType;
	}
	get value() {
		return this.itemValue;
	}
	get tile() {
		return this.itemTile;
	}
	get description() {
		return this.itemDescription;
	}
	get isStackable() {
		return this.isItemStackable;
	}
	get isEquipped() {
		return this.equipped;
	}
	get lvl() {
		return this.itemLvl;
	}
	set name(newName) {
		this.itemName = newName;
	}
	set type(newType) {
		this.itemType = newType;
	}
	set value(newValue) {
		this.itemValue = newValue;
	}
	set description(newDescription) {
		this.description = newDescription;
	}
	set isStackable(stackable) {
		this.isItemStackable = stackable;
	}
	set isEquipped(equipped) {
		this.equipped = equipped;
	}
	set lvl(newLvl) {
		this.itemLvl = newLvl; 
	}
	

	/* Returns a string representation of the item similar to ITEMS values */
	toString() {
		return `${this.name};${this.type};${this.value};${this.isStackable};${this.lvl}`;
	}
}

/* Class for item containers. Containers should be constructed inside the containers object. */
class Container {
	/* A container is constructed by a list of items and a visibility indicator:
	A visible container is shown on the map as a box-like object
	while invisible container provides the same logic but is not shown. An example would be
	multiple items grouped on a tile following the death of an enemy. */
	constructor(itemList, cell, visible) {
		this.itemList = itemList;
		this.cellString = cell;
		if(visible == true) {
			setTileOnTop(this.cellString, T_CONTAINER, "false");
			setEnv(this.cellString, T_CONTAINER);
		} else {
			setEnv(this.cellString, T_CONTAINER2);
		}
	}
	get content() {
		return this.itemList;
	}
	get cell() {
		return this.cellString;
	}
	set content(newItemList) {
		this.itemList = newItemList;
	}

	// Takes an item name and returns an item object if it's in the container.
	item(itemName) {
		Array.find(function(item) {
			return item.name == itemName;
		});
	}
	// Takes an item object and removes this item from the container.
	// The item is identified by it's unique index to avoid confusion with
	// cases where there are multiple unstackable items with the same name.
	popItem(itemIndex) {
		this.itemList.splice(itemIndex, 1);
	}
	
	// Takes an item object and pushes it into the container.
	pushItem(contItem) {
		this.itemList.push(contItem);
	}
}

/* Holds the item passed to utilItem while prompting direction */
var itemHolder;

/* Handles the use of utility items */
function utilItem(item, player, direction) {
	switch (item.name) {
		case "Bucket":
			if(direction === undefined) {
				itemHolder = item;
				promptDirection("utilItem");
			} else {
				var cell = player.getCellFromDirection(direction);
				var cellElement = document.getElementById(cell);
				var env = cellElement.getAttribute("env");
				/* Sound of water splashing */
				var waterSplash = new sound(WATER_SPLASH);
				// Only one water splash per bucket pour.
				waterSplash.loop(false);

				if(env == "beach1" && item.value == "Empty") {
					printToLog("You fill the bucket with water.");
					item.value = "Water";
					repopInv(player);
				} else if(env == "beach1" && item.value != "Empty") {
					printToLog("\"But my bucket is already full!\"");
				} else if(env != "beach1" && env != "fire1" && item.value != "Empty") {
					printToLog("You pour all the " + item.value.toLowerCase() + " on the ground. Bucket is now empty.");
					waterSplash.play();
					item.value = "Empty";
					repopInv(player);
				} else if(env == "fire1" && item.value == "Water") {
					printToLog("You pour the water on the fire and it dies out. \"One step closer to getting home.\"");
					waterSplash.play();
					var cell = player.getCellFromDirection(direction);
					var fireElements = document.getElementsByClassName("fire");
					Array.prototype.forEach.call(fireElements, element => {
						element.parentNode.removeChild(element)
					});
					fireElements = document.getElementsByClassName("fire");
					fireElements[0].parentNode.removeChild(fireElements[0]);
					fireSound.stop();
					setEnv("c0604", T_SHIP5);
					setEnv("c0705", T_SHIP6);
					setEnv("c0805", T_SHIP7);					
					item.value = "Empty";
					repopInv(player);
					plot++;
				} else {
					printToLog("\"How can I use the bucket with that?\"");
				}
			}
	}
}

/* If given item is stackable, stacks all items in the inventory of the given item into one pile of items.
*  Return the inventory with all items that are similar to the given item stacked as one item.
*/
function itemStack(inventory, sampleItem) {
	if(isNaN(sampleItem.value)) {
		return inventory;
	}
	return inventory.filter(
		item => item.name !== sampleItem.name
	).concat(
		new Item(
			sampleItem.name,
			sampleItem.type,
			inventory.filter(
				item => item.name === sampleItem.name
			).map(
				item => parseInt(item.value)
			).reduce(
				(val1, val2) => val1 + val2,
				0
			)
		)
	);
}

/* Spawns a game item at the given cell with the given item parameters.
*  cell: string. The DOM element that contains the cell.
*  tile: string. Path to the image that represents the tile.
*  item: string. Item string representation.
*/
function spawnItem(cell, tile, item) {
	// Spawn item image
	setTileOnTop(cell, tile, "false");
	let tileOnTop = document.getElementById(cell).lastElementChild;
	tileOnTop.setAttribute("item", item);
}

/*
*  Creates the game item objects from the list of item indices specified by itemIndices.
*  Each item has a corresponding string in one of the cell's children assuming such a string is found.
*  itemIndices: array. Each index is a number between 1 and numItems.
*/
function createItemsFromCell(cell, itemIndices) {
	// Get list of item element nodes piled on top of each other in the cell.
	let itemElements = getItemsInCell(cell);

	// No items in the cell: Nothing to do here.
	if (itemElements.length === 0)
		return null;
	
	let items = [];
	// Create an item object for each item index given.
	itemIndices.forEach(
		index => {
			let item = itemElements[parseInt(index) - 1].getAttribute("item");
			if (!item) {
				alert("Programming Error. Details: Check correlation "+
					"between indices and item nodes");
				return null;
			}
			let itemProperties = item.split(";");
			let name = itemProperties[NAME_SLOT];
			let value = itemProperties[VALUE_SLOT];
			item = new Item(name);
			item.value = value;
			items.push(item);
		}
	)
	return items;
}

/* Sets the given item list specified by items on the given cell.
*	For each item, a string will be injected into a cell's child.
*/
function setItemsOntoCell(cell, items) {
	let cellElement = document.getElementById(cell);

	items.forEach(
		item => {
			setTileOnTop(cell, item.tile, "false");
			let tileOnTop = cellElement.lastElementChild;
			tileOnTop.setAttribute("item", item.toString());
		}
	)
}

/* Removes items from the given cell according to the given item indices 
*  itemIndices: array. Each index is a number between 1 and numItems.
*/
function removeItemsFromCell(cell, itemIndices) {
	// Get list of item element nodes piled on top of each other in the cell.
	let cellElement = document.getElementById(cell);
	let itemElements = getItemsInCell(cell);

	// For each item to remove, remove it from the DOM as well as from itemElements. 
	// The algorithm iterates the item elements in reverse order because
	// of the way the DOM works when removing children: when a child gets removed,
	// the children that come after will be assigned their original index minus 1.
	for (let i = itemIndices.length - 1; i >= 0; i--) {
		let chosenIndex = itemIndices[i] - 1;
		cellElement.removeChild(itemElements[chosenIndex]);
		itemElements.splice(chosenIndex, 1);
	}
	
	// No items left to block movement => set the cell as walkable.
	if (itemElements.length === 0) {
		cellElement.setAttribute("walkable", "true");
		setEnv(cell, cellElement.firstElementChild.getAttribute("src"));
	}
}

/*
*	Function for retrieving the items in a given game cell.
*	Returns an Array of DOM elements that contain game items. 
*/
function getItemsInCell(cell) {
	let cellElement = document.getElementById(cell);

	return [...cellElement.children].filter(
		childElement => childElement.hasAttribute("item")
	);
}

/*
*  On encounter of multiple items choice, ask the player
*  which items he would like to choose from the given item list.
*/
function promptMultItemsChoice(cell, itemList) {
	let lootText = "There are several items here:\n\n";
	
	for (let itemEntry of itemList.entries()) {
		let [number, item] = [...itemEntry]; 
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

	return prompt(lootText);
}

/*
*  Validate player input following promptMultItemsChoice.
*  Returns the choice method the user entered as a string,
*  or empty string if the validation failed.
*  Choice method is one of:
*  1. Individual Numbers seperated by comma (,)
*  2. Range of numbers sperated by dash (-)
*  3. All items, denoted by ALL.
*/
function validateMultItemsChoice(choice, itemList) {
	// Check for legal input
	if (choice) {
		// Regex patterns to check if the user entered valid input.
		const individuals = /^[0-9]+(,[0-9]+)*$/;
		const range = /^[0-9]+-[0-9]+$/
		const all = "ALL";

		if (individuals.test(choice)) {

			let ilegalIndices = choice.split(",").filter(
				index => parseInt(index) < 1 || parseInt(index) > itemList.length
			);
			if (ilegalIndices.length > 0) {
				alert("Numbers are not in range. Please enter numbers from the specified list.");
				return "";
			}

			return CHOICE.INDIVIDUALS;
		}
		else if (range.test(choice)) {
			let [start, end] = choice.split("-");

			// Check for ilegal range
			if (parseInt(start) >= parseInt(end) || 
				parseInt(start) < 1 || 
				parseInt(end) > itemList.length
			) {
				alert("The range you've entered is invalid. " +
					"Please select numbers from the list and try again.");
				return "";
			}

			return CHOICE.RANGE;
		}
		else if (choice === all) {
			return CHOICE.ALL;
		}
		// No match -> ilegal input
		else {
			alert("Ilegal choice. Please follow the instructions and try again");
			return "";
		}

	}
	// Player aborted the choice prompt process.
	else
		return "";
}

/* Return item indices from the user choice given the user method of choosing items 
*  The indices are returned as Number type.
*/
function getItemIndicesFromChoice(choice, method, numItems) {
	let itemIndices;

	switch (method) {
		case CHOICE.INDIVIDUALS:
			itemIndices = choice.split(',').map(
				index => parseInt(index)	
			);
			break;
		case CHOICE.RANGE:
			const [start, end] = choice.split('-');
			itemIndices = range(parseInt(start), parseInt(end));
			break;
		case CHOICE.ALL:
			itemIndices = range(1, numItems);
			break;
	}

	return itemIndices;
}
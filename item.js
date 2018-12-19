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

// Item list. 
const ITEMS = {
		"Ration": `Ration;Food;${DEFAULT_RATION_VALUE};false`,
		"Coins":  `Coins;Currency;${DEFAULT_COINS_VALUE};true`,
		"Bucket": `Bucket;Utility;Empty;false`,
		"FirstAid": `FirstAid;Health;${DEFAULT_FIRSTAID_VALUE};true`,
		"Meat": `Meat;Food;${DEFAULT_MEAT_VALUE};true`,
		"Bones": `Bones;Weapon;1;false`
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

			this.itemTile = eval("T_" + this.itemName.toUpperCase());
			this.itemDescription = STRINGS[`examine_${name.toLowerCase()}`];
			// This is a good way to convert string to boolean in JS.
			this.isItemStackable = itemProperties[STACKABLE_SLOT] === "true";

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

	/* Returns a string representation of the item similar to ITEMS values */
	toString() {
		return `${this.name};${this.type};${this.value};${this.isStackable}`;
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
		this.cellString = cell
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
	popItem(contItem) {
		let item = contItem;
		this.itemList.splice(this.itemList.indexOf(item), 1);
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
	document.getElementById(cell).setAttribute("item", item);
}

/*
*  Creates a game item object from the string in the cell assuming such
*  a string is found.
*/
function createItemFromCell(cell) {
	cellElement = document.getElementById(cell);
	if (cellElement.hasAttribute("item")) {
		let item = cellElement.getAttribute("item");
		let itemProperties = item.split(";");
		// let itemNameLastIndex = item.indexOf(";");
		// let name = item.slice(0, itemNameLastIndex);
		let name = itemProperties[NAME_SLOT];
		// let itemValueFirstIndex = item.lastIndexOf(";") + 1;
		let value = itemProperties[VALUE_SLOT];
		item = new Item(name);
		// Update item value with the value from the cell.
		// TODO: Constructor for name and value maybe?
		item.value = value;
		return item;
	}
	return null;
}

/* Sets the given item on the given cell */
function setItemOntoCell(cell, item) {
	setTileOnTop(cell, item.tile, "false");
	let cellElement = document.getElementById(cell);
	var cellContainer;

	if(!cellElement.hasAttribute("item")) {
		cellElement.setAttribute("item", item.toString());
	} else if (!containers.hasOwnProperty(cell)) {
		var firstItem = createItemFromCell(cell);
		cellElement.removeAttribute("item");
		containers[cell] = new Container([firstItem, item], cell, false);
	} else {
		cellContainer.push(item);
	}
}

/* Removes item from the given cell if item exists, otherwise nothing happens. */
function removeItemFromCell(cell) {
	let cellElement = document.getElementById(cell);
	if (cellElement.hasAttribute("item")) {
		cellElement.removeAttribute("item");
		removeTileOnTop(cell);
		cellElement.setAttribute("walkable", "true");
	}
}

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
		return `${this.name};${this.type};${this.value}${this.isStackable}`;
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
		}
		setEnv(this.cellString, T_CONTAINER);
		
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
					setEnv("c0604", "ship5");
					setEnv("c0705", "ship6");
					setEnv("c0805", "ship7");					
					item.value = "Empty";
					repopInv(player);
					plot++;
				} else {
					printToLog("\"How can I use the bucket with that?\"");
				}
			}
	}
}


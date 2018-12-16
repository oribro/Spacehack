// Constant item values.
const DEFAULT_COINS_VALUE = 10;
const DEFAULT_RATION_VALUE = 100;
const DEFAULT_FIRSTAID_VALUE = 10;

// Item list. 
const ITEMS = {
		"Ration": `Ration;Food;${DEFAULT_RATION_VALUE}`,
		"Coins":  `Coins;Currency;${DEFAULT_COINS_VALUE}`,
		"Bucket": `Bucket;Utility;Empty`,
		"FirstAid": `FirstAid;Health;${DEFAULT_FIRSTAID_VALUE}`
	};
	
var containers = [];

/*
 *	Class for game items.
 */
class Item {
	
	/* Constructor for Item.
	 * Default construction should be with using only the name of the item from ITEMS as argument.
	 */
	constructor(name, type, value) {
		if(type === undefined) {
			var itemNameLastIndex = ITEMS[name].indexOf(";");
			var itemTypeFirstIndex = ITEMS[name].indexOf(";") + 1;
			var itemTypeLastIndex = ITEMS[name].lastIndexOf(";");
			var itemValueFirstIndex = ITEMS[name].lastIndexOf(";") + 1;

			this.itemName = ITEMS[name].slice(0, itemNameLastIndex);
			this.itemType = ITEMS[name].slice(itemTypeFirstIndex, itemTypeLastIndex);
			if(isNaN(ITEMS[name].slice(itemValueFirstIndex))) {
				this.itemValue = ITEMS[name].slice(itemValueFirstIndex);
			} else {
				this.itemValue = parseInt(ITEMS[name].slice(itemValueFirstIndex));
			}
			this.itemTile = eval("T_" + ITEMS[name].slice(0, itemNameLastIndex).toUpperCase());
			this.itemDescription = STRINGS[`examine_${name.toLowerCase()}`];

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

	/* Returns a string representation of the item similar to ITEMS values */
	toString() {
		return `${this.name};${this.type};${this.value}`;
	}
}

/* Class for item containers. Containers should be constructed inside the containers[] array. */
class Container {
	/* A container is constructed by a list of items and a cell where the container will spawn */
	constructor(itemList, cell) {
		this.itemList = itemList;
		this.cellString = cell
		setTileOnTop(this.cellString, T_CONTAINER, "false");
		setEnv(this.cellString, T_CONTAINER);
	}
	get content() {
		return this.itemList;
	}
	get cell() {
		return this.cellString;
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
				} else {
					printToLog("\"How can I use the bucket with that?\"");
				}
			}
	}
}


// Constant item values.
const DEFAULT_COINS_VALUE = 10;
const DEFAULT_RATION_VALUE = 100;

// Item list. 
const ITEMS = {
		"Ration": `Ration;Food;${DEFAULT_RATION_VALUE}`,
		"Coins":  `Coins;Currency;${DEFAULT_COINS_VALUE}`
	};

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
			this.itemValue = ITEMS[name].slice(itemValueFirstIndex);
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


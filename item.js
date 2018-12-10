/*
 *	Class for game items.
 */
class Item {
	constructor(name, type, value) {
		this.itemName = name;
		this.itemType = type;
		this.itemValue = value;
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
	set name(newName) {
		this.itemName = newName;
	}
	set type(newType) {
		this.itemType = newType;
	}
	set value(newValue) {
		this.itemValue = newValue;
	}

}
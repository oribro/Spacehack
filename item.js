/*
 *	Class for game items.
 */
class Item {
	constructor(name, type) {
		this.itemName = name;
		this.itemType = type;
	}
	
	get name() {
		return this.itemName;
	}
	get type() {
		return this.itemType;
	}
	set name(newName) {
		this.itemName = newName;
	}
	set type(newType) {
		this.itemType = newType;
	}
}
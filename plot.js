/* Class for organizing the plot system in a tree. */
class PlotNode {
	
	constructor(name, parent) {
		console.log(parent);
		this.name = name;
		this.parent = parent;
		this.completed = false;
	}
	
	get parentNode() {
		return this.parent;
	}
	
	get isCompleted() {
		return this.completed;
	}
	
	complete() {
		this.completed = true;
	}
}
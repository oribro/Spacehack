/* Class for organizing the plot system in a tree. */
class PlotNode {
	
	/* Constructor for class PlotNode.
	 * Takes a name (string) and a parent (parentNode object).
	 * PlotNodes are constructed as uncompleted.
	 */
	constructor(name, parent) {
		this.name = name;
		this.parent = parent;
		this.completed = false;
	}
	
	/* Returns the parent PlotNode object. */
	get parentNode() {
		return this.parent;
	}
	
	/* Returns the PlotNode completion status. */
	get isCompleted() {
		return this.completed;
	}
	
	/* Sets the PlotNode completion status to true. */
	complete() {
		this.completed = true;
	}
}
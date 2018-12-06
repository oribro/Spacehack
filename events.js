// This is the place to define event names.
const EVENT = {
	'WAKEUP': 'wakeup',
	'EXIT_SHIP': 'exit_ship',
	'EXAMINE_SHIP': 'examine_ship'
};

/*
* This class implements the Publish-Subscribe pattern in order
* to manage an event system for game events.
*/
class EventSystem{

	constructor(){
		// Object containing events and their coresponding callbacks
		// to be executed on publish.
		this.subscribers = {};
		// Explicit binding so we don't lose context of the methods.
		// Might not be required but just in case.
		this.subscribe = this.subscribe.bind(this);
		this.publish = this.publish.bind(this);
	}

	/*
	* Adds the event to the list of listening subscribers
	* along with the callback to be executed.
	* event: string. Name of the event
	* callback: function. The function to be executed when the event is called.
	*/
	subscribe(event, callback) {
		// Check if event exists, create if not.
		this.subscribers[event] = this.subscribers[event] || [];
		this.subscribers[event] = this.subscribers[event].concat([callback]);
	}

	/*
	* Calls the appropriate callback(s) for the given event
	* for the subscribers to notice.
	* event: string. Event name to dispatch.
	* args: array. List of arguments to call the callback function with.
	*/
	publish(event, ...args){
		if (this.subscribers && this.subscribers[event]){
			this.subscribers[event].forEach((callback) => {
				// TODO: functions should not be declared on the global scope (aka window).
				// We should make a Game class and declare there the callback
				// functions OR make them anonymous and declare inside subscribeGameEvents. 
				callback.apply(window, args);
			});
		}
	}
}


/*
* This is the place to register all possible game events.
* eventSys: EventSystem. The object that keeps track of the events.
*/
function subscribeGameEvents(eventSys) {
	eventSys.subscribe(EVENT.WAKEUP, promptContinue);
	eventSys.subscribe(EVENT.EXIT_SHIP, exitShip);
	eventSys.subscribe(EVENT.EXAMINE, examine);
}
/*
 *	strings.js file contains all the text for the game 
 */
const PLAYER_NAME = "Bob";
const PARTNER_NAME = "Annie";

/* Constants for player choice method on multiple choice prompt */
const CHOICE = {
	"INDIVIDUALS": "individuals",
	"RANGE": "range",
	"ALL": "all"
};

const STRINGS = {	
	"wakeup": "You wake up. \"Ughh my head... Are you ok?\"\n" +
	"...\n" +
	"\"" + PARTNER_NAME + "? " + PARTNER_NAME + "???\"",
	
	"exit_ship": "You turn your head around to the backseat where " + PARTNER_NAME + " was sitting a few seconds ago. There's a huge hole in the ship hull and there's no sign of her or her seat.\n" +
	"\"Ship must have broken apart while crashing. The dynamic crash protection system should have landed her safely though.\"",
	
	"examine_ship": "\"It's badly damaged. I should look for the missing parts. With some luck maybe I can fix it and get home. I should find " + PARTNER_NAME + " too.\"",
	
	"examine_debris": "\"Debris from the ship.\"",

	"examine_coins": "\"It's a pile of coins.\"",

	"examine_ration": "\"It should help me ease my hunger.\"",

	"examine_firstaid": "\"I can use it to heal my wounds.\"",	
	
	"examine_bucket": "\"A standard bucket. I can use it to carry liquids.\"",
	
	"examine_meat": "\"Meat from another world, what could go wrong if I eat it?\"",
	
	"examine_bones": "\"Bones. Could be useful.\"",
	
	"examine_ship_fire": "\"Ship caught fire. I should put it out.\"",
	
	"examine_vegetation": "\"Looks like vegetation. Means that this planet can support life. But are there complex life forms as well?\"",
	
	"examine_sand": "\"It's sand. what's more to say?",
	
	"examine_beach": "\"Ok so there's water on this planet, maybe life too?\"",
	
	"examine_water": "\"That looks deep.\"",
	
	"examine_ground": "\"The ground here is rocky.\"",
	
	"examine_tree1": "\"It's a tree that has green fruit.\"",
	
	"examine_tree2": "\"It's a tree that has red fruit. It stings all over my body standing next to it.\"",
	
	"examine_green fruit": "\"Looks like the fruit from the green trees.\"",
	
	"examine_red fruit": "\"Looks like the fruit from the red trees.\"",
	
	"examine_container": "\"It's the container from the ship! It must have fallen while we crashed. There should be useful things inside.\"",
	
	"examine_items": "There are several items here.",
	
	"examine_dogfish_r": "It's a creature with a head of a fish and body of a dog. It's a dogfish. It seems angry.",
	
	"examine_dogfish_l": "It's a creature with a head of a fish and body of a dog. It's a dogfish. It seems angry.",
	
	"examine_nothing": "\"There's nothing interesting around.\"",
	
	"hungry1": "You are getting hungry.",
	
	"hungry2": "You are very hungry.",
	
	"hungry3": "You are malnourished and are starting to lose health.",
	
	"use_err_msg": "Please enter a valid item number.",

	"not_implemented_err": "Oops. We are still working on this option.",
	
	"out_of_bounds": "There's literally nothing there.",

	"not_in_range": "The number you entered is not in range of existing item numbers.",

	"pickup_nothing": "There is nothing to pick up here.",

	"poisoned": "Yikes! You have become poisoned and are losing health."
	
};

const CONTINUE_PROMPT = "Press any key to continue...";
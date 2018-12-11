/*
 *	strings.js file contains all the text for the game 
 */
const PLAYER_NAME = "Bob";
const PARTNER_NAME = "Annie";

const STRINGS = {	
	"wakeup": "You wake up. \"Ughh my head... Are you ok?\"\n" +
	"...\n" +
	"\"" + PARTNER_NAME + "? " + PARTNER_NAME + "???\"",
	
	"exit_ship": "You turn your head around to the backseat where " + PARTNER_NAME + " was sitting a few seconds ago. There's a huge hole in the ship hull and there's no sign of her or her seat.\n" +
	"\"Ship must have broken apart while crashing. The dynamic crash protection system should have landed her safely though.\"",
	
	"examine_ship": "\"It's badly damaged. I should look for the missing parts. With some luck maybe I can fix it and get home. I should find " + PARTNER_NAME + " too.\"",
	
	"examine_debris": "\"Debris from the ship.\"",

	"examine_coins": "\"It's a pile of coins.\"",
	
	"examine_nothing": "\"There's nothing interesting around.\"",
	
	"hungry1": "You are getting hungry.",
	
	"hungry2": "You are very hungry.",
	
	"hungry3": "You are malnourished and are starting to lose health.",
	
	"use_err_msg": "Please enter a valid item number."
	
};

const CONTINUE_PROMPT = "Press any key to continue...";
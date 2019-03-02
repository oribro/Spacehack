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
	"wakeup1": "You wake up. \"Ughh my head... Are you ok?\"\n",

	"wakeup2": "...\n",

	"wakeup3": "\"" + PARTNER_NAME + "? " + PARTNER_NAME + "???\"",
	
	"exit_ship": "You turn your head around to the backseat where " + PARTNER_NAME + " was sitting a few seconds ago. There's a huge hole in the ship hull and there's no sign of her or her seat.\n" +
	"\"Ship must have broken apart while crashing. The dynamic crash protection system should have landed her safely though.\"",
	
	"examine_ship": "\"It's badly damaged. I should look for the missing parts. With some luck maybe I can fix it and get home. I should find " + PARTNER_NAME + " too.\"",
	
	"examine_debris": "\"Debris from the ship.\"",

	"examine_coins": "\"It's a pile of coins.\"",

	"examine_ration": "\"It should help me ease my hunger.\"",

	"examine_firstaid": "\"I can use it to heal my wounds.\"",	
	
	"examine_bucket": "\"A standard bucket. I can use it to carry liquids.\"",

	"examine_axe": "\"I can use it to cut trees.\"",

	"examine_pickaxe": "\"It should be good with rocks.\"",

	"examine_hammer": "\"A must-have tool for building things.\"",
	
	"examine_meat": "\"Meat from another world, what could go wrong if I eat it?\"",
	
	"examine_bones": "\"Bones. Could be useful.\"",

	"examine_wood": "\"The remains of what was once a tree.\"",

	"examine_rock": "\"A very solid material.\"",
	
	"examine_gravel": "\"Rock reduced to little stones.\"",

	"examine_metal": "\"It's probably not native to this planet. I wonder how it can be of use.\"",
	
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
	
	"examine_container": "\"It's a container from the ship! It must have fallen while we crashed. There should be useful things inside.\"",
	
	"examine_items": "There are several items here.",
	
	"examine_dogfish_r": "It's a creature with a head of a fish and body of a dog. It's a dogfish. It seems angry.",
	
	"examine_dogfish_l": "It's a creature with a head of a fish and body of a dog. It's a dogfish. It seems angry.",
	
	"examine_chick": "\"It's a little chick. Looks harmless from afar but that thing can bite...\"",
	
	"examine_triheadhumanoid": "\"It's a... man... with... three heads...\"",
	
	"examine_workbench": "\"I can build very useful equipment with this workbench.\"",
	
	"examine_bridge":  "\"This looks stable enough to walk on.\"",
	
	"examine_sign":  "\"It's a road sign! So there must be intelligent life on this planet. I can't read what it says but it points to the river, maybe there's something interesting on the other side?\"",

	"examine_babelfish": `The Babel fish is small, yellow, leech-like - and probably the oddest thing in the universe. 
	It feeds on brain wave energy, and if you stick one in your ear, you can instantly understand anything said to you in any form of language`,

	"examine_fishing rod": `I can use it to catch fish`,

	"examine_fishing_spot": `There are fish swimming in the water`,
	
	"examine_nothing": "\"There's nothing interesting around.\"",
	
	"hungry1": "You are getting hungry.",
	
	"hungry2": "You are very hungry.",
	
	"hungry3": "You are malnourished and are starting to lose health.",
	
	"use_err_msg": "Please enter a valid item number.",

	"not_implemented_err": "Oops. We are still working on this option.",
	
	"out_of_bounds": "There's literally nothing there.",

	"not_in_range": "The number you entered is not in range of existing item numbers.",

	"pickup_nothing": "There is nothing to pick up here.",

	"poisoned": "Yikes! You have become poisoned and are losing health.",
	
	"poisonous_tree": "You can sense that something about the nearby tree is not right. You are poisoned!",

	"poisonous_tree_withdrawal": "You have escaped the grasp of the toxic tree.",

	"talk_to_yourself": "You start a monologue with yourself. Unfortunately, no one is around to listen."

};

const CONTINUE_PROMPT = "Press any key to continue...";

async function talkToTriHeadHumanoid(player) {
	document.body.onkeydown = null;
	enableSkip(player);
	let accessory = document.getElementById("accessory-slot").innerHTML.split(" ")[0];
	if (accessory === "Babelfish") {
		if(PLOT.RETURN_WALLET.isCompleted) {
			await startFriendlyConversation(3);
		} else if(player.inInv("Wallet", 1)) {
			PLOT.RETURN_WALLET.complete();
			player.removeItemFromInventory("Wallet", 1);
			await startFriendlyConversation(2);
		} else {
			await startFriendlyConversation(1);
		}
	}
	else { 
		await startVagueConversation();
	}
	resumePlayerMovementAndCheckFireOnLoad(player);
	disableSkip();
}

function enableSkip(player) {
	document.body.onkeydown = function() {
		if (sleepNum) {
			clearTimeout(sleepNum);
		}
		resumePlayerMovementAndCheckFireOnLoad(player);
		disableSkip();
	}
	document.getElementById("cinematic-control-container").style.display = "block";
	document.getElementById("skip-cinematic").style.display = "block";
}

function disableSkip() {
	document.getElementById("cinematic-control-container").style.display = "none";
	document.getElementById("skip-cinematic").style.display = "none";
}

async function startFriendlyConversation(state) {
	switch (state) {
		case 1:
			printToLog("Head 1: \"Welcome back stranger. Are you going to just run away again?\"");
			await sleep(3000);
			printToLog("You: \"Hi. I'm sorry about before. I had to find a babelfish to be able to talk to you.\"");
			await sleep(4000);
			printToLog("Head 2: \"Who travels to a foreign planet without a babelfish?!\"");
			await sleep(4000);
			printToLog("Head 1: \"Don't be rude to our guest, Forgh. How can we help you sir?\"");
			await sleep(4000);
			printToLog("You: \"My ship crashed on the beach not far from here. My friend went missing. I need to fix the ship and find her so we could return home. Have you seen her maybe?\"");
			await sleep(5000);
			printToLog("Head 1: \"No, You're the first stranger I see today. How about you Forgh?\"");
			await sleep(4000);
			printToLog("Head 2: \"Nah. Maybe Raeibh saw something.\"");
			await sleep(3000);
			printToLog("Head 3: *Snoring*");
			await sleep(3000);
			printToLog("Head 1: \"I'm sorry we haven't seen anyone. You should try asking around in the city, you will also be able to find tools and parts to fix your ship there. You need the code to pass through the gate.\"");
			await sleep(6000);
			printToLog("You: \"What is the code?\"");
			await sleep(3000);
			printToLog("Head 1: \"We'll give you the code, but you need to help us with something first.\"");
			await sleep(4000);
			printToLog("You: \"Ok. What do you need?\"");
			await sleep(3000);
			printToLog("Head 2: \"Some big bird stole our wallet. It flew away and landed on a small island in the lake up the stream. We'd get it ourselves but Boiqf here is afraid of water.\"");
			await sleep(5000);
			printToLog("Head 1: \"*Sighs* Yes that's true. It should be easy for you though. Get our wallet back and we'll give you the code.\"");
			await sleep(4000);
			printToLog("You: \"Alright, sounds like a good deal. I'll be back.\"");
			break;
		case 2:
			printToLog("You: \"Here you go, I almost died to get this.\"");
			printToLog("You give the wallet to the three headed man.");
			await sleep(4000);
			printToLog("Head 1: \"Thank you so much. The code to the city gate is 8375.\"");
			await sleep(5000);
			printToLog("You: \"8375. Got it. Thanks.\"");
			break;
		case 3:
			printToLog("You: \"Hello again.\"");
			await sleep(3000);
			printToLog("Head 3: \"Do we know each other?\"");
			await sleep(3000);
			printToLog("Head 1: *Snoring*");
			await sleep(2000);
			printToLog("Head 2: *Snoring*");
			await sleep(2000);
			printToLog("You: \"Uhh... Nevermind.\"");
			break;
	}
}

async function startVagueConversation() {
	printToLog("Three headed man: \"blurghrlurghlurghrulgh ruhlgruh ruh...\"");
	await sleep(3000);
	printToLog("You: \"*Sigh* I guess talking to him will be of little use for me.\"");
	await sleep(4000);
	printToLog("You: \"Unless...\"");
	await sleep(4000);
	printToLog("You: \"Maybe I can find a way to translate this language.\"");
}
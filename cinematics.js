/*** cinematics.js 
   * File for game cinematics. Cinematics include CSS animations and sound.
 ***/

/* Plays the cinematic where the player wakes up and starts looking for his partner */ 
async function playGameIntro(player) {
	let eyelids = Array.from(document.getElementsByClassName("board-cover"));
	eyelids.forEach(
		eyelid => eyelid.style.display = "block"
	);
	printToLog(STRINGS["wakeup1"]);
	await sleep(3000);
	printToLog(STRINGS["wakeup2"]);
	await sleep(2000);
	printToLog(STRINGS["wakeup3"]);
	await sleep(2000);
	promptContinue(player);
}

/* Plays the cinematic where the player becomes fully awake and exits the ship*/
async function exitShip(player) {
	// Player becomes fully awake.
	let eyelids = document.getElementsByClassName("board-cover");
	for (let eyelid of eyelids) {
		eyelid.style.animationName = "open-wide";
		eyelid.style.animationDuration = "1.5s";
	}
	await sleep(1500);

	// Player exits ship.
	spawnPlayer(player);
	// Hide the Skip button as the cinematic finished.
	document.getElementById("skip-cinematic").style.display = "none";	
}

/* Introduce the player character to the planet as he exists the ship */
function spawnPlayer(player) {
	const playerPos = [player.xPos, player.yPos];
	player.draw(...playerPos);
	//log = log.slice(0, log.lastIndexOf("\n") - 1);
	printToLog(STRINGS[EVENT.EXIT_SHIP]);
	fireSound.play();
	document.body.onkeydown = function(event) {
		control(event, player);
		// Check if the player is within a reasonable distance from the fire
		// such that he can still hear it burning.
		shouldFirePlay(fireSound, player, 5, 7);
	};
}

/* On button click, skips the current playing cinematic depends on the current plot */
function skipCinematic() {
	switch(plot) {
		case PLOT.INTRO:
			// Interrupt the sleep delay that the cinematic uses.
			if (sleepNum) {
				// This JS built-in function stops the sleep timeout from executing AND stops further
				// code execution inside the function the sleep was set in.
				clearTimeout(sleepNum);
				// Remove the covers aka show the board.
				let eyelids = Array.from(document.getElementsByClassName("board-cover"));
				eyelids.forEach(
					eyelid => {
						eyelid.style.display = "none";
					}
				);
				// Resume normal gameplay flow.
				player = new Player(6, 5);
				spawnPlayer(player);
			}
			break;
	}

	// Hide the Skip button after we skipped the cinematic.
	document.getElementById("skip-cinematic").style.display = "none";	
}


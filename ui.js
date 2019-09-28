/* Color codes */
const NORMAL_COLOR = "orange";
const LOW_HP_COLOR = "darkorange";
const CRIT_HP_COLOR = "darkred";
const POISONED_COLOR = "darkred";
const MALNUR_COLOR = "darkred";

const LOW_HP_UPPER_BOUND = 20;
const LOW_HP_LOWER_BOUND = 10;

/* Sets the player status stat to the given status. */
function setStatusStat(pStatus) {
    document.getElementById("status-value").innerHTML = pStatus;
    switch (pStatus) {
        case PLAYER_STATUS.HEALTHY:
            document.getElementById("status-value").style.color = NORMAL_COLOR;
            break;
        case PLAYER_STATUS.POISONED:
            document.getElementById("status-value").style.color = POISONED_COLOR;
            break;
        case PLAYER_STATUS.MALNOURISHED:
            document.getElementById("status-value").style.color = MALNUR_COLOR;
            break;
    }
}

/* Sets the player HP stat to the given value. */
function setHpStat(hp) {
    document.getElementById("hp-value").innerHTML = hp;
    if(hp >= LOW_HP_UPPER_BOUND) {
        document.getElementById("hp-value").style.color = NORMAL_COLOR;
    } else if(hp >= LOW_HP_LOWER_BOUND && hp < LOW_HP_UPPER_BOUND) {
        document.getElementById("hp-value").style.color = LOW_HP_COLOR;
    } else {
        document.getElementById("hp-value").style.color = CRIT_HP_COLOR;
    }
}

/* Sets the player XP stat to the given value. */
function setXpStat(xp) {
    document.getElementById("xp-value").innerHTML = xp;
}

/* Sets the player Lvl stat to the given value. */
function setLvlStat(lvl) {
    document.getElementById("lvl-value").innerHTML = lvl;
}

/* Sets the player Dmg stat to the given value. */
function setDmgStat(dmg) {
    document.getElementById("dmg-value").innerHTML = dmg;
}

/* Sets the player Def stat to the given value. */
function setDefStat(def) {
    document.getElementById("def-value").innerHTML = def;
}

/* Sets the player coordinates stat to the given coordinates. */
function setCoordsStat(mapX, xPos, mapY, yPos) {
    document.getElementById("coords-value").innerHTML = "(" + mapX + "," + xPos + " ; " + mapY + "," + yPos + ")";
}

function setTurnStat(turn) {
    document.getElementById("turn-value").innerHTML = turn;
}

/* Marks a ship part from the list as built. */
function markBuilt(partKey) {
    document.getElementById(partKey.toLowerCase()+"-reqs").parentNode.style.textDecorationLine = "line-through";
}

/* Sets a given weapon in the player weapon slot. */
function setWeaponSlot(weapon) {
    document.getElementById("weapon-slot").innerHTML = weapon;
}

/* Sets a given mask in the player mask slot. */
function setMaskSlot(mask) {
    document.getElementById("mask-slot").innerHTML = mask;
}

/* Sets a given suit in the player suit slot. */
function setSuitSlot(suit) {
    document.getElementById("suit-slot").innerHTML = suit;
}

/* Sets a given accessory in the player accessory slot. */
function setAccessorySlot(accessory) {
    document.getElementById("accessory-slot").innerHTML = accessory;
}

/* Hides any open left windows */
function hideLeftWindow() {
	var leftWindows = document.getElementsByClassName("left-window");
	Array.from(leftWindows).forEach(function (window) {
		window.style.display = "none";
	});
}

/* Shows/hides the given window.
 * name: string. The name of the window to toggle.
 * player: Optional. The player object.
 * force: Optional. If set opens the window even if it is already opened.
 * Returns true if window was open when called, false otherwise.
 */
function toggleWindow(name, player, force) {
    var window = document.getElementById(name);
    if(name == "world-map-wrapper") {
        if(window.style.visibility != "visible") {
            window.style.visibility = "visible";
        } else {
            window.style.visibility = "hidden";
        }
        return true;
    }
	if(window.style.display != "block") {
		if(name == "inventory") {
			repopInv(player);
		} else if (window.getAttribute("class") == "left-window") {
			hideLeftWindow();
		}
		window.style.display = "block";
		return false;
	} else if (force === undefined) {
		window.style.display = "none";
	}
	return true;
}

/* Repopulates the player inventory */
function repopInv(player) {
	var invElement = document.getElementById("inventory");
	
	// Removes old inventory list.
	var invLists = document.getElementsByClassName("inv-list");
	if(invLists.length > 0) {
		invElement.removeChild(invLists[0]);
	}

	// Creates new inventory list.
	var olElement = document.createElement("ol");
	olElement.setAttribute("class", "inv-list");
	invElement.appendChild(olElement);
	var inventory = player.getInventory();
	var i;
	for(i = 0; i < inventory.length; i++) {
		var liElement = document.createElement("li");
		var li = olElement.appendChild(liElement);
		li.setAttribute("id", "inv-item-"+i);
		let item = inventory[i];
		if(item.isEquipped) {
			li.style.color = "green";
		}
		if(!item.meetsReq(player)) {
			li.style.color = "red";
		}
		if(item.lvl != 0) {
			li.innerHTML =  item.name + " (" + item.type + ", " + item.value + ", Lvl " + item.lvl + ")";
		} else {
			li.innerHTML =  item.name + " (" + item.type + ", " + item.value + ")";
		}
	}
	
	// Checks whether player equips a ranged weapon and if so updates the equipment window to update the projectile amount.
	if(player.equipment.Weapon != null) {
		if(player.equipment.Weapon.weaponType == "Ranged") {
			updateEquipment(player.equipment.Weapon.name, player);
		}
	}
}

/* Takes an item name and sets its information in the relevant equipment slot */
function updateEquipment(name, player) {
	let type = ITEMS[name].split(";")[1];
	let value = ITEMS[name].split(";")[2];
	
	switch (type) {
		case "Weapon":
			var equipmentSlot = document.getElementById("weapon-slot");
			if(ITEMS[name].split(";")[WEAPON_TYPE_SLOT] == "Ranged") {
				let projectile = ITEMS[name].split(";")[PROJECTILE_SLOT];
				let projItem = player.getInvItem(projectile);
				let projValue = 0;
				if(projItem) {
					projValue = projItem.value;
				}
				equipmentSlot.innerHTML = name + " (" + value + "), " + projectile + ": " + projValue;
				return;
			}
			break;
		case "Mask":
			var equipmentSlot = document.getElementById("mask-slot");
			break;
		case "Suit":
			var equipmentSlot = document.getElementById("suit-slot");
			break;
		case "Accessory":
			var equipmentSlot = document.getElementById("accessory-slot");
			break;
	}
	equipmentSlot.innerHTML = name + " (" + value + ")";
}

/* Takes a requirements list (e.g.: PARTS_REQS) and populates the suitable window */
function popBuildList(reqList) {
	for(let [key, value] of Object.entries(reqList)) {
		var elementId = key.toLowerCase() + "-reqs";
		var metal = value.split(";")[0];
		var wood = value.split(";")[1];
		var gravel = value.split(";")[2];
		var reqString = "";
		if(metal != 0) {
			reqString += "Metal: " + metal;
		}
		if(wood != 0) {
			if(reqString != "") {
				reqString += "; ";
			}
			reqString += "Wood: " + wood;
		}
		if(gravel != 0) {
			if(reqString != "") {
				reqString += "; ";
			}
			reqString += "Gravel: " + gravel;
		}
		document.getElementById(elementId).innerHTML = reqString;
	}
}

/* Draws a progress bar underneath the log for the given period of time */ 
function showProgressBar(period) {
	const NUM_OF_INTERVALS = 100;
	var container = document.getElementById("cinematic-control-container");
	var bar = document.getElementById("conversation-progress-bar");
	container.style.display = "block";
	bar.style.display = "block";
  	var width = 0;
  	var id = setInterval(frame, period / NUM_OF_INTERVALS);
  	function frame() {
	    if (width >= 100) {
	      clearInterval(id);
	      container.style.display = "none";
		  bar.style.display = "none";
	    } else {
	      width++; 
	      bar.style.width = width + '%'; 
	    }
  	}
}

/* Prints messages that should be displayed on turn one */
function printTurnOneMsgs() {
    printToLog(`\"Crash site\" area has been added to your world map.`);
}
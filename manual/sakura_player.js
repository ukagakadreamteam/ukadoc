/// <reference types="jsstp" />
"use strict";

/** @type {typeof import("jsstp").jsstp} */
var jsstp;

//After the page has loaded, check ghost availability
document.addEventListener('DOMContentLoaded', () =>
	import("https://cdn.jsdelivr.net/gh/ukatech/jsstp-lib@v3.1.0.0/dist/jsstp.mjs")
		.then(m => (jsstp = m.jsstp).if_available(init_content).then(reload_button)).catch(e => e)
);
async function init_content() {
	document.getElementById("TargetGhost").style.display = "block";
	// Get all SakuraScript codes
	const sakuraScriptCodes = document.querySelectorAll("code[type='SakuraScript']");
	// Add a button to it that executes a SakuraScript when clicked
	sakuraScriptCodes.forEach(code => {
		const button = createExecutionButton(code.textContent);
		const parent = code.parentElement.parentElement;
		// If the parent has only one child element other than h1, then insert the button after h1
		if (parent.children.length == 2) {
			parent.insertBefore(button, parent.children[1]);
			//Eliminate line breaks in h1
			parent.children[0].style.display = "inline";
		}
		// Otherwise insert it before the code block
		else
			code.parentElement.insertBefore(button, code);
	});
}

function createExecutionButton(script) {
	const button = document.createElement("button");
	button.textContent = "Run";
	// Adding hover hints to buttons
	button.title = "Run SakuraScript";
	button.addEventListener("click", () => {
		jsstp.SEND({
			Event: "OnUkadocScriptExample",
			Reference0: script,
			Script: script,
			Option: "notranslate"
		});
	});
	return button;
}

function reload_button() {
	const list = document.getElementById("ghost_list_content");
	//Reload list
	jsstp.get_fmo_infos().then(async fmo => {
		//Backup current options (if any)
		let selected = list.value;
		//Empty the list
		list.options.length = 0;
		if (!fmo.available)
			throw new Error("get_fmo_infos failed");
		fmo.forEach((info, uuid) => list.options.add(new Option(info.name, uuid)));
		//Recheck the options based on the backup (if still in the list)
		if (fmo[selected])
			list.value = selected;
		else
			selected = list.value = list.options[0].value;
		jsstp = jsstp.by_fmo_info(fmo[selected]);
	}).catch(e => {
		console.error(e);
	});
}

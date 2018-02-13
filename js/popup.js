const ON_COLOR = "#2E7D32";
const OFF_COLOR = "#DD2C00";

const DEFAULT_DOMAIN_WHITELIST = ["google.com", "youtube.com"];

/* From https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string */
function extractHostname(url) {
	let hostname = url.indexOf("://") > -1 ?
		url.split('/')[2] :
		url.split('/')[0];

    hostname = hostname.split(':')[0];  /* Remove ports */
    hostname = hostname.split('?')[0];  /* Remove ? */

    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split("."),
        arrLen = splitArr.length;

	/* Extract root domain, if a subdomain exists */
    if (arrLen > 2) {
		/* Check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk") */
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        if (splitArr[arrLen - 1].length == 2 && splitArr[arrLen - 1].length == 2)
            domain = splitArr[arrLen - 3] + '.' + domain; /* This is using a ccTLD */
    }
    return domain;
}


/* Saves new settings to storage, and calls f if it exists */
function saveNewSettings(settings, f=null){
	for(let key of Object.keys(settings)){
		let obj = {[key]: settings[key]};
		chrome.storage.sync.set(obj, function(e){console.log(e);});
	}
	if(f) f();
}

/* Updates popup icon */
function redrawIcon(on){
	chrome.browserAction.setIcon({
		path: on ? "img/icon_active.png" : "img/icon_inactive.png"
	});
}

/* Updates the whitelist textareas */
function redrawWhitelists(){
	let query = { active: true, currentWindow: true };
	chrome.tabs.query(query, function(tabs){
		let current_tab = tabs[0];

		chrome.storage.sync.get(null, function(settings){
			/* Update textarea values */
			document.getElementById("whitelisted_pages_textarea").value =
				settings.whitelisted_pages.join("\n");
			document.getElementById("whitelisted_domains_textarea").value =
				settings.whitelisted_domains.join("\n");

			/* Update button values */
			document.getElementById("whitelist_page").innerHTML =
				settings.whitelisted_pages.includes(current_tab.url) ?
					"Remove current page from whitelist": "Whitelist current page";
			document.getElementById("whitelist_domain").innerHTML =
				settings.whitelisted_domains.includes(extractRootDomain(current_tab.url)) ?
					"Remove current domain from whitelist": "Whitelist current domain";
		});
	});
}


/* Sets up the UI with inital settings */
function loadInitalSettings(){
	/* Attempt to get the settings. If none exist, set
	 * some default values */
	chrome.storage.sync.get(null, function(settings){
		if(Object.keys(settings).length == 0){
			settings = {};
			settings.on = true;
			settings.whitelisted_pages = [];
			settings.whitelisted_domains = DEFAULT_DOMAIN_WHITELIST;

			settings.fast_mode = false;
			settings.run_at = "load_1";
			saveNewSettings(settings);
		}

		document.getElementById("onoff").innerHTML = !settings.on ? "OFF" : "ON";
		document.getElementById("onoff").style.backgroundColor = settings.on ?
			ON_COLOR : OFF_COLOR;

		document.getElementById("fast_mode").checked = settings.fast_mode;
		document.getElementById("run_at").value = settings.run_at;

		redrawWhitelists();
		redrawIcon(settings.on);
	});
}



/* Saves new settings, and updates all elements in the popup
 * to the new settings */
function saveSettingsAndUpdatePopup(){
	var settings = {};
    settings.on = document.getElementById("onoff").innerText.toLowerCase().includes("on"); // Sorry about this line
	settings.fast_mode = document.getElementById("fast_mode").checked;
	settings.run_at = document.getElementById("run_at").value;

	saveNewSettings(settings);

	/* Update the UI in the popup depending on the settings */
	document.getElementById("onoff").style.backgroundColor = settings.on ?
		ON_COLOR : OFF_COLOR;

	/* Update whitelist display */
	redrawWhitelists();
	redrawIcon(settings.on);

	return settings;
}

/* Prompt to reset all settings */
function resetSettings(){
	var c = confirm("Are you sure you want to reset all settings to default? This WILL ALSO reset all whitelists to defaults.");
	if( c ){
		let settings = {};
		settings.whitelisted_pages = [];
		settings.whitelisted_domains = DEFAULT_DOMAIN_WHITELIST;

		settings.fast_mode = false;
		settings.run_at = "load1";

		saveNewSettings(settings, redrawWhitelists);
	}
}

/* --- Special functions --- */
/* Some specialized functions for settings UI, such as adding a
 * whitelist or turning the extension on/off */

function toggleOnOff(){
	let on = document.getElementById("onoff").innerText.toLowerCase().includes("on");
	document.getElementById("onoff").innerHTML = on ? "OFF" : "ON";
	saveSettingsAndUpdatePopup();
}

function addPageToWhitelist(use_domain=false){
	let query = { active: true, currentWindow: true };
	chrome.tabs.query(query, function(tabs){
		let current_tab = tabs[0];
		chrome.storage.sync.get("whitelisted_pages", function(settings){
			let url = current_tab.url;

			/* Add to the whitelist if not present */
			if(!settings.whitelisted_pages.includes(url)){
				settings.whitelisted_pages.push(url);
				saveNewSettings(settings, redrawWhitelists);
			}
			/* Otherwise remove from the whitelist */
			else{
				let i = settings.whitelisted_pages.indexOf(url);
				settings.whitelisted_pages.splice(i, 1);
				saveNewSettings(settings, redrawWhitelists);
			}
		});
	});
}

function addDomainToWhiteList(){
	let query = { active: true, currentWindow: true };
	chrome.tabs.query(query, function(tabs){
		let current_tab = tabs[0];
		chrome.storage.sync.get("whitelisted_domains", function(settings){
			let url = extractRootDomain(current_tab.url);

			/* Add to whitelist if not present */
			if(!settings.whitelisted_domains.includes(url)){
				settings.whitelisted_domains.push(url);
				saveNewSettings(settings, redrawWhitelists);
			}
			/* Otherwise remove from the whitelist */
			else{
				let i = settings.whitelisted_domains.indexOf(url);
				settings.whitelisted_domains.splice(i, 1);
				saveNewSettings(settings, redrawWhitelists);
			}
		});
	});
}

/* Add the event listeners */
document.getElementById("onoff").addEventListener("click", toggleOnOff);
document.getElementById("whitelist_page").addEventListener("click", addPageToWhitelist);
document.getElementById("whitelist_domain").addEventListener("click", addDomainToWhiteList);

document.getElementById("fast_mode").onchange = saveSettingsAndUpdatePopup;
document.getElementById("run_at").onchange = saveSettingsAndUpdatePopup;

document.getElementById("reset_settings").addEventListener('click', resetSettings);


/* Update the UI */
loadInitalSettings();


/* Toggle for the settings and back buttons */
document.getElementById("settings_button").addEventListener('click',function(){
	document.getElementById("settings_div").style.left = "0px";
	document.getElementById("main_div").style.left = "-320px";
});

document.getElementById("back_button").addEventListener('click',function(){
	document.getElementById("settings_div").style.left = "320px";
	document.getElementById("main_div").style.left = "0px";
});


/* This is a fix for <a> tags in the chrome extension popup,
 * converting them so they will properly open in a new tab */
 document.addEventListener('DOMContentLoaded', function () {
 	var links = document.getElementsByTagName("a");
 	for (var i = 0; i < links.length; i++) {
 		(function () {
 			var ln = links[i];
 			var location = ln.href;
 			ln.onclick = function () {
 				chrome.tabs.create({active: true, url: location});
 			};
 		})();
 	}
 });

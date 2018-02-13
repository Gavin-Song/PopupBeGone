/* Deletes all modals on the screen */
function deleteAllModals(fast_mode=false, debug=false){
    let elements = findModalAndCovers(fast_mode);
    debug=true
    if(debug) console.log("---- Initating Modal Deletion ----");

    for(let e of elements){
        /* If the element is visible and it doesn't have enough child
         * elements inside (Aka a small element, and not the entire page)
         * delete it entirely */
        if(getElementChildCount(e) <= MAX_MODAL_CHILD_ELEMENTS){ //isVisible(e) &&
            if(debug) console.log("Deleting element:", e);
            e.outerHTML = "";
        }

        /* The element is visible, but contains a majority of the page,
         * or is a partly transparent cover over the page. */
        else if(isVisible(e)){
            if(debug) console.log("Redefining styles for usability:", e);
            forceUseableInlineStyle(e);
        }
    }

    /* Force the body tag to also be useable */
    if(elements.length > 0){
        chrome.runtime.sendMessage({ "path": "img/icon_active_found.png" });
        console.log("[PopupBeGone] " + elements.length + " elements have been deleted or refactored!");

        if(debug) console.log("Attempting to force body to be scrollable...");
        forceUseableInlineStyle(document.body);
    }
    if(debug) console.log("---- Modal Deletion Complete ----");
}

function canExecute(url, settings){
    /* If the extension is off don't do anything */
    if(!settings.on) return false;

    /* Site is whitelisted, don't excute */
    if(settings.whitelisted_pages.map(x => x.replace("https", "http")).includes(url.replace("https", "http")) ||
            settings.whitelisted_domains.includes(extractRootDomain(url))){
        chrome.runtime.sendMessage({ "path": "img/icon_whitelist.png" });
        return false;
    }
    return true;
}

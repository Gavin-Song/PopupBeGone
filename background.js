/* Keyboard shortcut to kill all modals */
chrome.commands.onCommand.addListener(function(command) {
    if(command == "popupbegone-kill-modal"){
        /* Execute the summary functions */
        chrome.tabs.executeScript({code:
            "deleteAllModals(true);"});
    }
});

/* Listerner to change browser icon to "found a modal" */
chrome.runtime.onMessage.addListener(
function(request, sender, sendResponse) {
        chrome.browserAction.setIcon({
            path: request.path,
            tabId: sender.tab.id
        });
});

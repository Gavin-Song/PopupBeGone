var execution_count = 0;

chrome.storage.sync.get(null, function(settings){
    if(execution_count > 0)  // Document load bug can cause this code to run multiple times
        return;

    if(Object.keys(settings).length == 0)
        settings = DEFAULT_SETTINGS;

    /* If the current page is whitelisted, ignore */
    let url = window.location.href;
    if(!canExecute(url, settings)) return;

    let delay = {"load_1": 0, "load_2": 1, "load_3": 3, "load_4": 5, "load_5": 10}[settings.run_at] * 1000;
    let fast_mode = settings.fast_mode;
    setTimeout(deleteAllModals, delay, fast_mode);
    execution_count++;
});

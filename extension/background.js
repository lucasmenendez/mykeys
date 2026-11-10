// Opening the side panel from the toolbar icon.
//
// `openPanelOnActionClick` makes the action click open the panel directly (no
// popup). It has to be configured from the extension itself, so this service
// worker does it on install and on every worker start.

function enablePanelOnActionClick() {
    if (!chrome.sidePanel?.setPanelBehavior) return;
    chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => {
            console.error("Could not configure the side panel:", error);
        });
}

enablePanelOnActionClick();

chrome.runtime.onInstalled.addListener(enablePanelOnActionClick);
chrome.runtime.onStartup.addListener(enablePanelOnActionClick);

// Bookmark hand-off page.
//
// Local bookmarks point to `open.html?data=…`. Chrome only opens the side panel
// in response to a user action, so this page hands the vault over and asks for
// that single click when the automatic attempt is refused.

const data = new URLSearchParams(location.search).get("data") ?? "";

const statusEl = document.getElementById("status");
const panelButton = document.getElementById("open-panel");
const tabLink = document.getElementById("open-tab");

tabLink.href = `index.html?data=${encodeURIComponent(data)}`;

async function handOff() {
    if (!data) throw new Error("This bookmark does not contain a vault.");

    await chrome.storage.session.set({
        pendingVault: { url: location.href, data },
    });

    const currentWindow = await chrome.windows.getCurrent();
    await chrome.sidePanel.open({ windowId: currentWindow.id });

    const tab = await chrome.tabs.getCurrent();
    if (tab?.id !== undefined) {
        setTimeout(() => { void chrome.tabs.remove(tab.id); }, 800);
    }
}

panelButton.addEventListener("click", async () => {
    panelButton.disabled = true;
    try {
        await handOff();
        statusEl.textContent = "Vault sent to the side panel.";
    } catch (error) {
        statusEl.textContent = `Could not open the side panel: ${
            error instanceof Error ? error.message : String(error)
        }`;
        panelButton.disabled = false;
        panelButton.hidden = false;
    }
});

// The automatic attempt is expected to be rejected (no user gesture): Chrome
// requires a click to open the panel. It is still tried so this keeps working
// if the browser ever relaxes that rule.
(async () => {
    if (!data) {
        statusEl.textContent = "This bookmark does not contain a vault.";
        panelButton.hidden = true;
        return;
    }

    try {
        await handOff();
        statusEl.textContent = "Vault sent to the side panel.";
    } catch {
        statusEl.textContent =
            "Chrome needs a click to open the side panel. Your vault is ready.";
        panelButton.hidden = false;
    }
})();

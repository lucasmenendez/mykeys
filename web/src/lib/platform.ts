// Platform capabilities.
//
// This is the only module that knows whether the app runs as the regular web
// app (mykeys.live) or inside the Chrome extension side panel. Every capability
// that differs between both targets lives here, and the web app keeps its
// original behaviour by default.

/** Public URL every vault link points to, for both targets. */
export const SITE_URL = "https://mykeys.live";

/**
 * Where a vault bookmark should point to:
 * - `online`: mykeys.live, works in any browser.
 * - `local`: this installation's extension page, works offline.
 */
export type BookmarkMode = "online" | "local";

/** A vault handed over from a local bookmark page to the side panel. */
export type PendingVault = {
    /** URL of the bookmark page that produced it. */
    url: string;
    /** Encrypted vault payload. */
    data: string;
};

const PENDING_VAULT_KEY = "pendingVault";

/** True only when the chrome.* bookmark/side panel APIs are available. */
export function isExtension(): boolean {
    if (typeof chrome === "undefined" || !chrome) return false;
    return !!chrome.bookmarks && !!chrome.sidePanel;
}

/** Where the Go runtime is served from. Identical in both targets. */
export function wasmUrl(): string {
    return "/mykeys.wasm";
}

/** Shareable URL for an encrypted vault. */
export function vaultUrl(
    blob: string,
    mode: BookmarkMode = "online",
): string {
    if (mode === "local" && isExtension() && chrome?.runtime?.getURL) {
        const base = chrome.runtime.getURL("open.html");
        return `${base}?data=${encodeURIComponent(blob)}`;
    }

    return `${SITE_URL}/?data=${encodeURIComponent(blob)}`;
}

/**
 * Reads a vault handed over by `open.html` without removing it. The panel only
 * consumes it once it can actually open it.
 */
export async function peekPendingVault(): Promise<PendingVault | undefined> {
    const session = chrome?.storage?.session;
    if (!isExtension() || !session) return undefined;

    try {
        const stored = await session.get(PENDING_VAULT_KEY);
        const pending = stored?.[PENDING_VAULT_KEY] as PendingVault | undefined;
        if (!pending?.data) return undefined;
        return pending;
    } catch (error) {
        console.error("Could not read the pending vault:", error);
        return undefined;
    }
}

/** Removes the handed-over vault once the panel has loaded it. */
export async function clearPendingVault(): Promise<void> {
    const session = chrome?.storage?.session;
    if (!isExtension() || !session) return;

    try {
        await session.remove(PENDING_VAULT_KEY);
    } catch (error) {
        console.error("Could not clear the pending vault:", error);
    }
}

/** Notifies when another context hands a vault over (e.g. a bookmark tab). */
export function onPendingVault(
    callback: (pending: PendingVault) => void,
): () => void {
    const session = chrome?.storage?.session;
    if (!isExtension() || !session?.onChanged) return () => {};

    const listener = (
        changes: Record<string, { newValue?: unknown }>,
        areaName: string,
    ) => {
        if (areaName !== "session") return;
        const pending = changes?.[PENDING_VAULT_KEY]?.newValue as PendingVault | undefined;
        if (pending?.data) callback(pending);
    };

    session.onChanged.addListener(listener);
    return () => session.onChanged?.removeListener(listener);
}

/**
 * "Open" action of the save dialog.
 *
 * Web: replaces the current document with `?data=…`, exactly as the web app has
 * always done. Extension: navigating the side panel away would destroy it, so
 * the public vault URL is opened in a new tab instead.
 */
export function openVault(blob: string): void {
    if (isExtension()) {
        window.open(vaultUrl(blob), "_blank", "noopener");
        return;
    }

    const url = new URL(window.location.href);
    url.search = `data=${encodeURIComponent(blob)}`;
    window.location.href = url.toString();
}

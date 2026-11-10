import { isExtension, SITE_URL, vaultUrl, type BookmarkMode } from "~/lib/platform";

export type VaultBookmark = {
    id: string;
    title: string;
    url: string;
    /** Encrypted vault payload taken from the bookmark `?data=` parameter. */
    data: string;
    /** Where the bookmark opens: this extension (local) or the web. */
    mode: BookmarkMode;
};

function toVaultBookmark(
    node: ChromeBookmarkNode,
): VaultBookmark | undefined {
    if (!node.url) return undefined;

    let url: URL;
    try {
        url = new URL(node.url);
    } catch {
        return undefined;
    }

    const data = url.searchParams.get("data");
    if (!data) return undefined;

    return {
        id: node.id,
        title: node.title || url.hostname,
        url: node.url,
        data,
        mode: url.protocol === "chrome-extension:" ? "local" : "online",
    };
}

/** Every bookmark of the profile that carries an encrypted vault. */
export async function listVaultBookmarks(): Promise<VaultBookmark[]> {
    if (!isExtension()) return [];

    const bookmarks = await chrome!.bookmarks!.search({});

    return bookmarks
        .map(toVaultBookmark)
        .filter((vault): vault is VaultBookmark => !!vault);
}

/**
 * Subscribes to bookmark changes. Returns an unsubscribe function.
 * No-op outside the extension.
 */
export function onBookmarksChanged(
    callback: () => void,
): () => void {
    if (!isExtension()) return () => {};

    const bookmarks = chrome!.bookmarks!;
    const handler = () => callback();

    bookmarks.onCreated.addListener(handler);
    bookmarks.onRemoved.addListener(handler);
    bookmarks.onChanged.addListener(handler);

    return () => {
        bookmarks.onCreated.removeListener(handler);
        bookmarks.onRemoved.removeListener(handler);
        bookmarks.onChanged.removeListener(handler);
    };
}

/**
 * Points an existing bookmark at a new version of the vault, preserving any
 * other URL parameter (and hash) it may carry.
 */
export async function updateVaultBookmark(
    id: string,
    blob: string,
): Promise<void> {
    if (!isExtension()) return;

    const bookmarks = chrome!.bookmarks!;

    let nodes: ChromeBookmarkNode[];
    try {
        nodes = await bookmarks.get(id);
    } catch {
        throw new Error("The bookmark no longer exists.");
    }

    const current = nodes[0];
    if (!current) {
        throw new Error("The bookmark no longer exists.");
    }

    let url: URL;
    try {
        url = new URL(current.url ?? SITE_URL);
    } catch {
        url = new URL(SITE_URL);
    }
    url.searchParams.set("data", blob);

    await bookmarks.update(id, { url: url.toString() });
}

/** Creates a new bookmark for a vault that was not opened from one. */
export async function createVaultBookmark(
    title: string,
    blob: string,
    mode: BookmarkMode = "online",
): Promise<void> {
    if (!isExtension()) return;

    await chrome!.bookmarks!.create({ title, url: vaultUrl(blob, mode) });
}

/**
 * Finds the bookmark that points exactly at `url` (same page and same vault
 * payload). Used when a vault is opened in a tab through a bookmark, where the
 * URL is the only hint about its origin.
 */
export async function findVaultBookmarkIdByUrl(
    url: string,
): Promise<string | undefined> {
    if (!isExtension()) return undefined;

    let target: URL;
    try {
        target = new URL(url);
    } catch {
        return undefined;
    }

    const targetData = target.searchParams.get("data");
    if (!targetData) return undefined;

    const vaults = await listVaultBookmarks();

    return vaults.find((vault) => {
        try {
            const candidate = new URL(vault.url);
            return candidate.origin === target.origin &&
                candidate.pathname === target.pathname &&
                candidate.searchParams.get("data") === targetData;
        } catch {
            return false;
        }
    })?.id;
}

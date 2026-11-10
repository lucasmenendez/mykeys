/// <reference types="@solidjs/start/env" />

declare global {
    interface Go {
        importObject: WebAssembly.Imports;
        run(instance: WebAssembly.Instance): Promise<void>;
    }

    var Go: {
        new (): Go;
    };

    interface MyKeysResult {
        error: string | null;
        data: string;
    }

    interface MyKeysCLI {
        list(b64: string, passphrase: string): MyKeysResult;
        set(b64: string, passphrase: string, alias: string, username: string, password: string): MyKeysResult;
        del(b64: string, passphrase: string, id: string): MyKeysResult;
    }

    interface Window {
        MyKeysCLI: MyKeysCLI;
    }

    interface ChromeBookmarkNode {
        id: string;
        title: string;
        url?: string;
    }

    interface ChromeChangeListener {
        addListener(callback: (...args: never[]) => void): void;
        removeListener(callback: (...args: never[]) => void): void;
    }

    interface ChromeBookmarksApi {
        search(query: string | Record<string, never>): Promise<ChromeBookmarkNode[]>;
        get(id: string | string[]): Promise<ChromeBookmarkNode[]>;
        create(details: {
            parentId?: string;
            index?: number;
            title?: string;
            url?: string;
        }): Promise<ChromeBookmarkNode>;
        update(
            id: string,
            changes: { title?: string; url?: string },
        ): Promise<ChromeBookmarkNode>;
        onCreated: ChromeChangeListener;
        onRemoved: ChromeChangeListener;
        onChanged: ChromeChangeListener;
    }

    interface ChromeSidePanelApi {
        open(options: { windowId?: number; tabId?: number }): Promise<void>;
    }

    interface ChromeRuntimeApi {
        getURL(path: string): string;
    }

    interface ChromeStorageArea {
        get(keys: string | string[]): Promise<Record<string, unknown>>;
        set(items: Record<string, unknown>): Promise<void>;
        remove(keys: string | string[]): Promise<void>;
        onChanged?: {
            addListener(
                callback: (
                    changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
                    areaName: string,
                ) => void,
            ): void;
            removeListener(callback: (...args: never[]) => void): void;
        };
    }

    interface ChromeTabsApi {
        getCurrent(): Promise<{ id?: number } | undefined>;
        remove(tabId: number): Promise<void>;
    }

    interface ChromeWindowsApi {
        getCurrent(): Promise<{ id?: number }>;
    }

    // Only present when the app runs as a Chrome extension. Kept optional so
    // the regular web build type-checks and runs without any chrome.* API.
    var chrome:
        | {
              bookmarks?: ChromeBookmarksApi;
              sidePanel?: ChromeSidePanelApi;
              runtime?: ChromeRuntimeApi;
              storage?: { session?: ChromeStorageArea };
              tabs?: ChromeTabsApi;
              windows?: ChromeWindowsApi;
          }
        | undefined;
}

export {};

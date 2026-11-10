import "./VaultList.css";

import {
    Bookmark,
    Globe,
    HardDrive,
    RefreshCw,
} from "lucide-solid";

import {
    For,
    Show,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";

import {
    listVaultBookmarks,
    onBookmarksChanged,
    type VaultBookmark,
} from "~/lib/bookmarks";

import { textToLoadedFile } from "~/lib/vaultFile";

import {
    LoadedFileSource,
    type LoadedFile,
} from "~/state/AppState";

export type VaultListProps = {
    onOpen: (file: LoadedFile) => void;
};

/** Lists the bookmarks of the profile that hold an encrypted vault. */
export default function VaultList(
    props: VaultListProps,
) {
    const [vaults, setVaults] = createSignal<VaultBookmark[]>([]);
    const [loading, setLoading] = createSignal(true);

    const refresh = async () => {
        try {
            setVaults(await listVaultBookmarks());
        } catch (error) {
            console.error("Could not read bookmarks:", error);
            setVaults([]);
        } finally {
            setLoading(false);
        }
    };

    onMount(() => {
        void refresh();
        onCleanup(onBookmarksChanged(() => void refresh()));
    });

    const open = (vault: VaultBookmark) => {
        const file = textToLoadedFile(
            LoadedFileSource.Bookmark,
            vault.data,
            { name: vault.title, bookmarkId: vault.id },
        );
        if (file) props.onOpen(file);
    };

    return (
        <section class="vault-list" aria-label="Vaults in your bookmarks">
            <header class="vault-list-header">
                <h2>Your vaults</h2>
                <button
                    type="button"
                    class="vault-refresh"
                    title="Look for vault bookmarks again"
                    onClick={() => void refresh()}>
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </header>

            <Show
                when={!loading()}
                fallback={<p class="vault-list-hint">Looking for vault bookmarks…</p>}>
                <Show
                    when={vaults().length > 0}
                    fallback={
                        <p class="vault-list-hint">
                            No vault bookmarks yet. Save a vault and bookmark
                            its link — it will show up here.
                        </p>
                    }>
                    <ul class="vault-list-items">
                        <For each={vaults()}>{(vault) => (
                            <li>
                                <button
                                    type="button"
                                    class="vault-item"
                                    title={vault.url}
                                    onClick={() => open(vault)}>
                                    <Bookmark size={16} />
                                    <span class="vault-item-text">
                                        <span class="vault-item-title">
                                            {vault.title}
                                        </span>
                                        <span class="vault-item-url">
                                            {vault.url}
                                        </span>
                                    </span>
                                    <span
                                        class="vault-item-tag"
                                        classList={{ local: vault.mode === "local" }}
                                        title={vault.mode === "local"
                                            ? "Saved locally in this extension"
                                            : "Saved on the web"}>
                                        {vault.mode === "local"
                                            ? <HardDrive size={11} />
                                            : <Globe size={11} />}
                                        {vault.mode === "local" ? "Local" : "Online"}
                                    </span>
                                </button>
                            </li>
                        )}</For>
                    </ul>
                </Show>
            </Show>
        </section>
    );
}

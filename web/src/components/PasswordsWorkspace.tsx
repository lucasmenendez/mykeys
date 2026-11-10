import { FolderOpen, FilePlusCorner, SquarePlus, SaveCheck, Lock, CircleHelp } from 'lucide-solid';

import { createEffect, createMemo, createSignal, on, onCleanup, onMount, Show, type ParentProps } from "solid-js";

import {
    buildVaultExport,
    LoadedFile,
    LoadedFileSource,
    persistPassword,
    recordChange,
    useAppState,
} from "~/state/AppState";

import Topbar from "~/ui/Topbar";
import BottomBar from "~/ui/BottomBar";
import SearchBox from "~/ui/SearchBox";
import DropZone from "~/ui/DropZone";
import PassphraseModal from "~/components/PassphraseModal";
import EditPasswordModal from "~/components/EditPasswordModal";
import SavePasswordsModal from "~/components/SavePasswordsModal";
import { confirm } from "~/ui/ConfirmDialog";
import { toast } from "~/ui/Toaster";
import VaultList from "~/components/VaultList";
import {
    clearPendingVault,
    isExtension,
    onPendingVault,
    peekPendingVault,
    type PendingVault,
} from "~/lib/platform";
import { findVaultBookmarkIdByUrl } from "~/lib/bookmarks";
import { fileToLoadedFile, textToLoadedFile } from "~/lib/vaultFile";
import { navigateHelp } from "~/lib/hashRoute";

export default function PasswordsWorkspace(
    props: ParentProps,
) {
    const { state, setState, reset } = useAppState();
    let fileInput!: HTMLInputElement;

    const [creating, setCreating] = createSignal(false);

    const [saving, setSaving] = createSignal(false);
    const [savedResult, setSavedResult] = createSignal("");
    const [savePassphraseOpen, setSavePassphraseOpen] = createSignal(false);

    const saveFileName = () =>
        state.encrypted?.name ?? "mykeys-vault.txt";

    const hasSaveableChanges = () =>
        (state.changes?.some((change) => change.type !== "open") ?? false);

    // Saving is not only about pending edits anymore: the dialog also offers
    // copy / download / open / update bookmark, so it stays available while a
    // vault is open or there is something to export.
    const canSave = () =>
        !!state.encrypted ||
        (state.passwords?.length ?? 0) > 0 ||
        hasSaveableChanges();

    const generateAndShow = (passphrase: string) => {
        const result = buildVaultExport(state, passphrase);
        if (typeof result === "string") {
            // Adopt a newly chosen passphrase so the next plain save keeps
            // using it and the export shortcut stays consistent.
            if (passphrase !== state.passphrase) {
                setState("passphrase", passphrase);
                setState("encrypted", {
                    ...state.encrypted,
                    content: result,
                    size: new TextEncoder().encode(result).length,
                });
            }
            // The export succeeded: nothing is pending anymore. Keep the
            // "open" entry for context so the pending count reflects only
            // unsaved edits.
            setState("changes", (state.changes ?? []).filter(
                (change) => change.type === "open",
            ));
            setSavedResult(result);
            setSaving(true);
        } else {
            toast({ message: result.error, variant: "error" });
        }
    };

    const handleSaveClick = () => {
        if (state.passphrase) generateAndShow(state.passphrase);
        else setSavePassphraseOpen(true);
    };

    const handleSavePassphrase = (passphrase: string) => {
        setSavePassphraseOpen(false);
        generateAndShow(passphrase);
    };

    const lockVault = async () => {
        // In the extension, locking also closes the vault so the side panel
        // returns to the vault list, where any bookmark can be opened again.
        const backToVaults = isExtension();

        const ok = await confirm({
            message: backToVaults
                ? "Lock the vault? The passphrase and decrypted passwords will be cleared from memory and you will go back to your vaults. Unsaved changes will be lost."
                : "Lock the vault? The passphrase and decrypted passwords will be cleared from memory. Unsaved changes will be kept so you can save them after unlocking again.",
            confirmLabel: "Lock",
        });
        if (!ok) return;

        if (backToVaults) {
            reset();
            return;
        }

        setState({
            passphrase: "",
            passwords: undefined,
            query: undefined,
        });
    };

    const passphraseOpen = createMemo(() =>
        (state.encrypted?.size ?? 0) > 0 &&
        (state.passphrase?.length ?? 0) == 0,
    );

    // The vault list is the home screen of the extension: it must disappear as
    // soon as there is something being worked on, even if no vault was opened
    // (e.g. a password list created from scratch).
    const showVaultList = () =>
        isExtension() &&
        !state.encrypted &&
        (state.passwords?.length ?? 0) === 0;

    const confirmDiscard = async (): Promise<boolean> => {
        if ((state.passwords?.length ?? 0) === 0) return true;

        return await confirm({
            message: "Your current passwords will be discarded. Continue?",
            confirmLabel: "Discard",
            danger: true,
        });
    };

    const onLoad = async (file: LoadedFile, sourceUrl?: string) => {
        if (!(await confirmDiscard())) return;

        reset();

        // A vault opened through its bookmark URL (e.g. a local
        // chrome-extension:// bookmark in a tab) only carries the URL, so the
        // matching bookmark is resolved to keep "Update bookmark" working.
        let bookmarkId = file.bookmarkId;
        if (!bookmarkId && isExtension()) {
            const url = sourceUrl ??
                (file.source === LoadedFileSource.URL ? window.location.href : "");
            if (url) {
                bookmarkId = await findVaultBookmarkIdByUrl(url);
            }
        }

        setState("encrypted", { ...file, bookmarkId });
        recordChange(state, setState, {
            type: "open",
            source: file.source,
        });
    }

    /** Loads a vault handed over by `open.html` (local bookmark hand-off). */
    const applyPendingVault = async (pending?: PendingVault) => {
        const value = pending ?? await peekPendingVault();
        if (!value || state.encrypted) return;

        const file = textToLoadedFile(LoadedFileSource.URL, value.data);
        if (!file) {
            await clearPendingVault();
            return;
        }

        await onLoad(file, value.url);
        if (state.encrypted) {
            await clearPendingVault();
        }
    };

    onMount(() => {
        void applyPendingVault();
        onCleanup(onPendingVault((pending) => void applyPendingVault(pending)));
    });

    // A handed-over vault that arrived while another vault was open is applied
    // as soon as the panel goes back to the vault list.
    createEffect(on(
        () => !!state.encrypted,
        (hasVault) => {
            if (!hasVault) void applyPendingVault();
        },
        { defer: true },
    ));

    const loadFile = async (
        source: LoadedFileSource,
        file: File,
    ) => {
        const loaded = await fileToLoadedFile(source, file);
        if (loaded) onLoad(loaded);
    };

    const handleFileChange = async (
        event: Event & {
            currentTarget: HTMLInputElement;
        },
    ) => {
        const file = event.currentTarget.files?.[0];
        if (file) await loadFile(
            LoadedFileSource.File,
            file,
        );
        event.currentTarget.value = "";
    };


    const filterPasswordsList = (
        query: string
    ) => {
        setState("query", query);
    }

    return (
        <DropZone onLoad={onLoad}>
            <input
                ref={fileInput}
                type="file"
                id="file-input"
                onChange={handleFileChange}
                hidden
            />
            <PassphraseModal
                open={passphraseOpen()}
                persistent
                dismissOnOutsideClick={false}
                title="Unlock your vault"
                description="Enter the passphrase for this vault to unlock it."
                cancelLabel="Discard"
                onCancel={async () => {
                    if (await confirmDiscard()) reset();
                }}
                onSubmit={(passphrase) => {
                    if (!state.encrypted?.content) return;
                    const result = window.MyKeysCLI.list(state.encrypted.content, passphrase);
                    if (result.error) {
                        toast({ message: result.error, variant: "error" });
                        return;
                    }
                    let passwords = [];
                    try {
                        passwords = JSON.parse(result.data);
                    } catch {
                        toast({
                            message: "Could not read the passwords list.",
                            variant: "error",
                        });
                        return;
                    }
                    setState("passphrase", passphrase);
                    setState("passwords", passwords);
                }}
                onClose={reset} />

            <Topbar
                actions={[
                    {
                        text: "New",
                        handler: async () => {
                            if (await confirmDiscard()) reset();
                        },
                        icon: (<FilePlusCorner size={16} strokeWidth={1} />)
                    },
                    {
                        text: "Open",
                        handler: () => fileInput.click(),
                        icon: (<FolderOpen size={16} strokeWidth={1} />)
                    },
                    {
                        text: "Add Pass",
                        handler: () => setCreating(true),
                        icon: (<SquarePlus size={16} strokeWidth={1} />)
                    },
                    ...(state.passphrase
                        ? [{
                            text: "Lock",
                            handler: lockVault,
                            icon: (<Lock size={16} strokeWidth={1} />),
                        }]
                        : []),
                    {
                        text: "Help",
                        handler: navigateHelp,
                        icon: (<CircleHelp size={16} strokeWidth={1} />),
                    },
                    ...(canSave()
                        ? [{
                            text: "Save",
                            handler: handleSaveClick,
                            icon: (<SaveCheck size={16} strokeWidth={1} />),
                            pinned: true,
                        }]
                        : [])
                ]}>
                <SearchBox
                    value={state.query ?? ""}
                    onSearch={(value) => filterPasswordsList(value)}
                ></SearchBox>
            </Topbar>
            <EditPasswordModal
                open={creating()}
                onClose={() => setCreating(false)}
                onSubmit={(data) => {
                    const result = persistPassword(state, setState, data);
                    if (result.ok) setCreating(false);
                    else toast({ message: result.error, variant: "error" });
                }}
            />
            <PassphraseModal
                open={savePassphraseOpen()}
                title="Protect your vault"
                description="Choose a passphrase. It will encrypt your vault, so make it strong and keep it safe."
                showRequirements
                onSubmit={handleSavePassphrase}
                onClose={() => setSavePassphraseOpen(false)}
                onCancel={() => setSavePassphraseOpen(false)}
            />
            <SavePasswordsModal
                open={saving()}
                result={savedResult()}
                fileName={saveFileName()}
                bookmarkId={state.encrypted?.bookmarkId}
                onClose={() => {
                    setSaving(false);
                    setSavedResult("");
                }}
                onChangePassphrase={() => setSavePassphraseOpen(true)}
            />
            <main>
                <Show when={showVaultList()}>
                    <VaultList onOpen={onLoad} />
                </Show>
                {props.children}
            </main>
            <BottomBar
                file={state.encrypted}
                changes={state.changes}
                tips={[
                    "Caution: Do not share your password files with anyone. Keep it secure and private.",
                    "Be sure to save and encrypt your changes before leaving the app.",
                    "Tip: Bookmark your passwords to store them in the browser itself.",
                    "Remember, you can drop a file or a bookmark to load your passwords from there.",
                    "Tip: Paste your passwords file content to load it directly.",
                ]}
                tipsInterval={7200}
            />
        </DropZone>
    );
}
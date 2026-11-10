import "./SavePasswordsModal.css";

import {
    BookmarkCheck,
    BookmarkPlus,
    Check,
    ChevronDown,
    Download,
    Globe,
    HardDrive,
    KeyRound,
    Link,
} from 'lucide-solid';

import {
    For,
    Show,
    createSignal,
} from "solid-js";

import Modal from "~/ui/Modal";
import CopyButton from "~/ui/CopyButton";
import { toast } from "~/ui/Toaster";
import BookmarkNameModal from "~/components/BookmarkNameModal";
import { useDismiss } from "~/lib/useDismiss";
import {
    isExtension,
    openVault,
    type BookmarkMode,
} from "~/lib/platform";
import {
    createVaultBookmark,
    updateVaultBookmark,
} from "~/lib/bookmarks";

type SavePasswordsModalProps = {
    open: boolean;
    result: string;
    fileName?: string;
    /** Set when the vault was opened from a Chrome bookmark. */
    bookmarkId?: string;
    onClose: () => void;
    onChangePassphrase: () => void;
};

type BookmarkModeOption = {
    mode: BookmarkMode;
    title: string;
    description: string;
    hint: string;
};

const BOOKMARK_MODES: BookmarkModeOption[] = [
    {
        mode: "online",
        title: "Online",
        description: "mykeys.live — opens in any browser with internet.",
        hint: "The bookmark will open mykeys.live in any browser.",
    },
    {
        mode: "local",
        title: "Locally",
        description: "This extension — opens offline, tied to this install.",
        hint: "The bookmark will open this extension's page, offline.",
    },
];

export default function SavePasswordsModal(props: SavePasswordsModalProps) {
    const [bookmarkBusy, setBookmarkBusy] = createSignal(false);
    const [mode, setMode] = createSignal<BookmarkMode>("online");
    const [modeMenuOpen, setModeMenuOpen] = createSignal(false);
    const [nameOpen, setNameOpen] = createSignal(false);
    let splitRef: HTMLDivElement | undefined;

    useDismiss(modeMenuOpen, () => splitRef, () => setModeMenuOpen(false));

    const defaultName = () =>
        (props.fileName ?? "MyKeys vault").replace(/\.(txt|mykeys)$/i, "");

    const chosenMode = () =>
        BOOKMARK_MODES.find((option) => option.mode === mode());

    const chooseMode = (next: BookmarkMode) => {
        setMode(next);
        setModeMenuOpen(false);
    };

    const updateBookmark = async () => {
        if (bookmarkBusy()) return;
        setBookmarkBusy(true);
        try {
            await updateVaultBookmark(props.bookmarkId!, props.result);
            toast({ message: "Bookmark updated", variant: "success" });
        } catch (error) {
            toast({
                message: error instanceof Error
                    ? error.message
                    : "Could not update the bookmark.",
                variant: "error",
            });
        } finally {
            setBookmarkBusy(false);
        }
    };

    const createBookmark = async (name: string) => {
        if (bookmarkBusy()) return;
        setBookmarkBusy(true);
        try {
            await createVaultBookmark(name, props.result, mode());
            setNameOpen(false);
            toast({ message: "Vault bookmarked", variant: "success" });
        } catch (error) {
            toast({
                message: error instanceof Error
                    ? error.message
                    : "Could not save the bookmark.",
                variant: "error",
            });
        } finally {
            setBookmarkBusy(false);
        }
    };

    const downloadResult = () => {
        const blob = new Blob([props.result], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = props.fileName ?? "mykeys-vault.txt";
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const openResult = () => {
        openVault(props.result);
    };

    return (
        <Modal
            open={props.open}
            title="Save passwords"
            onClose={props.onClose}
        >
            <div class="save-passwords">
                <p class="hint">
                    Your passwords are encrypted with your passphrase. Copy,
                    download or open them to keep your vault.
                </p>
                <textarea
                    class="result"
                    readonly
                    rows={6}
                    value={props.result}
                    spellcheck={false}
                ></textarea>
                <div class="actions">
                    <CopyButton
                        asButton
                        class="outline contrast"
                        value={props.result}
                        text="Copy"
                    />
                    <button type="button" class="outline contrast" onClick={downloadResult}>
                        <Download size={16} />
                        Download
                    </button>
                    <button type="button" class="contrast" onClick={openResult}>
                        <Link size={16} />
                        Open
                    </button>
                </div>

                <Show when={isExtension()}>
                    <div class="bookmark-save">
                        <Show
                            when={props.bookmarkId}
                            fallback={
                                <div class="bookmark-split" ref={splitRef}>
                                    <button
                                        type="button"
                                        class="contrast bookmark-main"
                                        disabled={bookmarkBusy()}
                                        onClick={() => setNameOpen(true)}>
                                        <BookmarkPlus size={16} />
                                        Bookmark {mode() === "local" ? "locally" : "online"}
                                    </button>
                                    <button
                                        type="button"
                                        class="contrast bookmark-caret"
                                        aria-haspopup="menu"
                                        aria-expanded={modeMenuOpen()}
                                        aria-label="Choose where to save the bookmark"
                                        onClick={() => setModeMenuOpen((open) => !open)}>
                                        <ChevronDown size={16} />
                                    </button>

                                    <Show when={modeMenuOpen()}>
                                        <div class="bookmark-mode-menu" role="menu">
                                            <p class="bookmark-mode-title">
                                                Save the bookmark to
                                            </p>
                                            <For each={BOOKMARK_MODES}>{(option) => (
                                                <button
                                                    type="button"
                                                    role="menuitemradio"
                                                    aria-checked={mode() === option.mode}
                                                    classList={{
                                                        "bookmark-mode-item": true,
                                                        selected: mode() === option.mode,
                                                    }}
                                                    onClick={() => chooseMode(option.mode)}>
                                                    {option.mode === "local"
                                                        ? <HardDrive size={16} />
                                                        : <Globe size={16} />}
                                                    <span class="bookmark-mode-text">
                                                        <span class="bookmark-mode-name">
                                                            {option.title}
                                                        </span>
                                                        <span class="bookmark-mode-desc">
                                                            {option.description}
                                                        </span>
                                                    </span>
                                                    <Show when={mode() === option.mode}>
                                                        <Check size={16} />
                                                    </Show>
                                                </button>
                                            )}</For>
                                        </div>
                                    </Show>
                                </div>
                            }>
                            <button
                                type="button"
                                class="contrast bookmark-action"
                                disabled={bookmarkBusy()}
                                onClick={() => void updateBookmark()}>
                                <BookmarkCheck size={16} />
                                Update bookmark
                            </button>
                        </Show>

                        <p class="bookmark-hint">
                            {props.bookmarkId
                                ? "Point this bookmark at the new version of the vault."
                                : chosenMode()?.hint}
                        </p>
                    </div>
                </Show>

                <button
                    type="button"
                    class="change-passphrase"
                    onClick={props.onChangePassphrase}
                >
                    <KeyRound size={16} />
                    Change passphrase
                </button>
            </div>

            <Show when={isExtension()}>
                <BookmarkNameModal
                    open={nameOpen()}
                    initialValue={defaultName()}
                    busy={bookmarkBusy()}
                    onSubmit={(name) => void createBookmark(name)}
                    onClose={() => setNameOpen(false)}
                />
            </Show>
        </Modal>
    );
}

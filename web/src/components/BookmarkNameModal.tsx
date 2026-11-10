import "./BookmarkNameModal.css";

import {
    createSignal,
    createEffect,
} from "solid-js";

import Modal from "~/ui/Modal";

export type BookmarkNameModalProps = {
    open: boolean;
    initialValue: string;
    busy?: boolean;
    onSubmit: (name: string) => void;
    onClose: () => void;
};

export default function BookmarkNameModal(props: BookmarkNameModalProps) {
    const [name, setName] = createSignal(props.initialValue);

    createEffect(() => {
        if (props.open) setName(props.initialValue);
    });

    const trimmed = () => name().trim();

    const submit = (event: SubmitEvent) => {
        event.preventDefault();
        if (!trimmed()) return;
        props.onSubmit(trimmed());
    };

    return (
        <Modal
            open={props.open}
            title="Name your bookmark"
            onClose={props.onClose}
        >
            <form class="bookmark-name" onSubmit={submit}>
                <label>
                    Bookmark name
                    <input
                        type="text"
                        value={name()}
                        maxlength={120}
                        autofocus
                        placeholder="My vault"
                        onInput={(event) => setName(event.currentTarget.value)}
                    />
                </label>
                <p class="bookmark-name-hint">
                    You can rename it later from the browser's bookmarks.
                </p>
                <div class="bookmark-name-actions">
                    <button
                        type="button"
                        class="outline contrast"
                        onClick={props.onClose}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="contrast"
                        disabled={!trimmed() || props.busy}>
                        Bookmark
                    </button>
                </div>
            </form>
        </Modal>
    );
}

import "./PassphraseModal.css";

import {
    createEffect,
    createMemo,
    createSignal,
    For,
    Show,
} from "solid-js";

import Modal from "~/ui/Modal";

export type PassphraseModalProps = {
    open: boolean;
    onSubmit: (value: string) => void;
    onClose?: () => void;
    persistent?: boolean;
    dismissOnOutsideClick?: boolean;
    cancelLabel?: string;
    onCancel?: () => void;
    title?: string;
    description?: string;
    showRequirements?: boolean;
}

const REQUIREMENTS: Array<{ label: string; met: (value: string) => boolean }> = [
    { label: "At least 8 characters", met: (value) => value.length >= 8 },
    { label: "A lowercase letter", met: (value) => /[a-z]/.test(value) },
    { label: "An uppercase letter", met: (value) => /[A-Z]/.test(value) },
    { label: "A number", met: (value) => /\d/.test(value) },
];

let nextInputId = 1;

export default function PassphraseModal(
    props: PassphraseModalProps
) {
    const [passphrase, setPassphrase] = createSignal("");
    const inputId = `passphrase-input-${nextInputId++}`;
    let inputRef!: HTMLInputElement;

    createEffect(() => {
        if (props.open && inputRef) inputRef.focus();
    });

    const requirementsMet = createMemo(() =>
        REQUIREMENTS.every((requirement) => requirement.met(passphrase())),
    );

    const handlePassphrase = (event: SubmitEvent) => {
        event.preventDefault();
        if (props.showRequirements && !requirementsMet()) return;
        props.onSubmit(passphrase());
        setPassphrase("");
    }

    return (
        <Modal
            title={props.title ?? "Passphrase"}
            open={props.open}
            closeButton={false}
            persistent={props.persistent}
            dismissOnOutsideClick={props.dismissOnOutsideClick}
            onClose={props.onClose}
        >
            <form onSubmit={handlePassphrase}>
                <Show when={props.description}>
                    <p class="passphrase-description">{props.description}</p>
                </Show>
                <label class="passphrase-label" for={inputId}>Passphrase</label>
                <input
                    ref={inputRef}
                    id={inputId}
                    type="password"
                    value={passphrase()}
                    placeholder="Type your passphrase..."
                    onInput={(event) => setPassphrase(event.currentTarget.value)}
                ></input>
                <Show when={props.showRequirements}>
                    <ul class="passphrase-requirements" aria-live="polite">
                        <For each={REQUIREMENTS}>{(requirement) => (
                            <li classList={{ met: requirement.met(passphrase()) }}>
                                <span class="marker" aria-hidden="true">
                                    {requirement.met(passphrase()) ? "✓" : "•"}
                                </span>
                                {requirement.label}
                            </li>
                        )}</For>
                    </ul>
                </Show>
                <div class="passphrase-actions">
                    <Show when={props.onCancel}>
                        <button
                            type="button"
                            class="outline contrast"
                            onClick={props.onCancel}
                        >
                            {props.cancelLabel ?? "Cancel"}
                        </button>
                    </Show>
                    <button
                        type="submit"
                        class="contrast"
                        disabled={props.showRequirements && !requirementsMet()}
                    >Continue</button>
                </div>
            </form>
        </Modal>
    )
}

import "./Modal.css";

import {
    createEffect,
    on,
    onMount,
    Show,
    type ParentProps,
} from "solid-js";

type ModalProps = ParentProps<{
    open: boolean;
    title?: string;
    closeButton?: boolean;
    persistent?: boolean;
    dismissOnOutsideClick?: boolean;
    onClose?: () => void;
}>;

export default function Modal(props: ModalProps) {
    let dialog!: HTMLDialogElement;

    const syncDialog = (open: boolean) => {
        if (open && !dialog.open) {
            dialog.showModal();
            return;
        }

        if (!open && dialog.open) dialog.close();
    };

    onMount(() => {
        syncDialog(props.open);
    });

    createEffect(
        on(
            () => props.open,
            (open) => syncDialog(open),
            {
                defer: true,
            },
        ),
    );

    const handleKeyDown = (event: KeyboardEvent) => {
        if (
            props.persistent &&
            event.key === "Escape"
        ) {
            event.preventDefault();
            event.stopPropagation();
        }
    };

    const handleCancel = (event: Event) => {
        if (props.persistent) event.preventDefault();
    };

    const handleClose = () => {
        // Native close, e.g. ESC on a non-persistent modal.
        if (props.open) props.onClose!();
    };

    const handleClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        if (props.dismissOnOutsideClick === false || props.persistent) return;

        // Ignore clicks that fall inside an open popover (e.g. toasts) shown
        // over the dialog, so dismissing a toast doesn't close the modal.
        const popover = document.querySelector("[popover]:popover-open");
        if (popover instanceof HTMLElement) {
            const rect = popover.getBoundingClientRect();
            if (
                rect.left <= event.clientX && event.clientX <= rect.right &&
                rect.top <= event.clientY && event.clientY <= rect.bottom
            ) return;
        }

        props.onClose!();
    };

    return (
        <dialog
            ref={dialog}
            class="modal-dialog"
            onKeyDown={handleKeyDown}
            on:cancel={handleCancel}
            on:close={handleClose}
            onClick={handleClick}
        >
            <div class="modal-inner">
                <Show when={props.title || props.closeButton !== false}>
                    <div class="modal-header">
                        <Show when={props.title}>
                            <span class="modal-title">{props.title}</span>
                        </Show>
                        <Show when={props.closeButton !== false}>
                            <button
                                type="button"
                                class="modal-close"
                                aria-label="Close"
                                onClick={() => props.onClose?.()}
                            >×</button>
                        </Show>
                    </div>
                </Show>
                <div class="modal-content">
                    {props.children}
                </div>
            </div>
        </dialog>
    );
}
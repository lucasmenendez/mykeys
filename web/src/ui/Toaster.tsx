import "./Toaster.css";

import {
    createEffect,
    createSignal,
    For,
    onCleanup,
} from "solid-js";

export type ToastVariant = "info" | "success" | "error";

export type ToastOptions = {
    message: string;
    variant?: ToastVariant;
    duration?: number;
};

type Toast = {
    id: number;
    message: string;
    variant: ToastVariant;
    duration: number;
};

const DEFAULT_DURATION = 4000;

let nextId = 1;
const [toasts, setToasts] = createSignal<Toast[]>([]);

export function toast(options: ToastOptions): number {
    const id = nextId++;
    setToasts((list) => [
        ...list,
        {
            id,
            message: options.message,
            variant: options.variant ?? "info",
            duration: options.duration ?? DEFAULT_DURATION,
        },
    ]);
    return id;
}

function dismissToast(id: number): void {
    setToasts((list) => list.filter((item) => item.id !== id));
}

function ToastItem(props: { toast: Toast }) {
    createEffect(() => {
        if (props.toast.duration <= 0) return;

        const timer = setTimeout(
            () => dismissToast(props.toast.id),
            props.toast.duration,
        );
        onCleanup(() => clearTimeout(timer));
    });

    return (
        <div
            class={`toast toast-${props.toast.variant}`}
            role={props.toast.variant === "error" ? "alert" : "status"}
        >
            <span class="message">{props.toast.message}</span>
            <button
                type="button"
                class="dismiss"
                aria-label="Dismiss notification"
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    dismissToast(props.toast.id);
                }}
            >×</button>
        </div>
    );
}

export default function Toaster() {
    let toasterRef!: HTMLDivElement;

    createEffect(() => {
        // Manual popovers sit in the browser's top layer, so they render
        // above any open modal dialog without blocking interaction.
        if (!toasterRef.hasAttribute("popover")) {
            toasterRef.setAttribute("popover", "manual");
        }

        if (toasts().length === 0) {
            if (toasterRef.matches(":popover-open")) toasterRef.hidePopover();
            return;
        }

        if (!toasterRef.matches(":popover-open")) toasterRef.showPopover();
    });

    return (
        <div
            ref={toasterRef}
            class="toaster toaster-top-right"
            aria-live="polite"
        >
            <For each={toasts()}>{(item) => (
                <ToastItem toast={item} />
            )}</For>
        </div>
    );
}

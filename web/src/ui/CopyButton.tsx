import "./CopyButton.css";

import { createSignal, onCleanup, Show } from "solid-js";
import { Check, Copy } from "lucide-solid";

import { toast } from "~/ui/Toaster";

type CopyButtonProps = {
    text?: string;
    value: string;
    asButton?: boolean;
    class?: string;
};

// Legacy fallback for non-secure contexts or denied Clipboard permissions.
function copyWithFallback(text: string): boolean {
    try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        textarea.remove();
        return ok;
    } catch {
        return false;
    }
}

export default function CopyButton(props: CopyButtonProps) {
    const [copied, setCopied] = createSignal(false);
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(props.value);
        } catch {
            if (!copyWithFallback(props.value)) {
                toast({
                    message: "Could not copy to the clipboard.",
                    variant: "error",
                });
                return;
            }
        }

        setCopied(true);
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            setCopied(false);
        }, 1_500);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            void copyToClipboard();
        }
    };

    onCleanup(() => {
        if (resetTimer) clearTimeout(resetTimer);
    });

    if (props.asButton) {
        return (
            <button
                type="button"
                class={`copy-button button-style ${props.class ?? ""}`}
                aria-label={copied() ? "Copied" : "Copy to clipboard"}
                title={copied() ? "Copied" : "Copy"}
                onClick={(event) => {
                    event.stopPropagation();
                    void copyToClipboard();
                }}
            >
                {copied() ? <Check size={16} /> : <Copy size={16} />}
                <Show when={props.text !== undefined}>
                    <span class="button-text">{props.text}</span>
                </Show>
            </button>
        );
    }

    return (
        <span
            class="copy-button"
            tabIndex={0}
            aria-label={copied() ? "Copied" : "Copy to clipboard"}
            title={copied() ? "Copied" : "Copy"}
            onClick={(event) => {
                event.stopPropagation();
                void copyToClipboard();
            }}
            onKeyDown={handleKeyDown}
        >
            {copied() ? <Check size={16} /> : <Copy size={16} />}
            <Show when={props.text !== undefined}>
                <span class="button-text">{props.text}</span>
            </Show>
        </span>
    );
}
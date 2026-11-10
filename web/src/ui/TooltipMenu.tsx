import "./TooltipMenu.css";

import {
    createEffect,
    createSignal,
    For,
    onCleanup,
    Show,
    type JSX,
} from "solid-js";

import { useDismiss } from "~/lib/useDismiss";

export type TooltipMenuItem = {
    icon?: JSX.Element;
    text: string;
    onClick: () => void;
};

export type TooltipMenuProps = {
    icon: JSX.Element;
    openIcon?: JSX.Element;
    items: TooltipMenuItem[];
    defaultOpen?: boolean;
    placement?: "top" | "bottom";
    align?: "left" | "right";
    ariaLabel?: string;
    buttonClass?: string;
    onOpenChange?: (open: boolean) => void;
};

const GAP = 4;
const MIN_PANEL_WIDTH = 176;
const EDGE = 8;

export default function TooltipMenu(props: TooltipMenuProps) {
    const [open, setOpen] = createSignal(props.defaultOpen ?? false);
    const [pos, setPos] = createSignal<{
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
    }>();
    let rootRef!: HTMLDivElement;
    let buttonRef!: HTMLDivElement;

    const updateOpen = (next: boolean) => {
        setOpen(next);
        props.onOpenChange?.(next);
    };

    useDismiss(open, () => rootRef, () => updateOpen(false));

    createEffect(() => {
        if (!open() || props.items.length === 0) return;

        const place = () => {
            const rect = buttonRef.getBoundingClientRect();
            const maxLeft = window.innerWidth - MIN_PANEL_WIDTH - EDGE;
            const left = Math.max(EDGE, Math.min(rect.left, maxLeft));
            const right = Math.max(EDGE, Math.min(
                window.innerWidth - rect.right,
                maxLeft,
            ));

            setPos({
                left: props.align !== "right" ? left : undefined,
                right: props.align === "right" ? right : undefined,
                top: props.placement !== "top" ? rect.bottom + GAP : undefined,
                bottom: props.placement === "top"
                    ? window.innerHeight - rect.top + GAP
                    : undefined,
            });
        };

        place();
        rootRef.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

        window.addEventListener("scroll", place, true);
        window.addEventListener("resize", place);
        onCleanup(() => {
            window.removeEventListener("scroll", place, true);
            window.removeEventListener("resize", place);
        });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
        const items = Array.from(
            rootRef.querySelectorAll<HTMLElement>('[role="menuitem"]'),
        );
        if (items.length === 0) return;

        let index = items.indexOf(document.activeElement as HTMLElement);
        if (index === -1) index = 0;

        switch (event.key) {
            case "ArrowDown":
            case "ArrowRight":
                event.preventDefault();
                items[(index + 1) % items.length]?.focus();
                break;
            case "ArrowUp":
            case "ArrowLeft":
                event.preventDefault();
                items[(index - 1 + items.length) % items.length]?.focus();
                break;
            case "Home":
                event.preventDefault();
                items[0]?.focus();
                break;
            case "End":
                event.preventDefault();
                items[items.length - 1]?.focus();
                break;
        }
    };

    const menuStyle = () => {
        const p = pos();
        return {
            position: "fixed" as const,
            top: p?.top !== undefined ? `${p.top}px` : undefined,
            left: p?.left !== undefined ? `${p.left}px` : undefined,
            bottom: p?.bottom !== undefined ? `${p.bottom}px` : undefined,
            right: p?.right !== undefined ? `${p.right}px` : undefined,
        };
    };

    return (
        <div ref={rootRef} class="tooltip-menu">
            <div
                ref={buttonRef}
                class={`tooltip-menu-button ${props.buttonClass ?? ""}`}
                tabIndex={0}
                aria-label={props.ariaLabel}
                aria-haspopup="menu"
                aria-expanded={open()}
                onClick={(event) => {
                    event.stopPropagation();
                    updateOpen(!open());
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        updateOpen(!open());
                    }
                }}
            >
                {open() && props.openIcon ? props.openIcon : props.icon}
            </div>
            <Show when={open() && props.items.length > 0}>
                <div
                    class="tooltip-menu-panel"
                    role="menu"
                    style={menuStyle()}
                    onKeyDown={handleKeyDown}
                >
                    <For each={props.items}>{(item) => (
                        <button
                            type="button"
                            class="menu-item"
                            role="menuitem"
                            onClick={() => {
                                updateOpen(false);
                                item.onClick();
                            }}
                        >
                            <Show when={item.icon}>
                                <span class="icon">{item.icon}</span>
                            </Show>
                            <span class="text">{item.text}</span>
                        </button>
                    )}</For>
                </div>
            </Show>
        </div>
    );
}

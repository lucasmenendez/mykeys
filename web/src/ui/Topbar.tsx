import "./Topbar.css";

import {
    JSX,
    type ParentProps,
    For,
    Show,
    createSignal,
} from "solid-js";

import { Menu } from "lucide-solid";

import { useDismiss } from "~/lib/useDismiss";

export type TopbarAction = {
    text: string;
    icon?: JSX.Element;
    handler: () => void;
    pinned?: boolean;
};

export type TopbarProps = ParentProps<{
    actions: TopbarAction[];
}>;

export default function Topbar(
    props: TopbarProps,
) {
    const [menuOpen, setMenuOpen] = createSignal(false);
    let rootRef!: HTMLDivElement;

    useDismiss(menuOpen, () => rootRef, () => setMenuOpen(false));

    return (
        <nav ref={rootRef} class="topbar">
            <div class="topbar-nav">
                <div class="mobile-menu">
                    <button
                        type="button"
                        class="hamburger"
                        aria-label="Menu"
                        aria-expanded={menuOpen()}
                        onClick={(event) => {
                            event.stopPropagation();
                            setMenuOpen(!menuOpen());
                        }}
                    >
                        <Menu size={18} />
                    </button>
                    <Show when={menuOpen()}>
                        <ul class="mobile-panel">
                            <For each={props.actions.filter((action) => !action.pinned)}>{(action) => (
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            action.handler();
                                            setMenuOpen(false);
                                        }}
                                    >
                                        <Show when={action.icon}>
                                            <span class="icon">{action.icon}</span>
                                        </Show>
                                        <span class="text">{action.text}</span>
                                    </button>
                                </li>
                            )}</For>
                        </ul>
                    </Show>
                </div>

                <ul class="actions">
                    <For each={props.actions}>{(action) => (
                        <li classList={{ pinned: action.pinned }}>
                            <button
                                type="button"
                                class="action"
                                onClick={() => action.handler()}
                            >
                                <Show when={action.icon}>
                                    <span class="icon">{action.icon}</span>
                                </Show>
                                <span class="text">{action.text}</span>
                            </button>
                        </li>
                    )}</For>
                </ul>
            </div>

            <Show when={props.children}>
                {props.children}
            </Show>
        </nav>
    )
}

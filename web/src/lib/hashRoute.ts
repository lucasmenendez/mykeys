import { createEffect, createSignal, onCleanup } from "solid-js";

export const HELP_HASH = "#/help";

export function useHashRoute(): () => string {
    const [hash, setHash] = createSignal(window.location.hash);

    createEffect(() => {
        const onHashChange = () => setHash(window.location.hash);
        window.addEventListener("hashchange", onHashChange);
        onCleanup(() => window.removeEventListener("hashchange", onHashChange));
    });

    return hash;
}

export function navigateHelp(): void {
    window.location.hash = HELP_HASH;
}

export function navigateHome(): void {
    window.location.hash = "";
}

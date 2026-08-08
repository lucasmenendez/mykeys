import { createEffect, onCleanup } from "solid-js";

/**
 * Closes a floating UI (menu, panel) on outside pointer-down or Escape while
 * `open()` is true. The effect is reactive and tears the listeners down when
 * the panel closes or the element disappears.
 */
export function useDismiss(
    open: () => boolean,
    getRef: () => HTMLElement | undefined,
    onClose: () => void,
): void {
    createEffect(() => {
        if (!open()) return;

        const element = getRef();
        if (!element) return;

        const close = () => onClose();
        const onPointerDown = (event: PointerEvent) => {
            if (!element.contains(event.target as Node)) close();
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") close();
        };

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        onCleanup(() => {
            document.removeEventListener("pointerdown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        });
    });
}

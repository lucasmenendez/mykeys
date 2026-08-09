import "./DropZone.css";

import {
    createSignal,
    onCleanup,
    onMount,
    type ParentProps,
} from "solid-js";

import { isServer } from "solid-js/web";

import {
    LoadedFile,
    LoadedFileSource,
} from "~/state/AppState";

import {
    fileToLoadedFile,
    textToLoadedFile,
} from "~/lib/vaultFile";

export type DropZoneProps = ParentProps<{
    onLoad: (file: LoadedFile) => void;
}>;

// The `?data=` URL param is a one-shot startup load: consume it only once per
// page load, not on every mount (e.g. when returning from the Help page the
// workspace remounts and must not reload a vault that is already open).
let urlDataHandled = false;

export default function DropZone(
    props: DropZoneProps,
) {
    const [dragging, setDragging] = createSignal(false);

    let dragDepth = 0;

    const loadText = (
        source: LoadedFileSource,
        content: string,
    ) => {
        const loaded = textToLoadedFile(source, content);
        if (loaded) props.onLoad(loaded);
    };

    const loadFile = async (
        source: LoadedFileSource,
        file: File,
    ) => {
        const loaded = await fileToLoadedFile(source, file);
        if (loaded) props.onLoad(loaded);
    };

    const handleDrop = async (
        event: DragEvent,
    ) => {
        event.preventDefault();

        dragDepth = 0;
        setDragging(false);

        const data = event.dataTransfer;
        if (!data) return;

        if (data.files.length > 0) {
            await loadFile(LoadedFileSource.Drop, data.files[0]);
            return;
        }

        const uriList = data.getData("text/uri-list");
        if (uriList) {
            const uri = uriList
                .split("\n")
                .map((line) => line.trim())
                .find((line) => line && !line.startsWith("#"));

            if (uri) {
                try {
                    const url = new URL(uri);
                    const content = url.searchParams.get("data");

                    loadText(LoadedFileSource.Bookmark, content ?? "");
                } catch {
                    // Invalid URL, ignore it.
                }
                return;
            }
        }

        const text = data.getData("text/plain");
        loadText(LoadedFileSource.Drop, text ?? "");
    };

    const handlePaste = async (
        event: ClipboardEvent,
    ) => {
        const target = event.target as HTMLElement | null;

        if (
            target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target?.isContentEditable
        ) return;

        const data = event.clipboardData;
        if (!data) return;

        if (data.files.length > 0) {
            event.preventDefault();
            await loadFile(LoadedFileSource.Paste, data.files[0]);
            return;
        }

        const text = data.getData("text/plain");
        if (!text) return;

        event.preventDefault();
        loadText(LoadedFileSource.Paste, text ?? "");
    };

    const handleDragEnter = (
        event: DragEvent,
    ) => {
        event.preventDefault();

        dragDepth++;
        setDragging(true);
    };

    const handleDragLeave = (
        event: DragEvent,
    ) => {
        event.preventDefault();

        dragDepth--;
        if (dragDepth <= 0) {
            dragDepth = 0;
            setDragging(false);
        }
    };

    const handleDragOver = (
        event: DragEvent,
    ) => {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };

    if (!isServer) {
        onMount(() => {
            document.addEventListener("paste", handlePaste,);

            if (urlDataHandled) return;
            urlDataHandled = true;

            const params = new URLSearchParams(
                window.location.search,
            );

            loadText(LoadedFileSource.URL, params.get("data") ?? "");
        });

        onCleanup(() => {
            document.removeEventListener("paste", handlePaste);
        });
    }

    return (
        <div
            class="drop-zone"
            classList={{
                "drag-over": dragging(),
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
            {props.children}
        </div>
    );
}
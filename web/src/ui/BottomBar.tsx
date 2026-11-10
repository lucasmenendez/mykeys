import "./BottomBar.css";

import {
    Bookmark,
    Clipboard,
    File,
    FileClock,
    FileQuestionMark,
    Link,
} from 'lucide-solid';

import {
    createSignal,
    Show,
} from "solid-js";

import { ChangeEntry, LoadedFile, LoadedFileSource } from "~/state/AppState";
import ChangeLog from "~/ui/ChangeLog";
import Tips from "~/ui/Tips";
import { useDismiss } from "~/lib/useDismiss";

type BottomBarProps = {
    file?: LoadedFile;
    changes?: ChangeEntry[];
    tips?: string[];
    tipsInterval?: number;
};

function sourceIcon(source?: LoadedFileSource) {
    switch (source) {
        case LoadedFileSource.File:
        case LoadedFileSource.Drop:
            return (<File size={14} />);
        case LoadedFileSource.Bookmark:
            return (<Bookmark size={14} />);
        case LoadedFileSource.URL:
            return (<Link size={14} />);
        case LoadedFileSource.Paste:
            return (<Clipboard size={14} />);
        case LoadedFileSource.New:
            return (<FileClock size={14} />);
        default:
            return (<FileQuestionMark size={14} />);
    }
}

export default function BottomBar(props: BottomBarProps) {
    const [changesOpen, setChangesOpen] = createSignal(false);
    let rootRef!: HTMLDivElement;

    const pendingCount = () =>
        (props.changes ?? []).filter((change) => change.type !== "open").length;

    const toggleChanges = () => setChangesOpen((open) => !open);

    useDismiss(changesOpen, () => rootRef, () => setChangesOpen(false));

    const sizeKb = () =>
        (props.file?.size ?? 0) > 0
            ? `${((props.file?.size ?? 0) / 1024).toFixed(1)} kb`
            : "";

    const changesLabel = () =>
        `${pendingCount()} ${pendingCount() === 1 ? "change" : "changes"}`;

    return (
        <div ref={rootRef} class="bottombar">
            <div class="status-left">
                <div class="file-status">
                    <Show
                        when={(props.file?.size ?? 0) > 0}
                        fallback={<span class="no-file">No file loaded</span>}>
                        <span class="icon">{sourceIcon(props.file?.source)}</span>
                        <Show when={props.file?.name}>
                            <span class="name" title={props.file?.name}>{props.file?.name}</span>
                        </Show>
                        <span class="size">{sizeKb()}</span>
                    </Show>
                </div>

                <span
                    class="changes"
                    classList={{ clickable: pendingCount() > 0 }}
                    tabIndex={pendingCount() > 0 ? 0 : undefined}
                    onClick={() => {
                        if (pendingCount() > 0) toggleChanges();
                    }}
                    onKeyDown={(event) => {
                        if (
                            pendingCount() > 0 &&
                            (event.key === "Enter" || event.key === " ")
                        ) {
                            event.preventDefault();
                            toggleChanges();
                        }
                    }}
                >
                    <FileClock size={14} />
                    {changesLabel()}
                </span>

                <Show when={changesOpen() && pendingCount() > 0}>
                    <div class="changes-panel">
                        <ChangeLog changes={props.changes} />
                    </div>
                </Show>
            </div>

            <Show when={(props.tips?.length ?? 0) > 0}>
                <Tips
                    tips={props.tips!}
                    interval={props.tipsInterval ?? 7200}
                />
            </Show>
        </div>
    );
}

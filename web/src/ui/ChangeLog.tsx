import "./ChangeLog.css";

import {
    FilePlus,
    FolderOpen,
    Pencil,
    Trash2,
} from 'lucide-solid';

import {
    createEffect,
    createSignal,
    For,
    onCleanup,
    Show,
} from "solid-js";

import {
    ChangeEntry,
    ChangeField,
    ChangeType,
    LoadedFileSource,
} from "~/state/AppState";

function fieldsHuman(fields: ChangeField[] | undefined): string {
    if (!fields || fields.length === 0) return "";
    if (fields.length === 1) return fields[0];
    return `${fields.slice(0, -1).join(", ")} and ${fields[fields.length - 1]}`;
}

function relativeTime(timestamp: number, now: number): string {
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function absoluteTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function sourceLabel(source?: LoadedFileSource): string {
    switch (source) {
        case LoadedFileSource.File:
            return "a file";
        case LoadedFileSource.Drop:
            return "a dropped file";
        case LoadedFileSource.Bookmark:
            return "a bookmark";
        case LoadedFileSource.Paste:
            return "pasted text";
        case LoadedFileSource.URL:
            return "a URL";
        default:
            return "an unknown source";
    }
}

function ChangeIcon(props: { type: ChangeType }) {
    switch (props.type) {
        case "open":
            return (<FolderOpen size={16} />);
        case "create":
            return (<FilePlus size={16} />);
        case "update":
            return (<Pencil size={16} />);
        case "delete":
            return (<Trash2 size={16} />);
    }
}

function ChangeMessage(props: { change: ChangeEntry }) {
    const change = props.change;

    if (change.type === "open") {
        if (change.source === LoadedFileSource.New) {
            return (<span>Created a new vault.</span>);
        }
        return (
            <span>
                Opened vault from <strong>{sourceLabel(change.source)}</strong>.
            </span>
        );
    }

    const verb = change.type === "create"
        ? "Created"
        : change.type === "update"
            ? "Updated"
            : "Deleted";

    const fields = fieldsHuman(change.fields);
    if (change.type === "update") {
        return (
            <span>
                Updated password for <strong>{change.alias}</strong>
                {fields ? <> — changed {fields}.</> : "."}
            </span>
        );
    }

    return (
        <span>
            {verb} password for <strong>{change.alias}</strong>
            {fields ? <> ({fields}).</> : "."}
        </span>
    );
}

export default function ChangeLog(props: {
    changes?: ChangeEntry[];
}) {
    const [now, setNow] = createSignal(Date.now());

    createEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 30_000);
        onCleanup(() => clearInterval(timer));
    });

    return (
        <Show
            when={(props.changes?.length ?? 0) > 0}
            fallback={<p class="change-log-empty">No changes yet.</p>}>
            <ol class="change-log">
                <For each={props.changes}>{(change) => (
                    <li class={change.type}>
                        <span class="icon">
                            <ChangeIcon type={change.type} />
                        </span>
                        <span class="text">
                            <ChangeMessage change={change} />
                        </span>
                        <time
                            class="time"
                            title={absoluteTime(change.timestamp)}
                        >
                            {relativeTime(change.timestamp, now())}
                        </time>
                    </li>
                )}</For>
            </ol>
        </Show>
    );
}

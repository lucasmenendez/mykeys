import {
    createContext,
    createSignal,
    onMount,
    type ParentProps,
    useContext,
} from "solid-js";

import {
    createStore,
    type SetStoreFunction,
} from "solid-js/store";

import { wasmUrl } from "~/lib/platform";

export type AppPassword = {
    id?: string;
    alias: string;
    username: string;
    password: string;
};

export enum LoadedFileSource {
    File = "file",
    Drop = "drop",
    Bookmark = "bookmark",
    Paste = "paste",
    URL = "url",
    New = "new",
}

export type LoadedFile = {
    name?: string;
    size: number;
    source: LoadedFileSource;
    content: string;
    /** Chrome bookmark this vault was opened from (extension only). */
    bookmarkId?: string;
};

export type AppState = {
    encrypted?: LoadedFile;
    passphrase?: string;
    passwords?: AppPassword[];
    query?: string;
    changes?: ChangeEntry[];
};

export type ChangeType = "open" | "create" | "update" | "delete";

export type ChangeField = "alias" | "username" | "password";

export type ChangeEntry = {
    id: number;
    type: ChangeType;
    timestamp: number;
    source?: LoadedFileSource;
    alias?: string;
    fields?: ChangeField[];
};

const ALL_FIELDS: ChangeField[] = ["alias", "username", "password"];

let nextChangeId = 1;

// Replaces `entry` in place at the index where `old` currently sits, so edits
// keep the row's original position. Appends when there is no match or the
// entry is new.
function upsertPassword(
    list: AppPassword[],
    entry: AppPassword,
    old?: AppPassword,
): AppPassword[] {
    if (!old) return [...list, { ...entry }];

    const index = list.findIndex((p) =>
        (old.id && p.id === old.id) ||
        (!old.id && p.alias === old.alias && p.username === old.username),
    );
    if (index === -1) return [...list, { ...entry }];

    const next = [...list];
    next[index] = { ...entry };
    return next;
}

// Re-encrypts a plaintext list from scratch with the given passphrase,
// chaining the exported dump through each set call. The resulting vault keeps
// the exact order of the input list.
function encryptList(
    passwords: AppPassword[],
    passphrase: string,
): { data: string } | { error: string } {
    let vault = "";
    for (const password of passwords) {
        const setResult = window.MyKeysCLI.set(
            vault,
            passphrase,
            password.alias,
            password.username,
            password.password,
        );
        if (setResult.error) return { error: setResult.error };
        vault = setResult.data;
    }
    return { data: vault };
}

function changedFields(
    oldEntry: AppPassword,
    entry: AppPassword,
): ChangeField[] {
    const fields: ChangeField[] = [];
    if (oldEntry.alias !== entry.alias) fields.push("alias");
    if (oldEntry.username !== entry.username) fields.push("username");
    if (oldEntry.password !== entry.password) fields.push("password");
    return fields;
}

const defaultState: AppState = {
    passphrase: "",
};

export type WasmStatus = "loading" | "ready" | "error";

type AppStateContextValue = {
    state: AppState;
    setState: SetStoreFunction<AppState>;
    reset: () => void;
    wasmStatus: () => WasmStatus;
};

const AppStateContext =
    createContext<AppStateContextValue>();

export function AppStateProvider(
    props: ParentProps,
) {
    const [state, setState] = createStore<AppState>(defaultState);

    const [wasmStatus, setWasmStatus] = createSignal<WasmStatus>("loading");

    const reset = () => {
        setState({
            passphrase: "",
            encrypted: undefined,
            passwords: undefined,
            query: undefined,
            changes: undefined,
        });
    };

    onMount(() => {
        void loadWasm();
    });

    async function loadWasm() {
        try {
            const go = new Go();
            const result = await WebAssembly.instantiateStreaming(
                fetch(wasmUrl()),
                go.importObject,
            );
            void go.run(result.instance);
            setWasmStatus("ready");
        } catch {
            setWasmStatus("error");
        }
    }

    return (
        <AppStateContext.Provider
            value={{
                state,
                setState,
                reset,
                wasmStatus,
            }}
        >
            {props.children}
        </AppStateContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppStateContext);
    if (!context) throw new Error(
        "useAppState must be used inside AppStateProvider",
    );
    return context;
}

export function filterPasswords(
    passwords: AppPassword[] | undefined,
    query: string,
): AppPassword[] {
    const needle = query.trim().toLowerCase();
    if (!needle) return passwords ?? [];

    return (passwords ?? []).filter((password) =>
        password.alias.toLowerCase().includes(needle) ||
        password.username.toLowerCase().includes(needle),
    );
}

export function recordChange(
    state: AppState,
    setState: SetStoreFunction<AppState>,
    entry: Omit<ChangeEntry, "id" | "timestamp">,
): void {
    const next = [
        ...(state.changes ?? []),
        {
            ...entry,
            id: nextChangeId++,
            timestamp: Date.now(),
        },
    ];
    setState("changes", next);
}

export type PasswordOpResult = { ok: true } | { ok: false; error: string };

export function persistPassword(
    state: AppState,
    setState: SetStoreFunction<AppState>,
    entry: AppPassword,
    old?: AppPassword,
): PasswordOpResult {
    const hasVault = !!state.encrypted && !!state.passphrase;
    const fields: ChangeField[] = old ? changedFields(old, entry) : ALL_FIELDS;

    // No actual modification: don't re-encrypt the vault or log a change.
    if (old && fields.length === 0) {
        return { ok: true };
    }

    if (!hasVault) {
        // No encrypted vault yet: keep the entry in memory only. The
        // encrypted file is produced later, once a passphrase is provided.
        const next = upsertPassword(state.passwords ?? [], entry, old);
        setState("passwords", next);
        recordChange(state, setState, {
            type: old ? "update" : "create",
            alias: entry.alias,
            fields,
        });
        return { ok: true };
    }

    // Existing vault.
    const content = state.encrypted?.content ?? "";
    const passphrase = state.passphrase ?? "";

    const keyChanged = !!old &&
        (old.alias !== entry.alias || old.username !== entry.username);

    if (keyChanged) {
        // The record's identity changed, so a plain `set` would append it at
        // the end of the vault. Rebuild the vault from the in-place upserted
        // list so the entry keeps its original index everywhere (table, in
        // memory vault and exported file stay consistent).
        const rebuilt = encryptList(
            upsertPassword(state.passwords ?? [], entry, old),
            passphrase,
        );
        if ("error" in rebuilt) return { ok: false, error: rebuilt.error };

        const listResult = window.MyKeysCLI.list(rebuilt.data, passphrase);
        if (listResult.error) return { ok: false, error: listResult.error };

        const passwords: AppPassword[] = JSON.parse(listResult.data);
        setState("encrypted", {
            ...state.encrypted,
            content: rebuilt.data,
            size: new TextEncoder().encode(rebuilt.data).length,
        });
        setState("passwords", passwords);
        recordChange(state, setState, {
            type: old ? "update" : "create",
            alias: entry.alias,
            fields,
        });
        return { ok: true };
    }

    // Password-only edit (or a create): a single set is enough — Go matches
    // by id and updates in place, preserving the row's position.
    const setResult = window.MyKeysCLI.set(
        content,
        passphrase,
        entry.alias,
        entry.username,
        entry.password,
    );
    if (setResult.error) return { ok: false, error: setResult.error };

    const newContent = setResult.data;
    const listResult = window.MyKeysCLI.list(newContent, passphrase);
    if (listResult.error) return { ok: false, error: listResult.error };

    const passwords: AppPassword[] = JSON.parse(listResult.data);
    setState("encrypted", {
        ...state.encrypted,
        content: newContent,
        size: new TextEncoder().encode(newContent).length,
    });
    setState("passwords", passwords);
    recordChange(state, setState, {
        type: old ? "update" : "create",
        alias: entry.alias,
        fields,
    });
    return { ok: true };
}

export function deletePassword(
    state: AppState,
    setState: SetStoreFunction<AppState>,
    entry: AppPassword,
): PasswordOpResult {
    const hasVault = !!state.encrypted && !!state.passphrase;
    if (!hasVault) {
        // No encrypted vault yet: remove from the in-memory list only.
        const base = state.passwords ?? [];
        const next = base.filter((p) => !(
            (entry.id && p.id === entry.id) ||
            (!entry.id && p.alias === entry.alias && p.username === entry.username)
        ));
        setState("passwords", next);
        recordChange(state, setState, {
            type: "delete",
            alias: entry.alias,
            fields: ALL_FIELDS,
        });
        return { ok: true };
    }

    const content = state.encrypted?.content ?? "";
    const passphrase = state.passphrase ?? "";

    const delResult = window.MyKeysCLI.del(content, passphrase, entry.id ?? "");
    if (delResult.error) return { ok: false, error: delResult.error };

    const newContent = delResult.data;
    const listResult = window.MyKeysCLI.list(newContent, passphrase);
    if (listResult.error) return { ok: false, error: listResult.error };

    const passwords: AppPassword[] = JSON.parse(listResult.data);
    setState("encrypted", {
        ...state.encrypted,
        content: newContent,
        size: new TextEncoder().encode(newContent).length,
    });
    setState("passwords", passwords);
    recordChange(state, setState, {
        type: "delete",
        alias: entry.alias,
        fields: ALL_FIELDS,
    });
    return { ok: true };
}

export function buildVaultExport(
    state: AppState,
    passphrase: string,
): string | { error: string } {
    // Same passphrase and an existing vault: the current content is already
    // the correct encrypted export.
    if (state.encrypted && passphrase === state.passphrase) {
        return state.encrypted.content;
    }

    const passwords = state.passwords ?? [];

    // An empty list still needs a valid encrypted dump: re-encrypting zero
    // entries would yield an empty string. `del` on an empty dump re-encrypts
    // the empty map, producing a valid (empty) vault.
    if (passwords.length === 0) {
        const empty = window.MyKeysCLI.del("", passphrase, "");
        if (empty.error) return { error: empty.error };
        return empty.data;
    }

    const result = encryptList(passwords, passphrase);
    if ("error" in result) return { error: result.error };
    return result.data;
}
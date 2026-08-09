import "./PasswordsList.css";

import {
    Tag,
    IdCardLanyard,
    KeyRound,
    FileDown,
    FileUp,
    EllipsisVertical,
} from 'lucide-solid';

import {
    createMemo,
    createSignal,
    For,
    Show,
} from "solid-js";

import {
    AppPassword,
    deletePassword,
    filterPasswords,
    persistPassword,
    useAppState,
} from "~/state/AppState";

import { parseCSV, toCSV } from "~/lib/csv";

import EmptyPasswords from "~/ui/EmptyPasswords";
import CopyButton from "~/ui/CopyButton";
import TooltipMenu from "~/ui/TooltipMenu";
import { Table } from "~/ui/Table";
import { toast } from "~/ui/Toaster";
import { confirm } from "~/ui/ConfirmDialog";
import EditPasswordModal from "~/components/EditPasswordModal";

const CSV_HEADER = ["alias", "username", "password"];

export default function PasswordsList() {
    const { state, setState } = useAppState();
    const [editing, setEditing] = createSignal<AppPassword | undefined>();
    let csvInput!: HTMLInputElement;

    const filtered = createMemo(() =>
        filterPasswords(state.passwords, state.query ?? ""),
    );

    const savePassword = (updated: AppPassword) => {
        const current = editing();
        if (!current) return;

        const result = persistPassword(state, setState, updated, current);
        if (result.ok) setEditing(undefined);
        else toast({ message: result.error, variant: "error" });
    };

    const exportRecords = () => {
        const rows = (state.passwords ?? []).map((item) => [
            item.alias,
            item.username,
            item.password,
        ]);
        const csv = toCSV([CSV_HEADER, ...rows]);

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "passwords.csv";
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const importRecords = async (file: File) => {
        const text = await file.text();
        const rows = parseCSV(text);

        const isHeader = (row: string[]) =>
            row.length >= 3 &&
            CSV_HEADER.every((cell, i) =>
                row[i]?.trim().toLowerCase() === cell,
            );

        const dataRows = rows.length > 0 && isHeader(rows[0])
            ? rows.slice(1)
            : rows;

        const validRows = dataRows
            .map((row) => ({
                alias: row[0]?.trim() ?? "",
                username: row[1]?.trim() ?? "",
                password: row[2] ?? "",
            }))
            .filter((item) => item.alias && item.password);

        const overwrites = validRows.filter((item) =>
            (state.passwords ?? []).some(
                (p) => p.alias === item.alias && p.username === item.username,
            ),
        ).length;

        if (overwrites > 0) {
            const ok = await confirm({
                message: `Importing will overwrite ${overwrites} existing record${overwrites === 1 ? "" : "s"} with the same alias and username. Continue?`,
                confirmLabel: "Overwrite",
                danger: true,
            });
            if (!ok) {
                toast({ message: "Import cancelled.", variant: "info" });
                return;
            }
        }

        let imported = 0;
        for (const item of validRows) {
            const old = (state.passwords ?? []).find(
                (p) => p.alias === item.alias && p.username === item.username,
            );
            const result = persistPassword(state, setState, {
                alias: item.alias,
                username: item.username,
                password: item.password,
            }, old);
            if (result.ok) imported++;
        }

        toast({
            message: `Imported ${imported} ${imported === 1 ? "record" : "records"}.`,
            variant: "success",
        });
    };

    const handleCsvChange = async (
        event: Event & { currentTarget: HTMLInputElement },
    ) => {
        const file = event.currentTarget.files?.[0];
        if (file) {
            await importRecords(file);
        }
        event.currentTarget.value = "";
    };

    return (
        <>
            <input
                ref={csvInput}
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvChange}
                hidden
            />

            <Show
                when={(state.passwords?.length ?? 0) > 0}
                fallback={<EmptyPasswords />}>
                <Show
                    when={filtered().length > 0}
                    fallback={
                        <div class="no-results">
                            No passwords match your search.
                        </div>
                    }
                >
                    <Table
                        columns={4}
                    columnWidths={[
                        "3.5rem",
                        "minmax(8rem, 1fr)",
                        "minmax(8rem, 1fr)",
                        "minmax(8rem, 1fr)",
                    ]}
                    >
                        <Table.Header sticky>
                            <Table.Cell class="table-menu-cell">
                                <TooltipMenu
                                    icon={<EllipsisVertical size={16} />}
                                    ariaLabel="Table menu"
                                    items={[
                                        {
                                            icon: <FileUp size={14} />,
                                            text: "Import",
                                            onClick: () => csvInput.click(),
                                        },
                                        ...(state.passwords?.length
                                            ? [{
                                                icon: <FileDown size={14} />,
                                                text: "Export",
                                                onClick: exportRecords,
                                            }]
                                            : []),
                                    ]}
                                />
                            </Table.Cell>
                            <Table.Cell><Tag size={16} strokeWidth={1} /> Alias</Table.Cell>
                            <Table.Cell><IdCardLanyard size={16} strokeWidth={1} /> User</Table.Cell>
                            <Table.Cell><KeyRound size={16} strokeWidth={1} /> Pass</Table.Cell>
                        </Table.Header>

                        <For each={filtered()}>{(item, index) => (
                            <Table.Row onClick={() => setEditing(item)}>
                                <Table.Cell class="row-index">{index() + 1}</Table.Cell>
                                <Table.Cell>{item.alias}</Table.Cell>
                                <Table.Cell>
                                    <CopyButton value={item.username} text={item.username}></CopyButton>
                                </Table.Cell>
                                <Table.Cell>
                                    <CopyButton value={item.password} text={"•".repeat(item.password.length)}></CopyButton>
                                </Table.Cell>
                            </Table.Row>
                        )}</For >
                    </Table>
                </Show>

                <EditPasswordModal
                    open={editing() !== undefined}
                    password={editing()}
                    onClose={() => setEditing(undefined)}
                    onSubmit={savePassword}
                    onDelete={(entry) => {
                        const result = deletePassword(state, setState, entry);
                        if (result.ok) setEditing(undefined);
                        else toast({ message: result.error, variant: "error" });
                    }}
                />
            </Show>
        </>
    );
}

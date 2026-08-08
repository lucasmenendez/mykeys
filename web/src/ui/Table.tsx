import "./Table.css";

import type { ParentProps } from "solid-js";

type TableProps = ParentProps<{
    columns: number;
    columnWidths?: (string | undefined)[];
    class?: string;
}>;

type TableRowProps = ParentProps<{
    class?: string;
    onClick?: (event: MouseEvent) => void;
}>;

type TableHeaderProps = ParentProps<{
    sticky?: boolean;
    class?: string;
}>;

type TableCellProps = ParentProps<{
    class?: string;
}>;

function TableRoot(props: TableProps) {
    const templateColumns = () => {
        if (props.columnWidths) {
            return props.columnWidths
                .map((track) => track ?? "minmax(8rem, 1fr)")
                .join(" ");
        }

        return `repeat(${props.columns}, minmax(8rem, 1fr))`;
    };

    return (
        <div class="table-wrapper">
            <div
                class={`table ${props.class ?? ""}`}
                style={{
                    "grid-template-columns": templateColumns(),
                }}
            >
                {props.children}
            </div>
        </div>
    );
}

function TableRow(props: TableRowProps) {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!props.onClick) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            props.onClick(event as unknown as MouseEvent);
        }
    };

    return (
        <div
            class={`table-row ${props.class ?? ""}`}
            classList={{ clickable: props.onClick !== undefined }}
            tabIndex={props.onClick ? 0 : undefined}
            onClick={props.onClick}
            onKeyDown={handleKeyDown}
        >
            {props.children}
        </div>
    );
}

function TableHeader(props: TableHeaderProps) {
    return (
        <div
            class={`table-header ${props.class ?? ""}`}
            classList={{
                "table-header-sticky": props.sticky,
            }}
        >
            {props.children}
        </div>
    );
}

function TableCell(props: TableCellProps) {
    return (
        <div
            class={`table-cell ${props.class ?? ""}`}
        >
            {props.children}
        </div>
    );
}

export const Table = Object.assign(TableRoot, {
    Row: TableRow,
    Header: TableHeader,
    Cell: TableCell,
});
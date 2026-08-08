import "./SearchBox.css";

import { createEffect, createSignal, onCleanup } from "solid-js";

type SearchBoxProps = {
    value?: string;
    onSearch: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
};

export default function SearchBox(props: SearchBoxProps) {
    const [value, setValue] = createSignal(props.value ?? "");
    let timer: ReturnType<typeof setTimeout> | undefined;

    const flush = (query: string) => {
        if (timer) {
            clearTimeout(timer);
            timer = undefined;
        }
        props.onSearch(query);
    };

    createEffect(() => {
        if (props.value !== undefined && props.value !== value()) {
            setValue(props.value);
        }
    });

    onCleanup(() => {
        if (timer) clearTimeout(timer);
    });

    return (<form class="searchbox" onSubmit={(event) => {
        event.preventDefault();
        flush(value());
    }}>
        <input
            type="search"
            value={value()}
            placeholder={props.placeholder ?? "Search..."}
            aria-label="Search"
            onInput={(e) => {
                const query = e.currentTarget.value;
                setValue(query);
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => flush(query), props.debounceMs ?? 300);
            }}
        />
    </form>);
}

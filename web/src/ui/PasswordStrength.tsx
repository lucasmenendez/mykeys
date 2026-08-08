import "./PasswordStrength.css";

import { createMemo, For } from "solid-js";

const CRITERIA: Array<(value: string) => boolean> = [
    (value) => value.length >= 10,
    (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
    (value) => /\d/.test(value),
    (value) => /[^a-zA-Z0-9]/.test(value),
];

const DESCRIPTIONS = [
    "More than 10 characters",
    "Uses lower and upper case letters",
    "Contains at least one number",
    "Contains at least one symbol",
];

const RATING = ["Weak", "Weak", "Ok", "Nice", "Perfect"];

export default function PasswordStrength(props: {
    value: string;
}) {
    const met = createMemo(() =>
        CRITERIA.map((criterion) => criterion(props.value)),
    );
    const count = createMemo(() =>
        met().filter(Boolean).length,
    );

    return (
        <div class="password-strength">
            <p class="rating">
                Your current password is <strong>{RATING[count()]}</strong>.
            </p>
            <ul class="criteria">
                <For each={DESCRIPTIONS}>{(description, i) => (
                    <li classList={{ met: met()[i()] }}>
                        <span class="marker" aria-hidden="true">
                            {met()[i()] ? "✓" : "•"}
                        </span>
                        {description}
                    </li>
                )}</For>
            </ul>
        </div>
    );
}

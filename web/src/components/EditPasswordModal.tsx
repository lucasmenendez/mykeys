import "./EditPasswordModal.css";

import { createEffect, createMemo, createSignal, Show } from "solid-js";

import { Eye, EyeOff } from "lucide-solid";

import Modal from "~/ui/Modal";
import PasswordStrength from "~/ui/PasswordStrength";
import { confirm } from "~/ui/ConfirmDialog";
import { AppPassword } from "~/state/AppState";

type EditPasswordModalProps = {
    open: boolean;
    password?: AppPassword;
    onClose: () => void;
    onSubmit: (data: AppPassword) => void;
    onDelete?: (entry: AppPassword) => void;
};

export default function EditPasswordModal(props: EditPasswordModalProps) {
    const [alias, setAlias] = createSignal("");
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [show, setShow] = createSignal(false);

    createEffect(() => {
        setAlias(props.password?.alias ?? "");
        setUsername(props.password?.username ?? "");
        setPassword(props.password?.password ?? "");
        setShow(false);
    });

    createEffect(() => {
        if (!props.open) {
            setAlias("");
            setUsername("");
            setPassword("");
            setShow(false);
        }
    });

    const canSubmit = createMemo(() =>
        alias().trim().length > 0 &&
        password().length > 0,
    );

    const currentPassword = () => props.password;

    const handleSubmit = (event: SubmitEvent) => {
        event.preventDefault();
        if (!canSubmit()) return;

        props.onSubmit({
            id: props.password?.id,
            alias: alias(),
            username: username(),
            password: password(),
        });
    };

    return (
        <Modal
            open={props.open}
            title={props.password ? "Update password" : "New password"}
            onClose={props.onClose}
        >
            <form class="edit-password" onSubmit={handleSubmit}>
                <label>
                    Alias
                    <input
                        type="text"
                        value={alias()}
                        onInput={(e) => setAlias(e.currentTarget.value)}
                    />
                </label>

                <label>
                    Username
                    <input
                        type="text"
                        value={username()}
                        onInput={(e) => setUsername(e.currentTarget.value)}
                    />
                </label>

                <label>
                    Password
                    <span class="password-input">
                        <input
                            type={show() ? "text" : "password"}
                            value={password()}
                            onInput={(e) => setPassword(e.currentTarget.value)}
                        />
                        <button
                            type="button"
                            class="toggle"
                            aria-label={show() ? "Hide password" : "Show password"}
                            onClick={() => setShow((v) => !v)}
                        >
                            <Show when={show()} fallback={<Eye size={16} />}>
                                <EyeOff size={16} />
                            </Show>
                        </button>
                    </span>
                </label>

                <PasswordStrength value={password()} />

                <div class="actions">
                    <Show when={currentPassword()}>
                        <button
                            type="button"
                            class="delete"
                            onClick={async () => {
                                const ok = await confirm({
                                    message: "Delete this password?",
                                    confirmLabel: "Delete",
                                    danger: true,
                                });
                                const entry = currentPassword();
                                if (ok && entry) props.onDelete?.(entry);
                            }}
                        >Delete</button>
                    </Show>
                    <button type="submit" class="contrast" disabled={!canSubmit()}>
                        {props.password ? "Save" : "Create"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

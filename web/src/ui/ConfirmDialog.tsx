import "./ConfirmDialog.css";

import { createMemo, createSignal } from "solid-js";

import Modal from "~/ui/Modal";

type ConfirmOptions = {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
};

type ConfirmRequest = ConfirmOptions & {
    resolve: (value: boolean) => void;
};

const [request, setRequest] = createSignal<ConfirmRequest | undefined>();

export function confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
        setRequest({ ...options, resolve });
    });
}

export default function ConfirmDialog() {
    const current = createMemo(() => request());

    const resolveAndClose = (value: boolean) => {
        const req = request();
        if (req) req.resolve(value);
        setRequest(undefined);
    };

    return (
        <Modal
            open={current() !== undefined}
            closeButton={false}
            onClose={() => resolveAndClose(false)}
        >
            <div class="confirm-dialog">
                <p class="message">{current()?.message}</p>
                <div class="actions">
                    <button
                        type="button"
                        class="outline contrast"
                        onClick={() => resolveAndClose(false)}
                    >
                        {current()?.cancelLabel ?? "Cancel"}
                    </button>
                    <button
                        type="button"
                        classList={{
                            contrast: !current()?.danger,
                            delete: !!current()?.danger,
                        }}
                        onClick={() => resolveAndClose(true)}
                    >
                        {current()?.confirmLabel ?? "Confirm"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

import "./SavePasswordsModal.css";

import {
    Download,
    KeyRound,
    Link,
} from 'lucide-solid';

import Modal from "~/ui/Modal";
import CopyButton from "~/ui/CopyButton";

type SavePasswordsModalProps = {
    open: boolean;
    result: string;
    fileName?: string;
    onClose: () => void;
    onChangePassphrase: () => void;
};

export default function SavePasswordsModal(props: SavePasswordsModalProps) {
    const downloadResult = () => {
        const blob = new Blob([props.result], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = props.fileName ?? "mykeys-vault.txt";
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const openResult = () => {
        const url = new URL(window.location.href);
        url.search = `data=${encodeURIComponent(props.result)}`;
        window.location.href = url.toString();
    };

    return (
        <Modal
            open={props.open}
            title="Save passwords"
            onClose={props.onClose}
        >
            <div class="save-passwords">
                <p class="hint">
                    Your passwords are encrypted with your passphrase. Copy,
                    download or open them to keep your vault.
                </p>
                <textarea
                    class="result"
                    readonly
                    rows={6}
                    value={props.result}
                    spellcheck={false}
                ></textarea>
                <div class="actions">
                    <CopyButton
                        asButton
                        class="outline contrast"
                        value={props.result}
                        text="Copy"
                    />
                    <button type="button" class="outline contrast" onClick={downloadResult}>
                        <Download size={16} />
                        Download
                    </button>
                    <button type="button" class="contrast" onClick={openResult}>
                        <Link size={16} />
                        Open
                    </button>
                </div>
                <button
                    type="button"
                    class="change-passphrase"
                    onClick={props.onChangePassphrase}
                >
                    <KeyRound size={16} />
                    Change passphrase
                </button>
            </div>
        </Modal>
    );
}

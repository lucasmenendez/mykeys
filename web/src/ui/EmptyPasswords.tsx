import "./EmptyPasswords.css";

export default function EmptyPasswords() {
    return (<div class="passwords-empty">
        <h1>No passwords here yet</h1>
        <p class="sub">Open your passwords file or bookmark to see them here.</p>
        <ul class="steps">
            <li><strong>Open file</strong> — use the button in the top bar</li>
            <li><strong>Drag &amp; drop</strong> — drop a file or bookmark anywhere</li>
            <li><strong>Paste</strong> — press <kbd>Ctrl + V</kbd> (<kbd>Cmd + V</kbd> on Mac)</li>
        </ul>
    </div>);
}
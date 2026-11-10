import "./HelpPage.css";

import type { ParentProps } from "solid-js";

import { ArrowLeft, Sparkles } from "lucide-solid";

import { navigateHome } from "~/lib/hashRoute";

function Section(props: ParentProps<{ title: string }>) {
    return (
        <section class="help-section">
            <h2>{props.title}</h2>
            {props.children}
        </section>
    );
}

export default function HelpPage() {
    return (
        <div class="help-page">
            <header class="help-topbar">
                <button
                    type="button"
                    class="back"
                    onClick={navigateHome}
                >
                    <ArrowLeft size={16} />
                    Back to app
                </button>
                <span class="brand">🔐 MyKeys.live</span>
            </header>

            <main class="help-content">
                <h1>MyKeys.live, explained</h1>
                <p class="lead">
                    A password manager that lives entirely in your browser.
                </p>

                <Section title="What it is">
                    <p>
                        MyKeys.live is a password manager with no account, no
                        server and no sync — your passwords never leave your
                        device. You keep them as one encrypted string, the{" "}
                        <strong>vault</strong>, that you carry as a bookmark or
                        a file. Without your passphrase it is unreadable noise.
                    </p>
                </Section>

                <Section title="How to use it">
                    <ol>
                        <li>
                            <strong>Add passwords</strong> — an alias, a
                            username and a password for each one.
                        </li>
                        <li>
                            <strong>Choose a strong passphrase</strong> — at
                            least 8 characters, with upper and lower case
                            letters and a number. It is the only key to your
                            vault: if you lose it, the vault cannot be
                            recovered.
                        </li>
                        <li>
                            <strong>Save</strong> — the app encrypts everything
                            and hands you the vault as text. Copy it, download
                            it, or open it as a bookmark.
                        </li>
                        <li>
                            <strong>Reopen it anytime</strong> — open a file,
                            drop it, paste it, or load your bookmark, then
                            enter the passphrase.
                        </li>
                        <li>
                            <strong>Edit, delete, search</strong>, and lock when
                            you step away. CSV import/export is available too.
                        </li>
                    </ol>
                </Section>

                <Section title="How it is made">
                    <ul class="plain">
                        <li>
                            The core is written in <strong>Go</strong> and
                            compiled to <strong>WebAssembly</strong> — a compact
                            program that runs inside your browser. The interface
                            is a thin layer over it.
                        </li>
                        <li>
                            Encryption is <strong>AES-256-GCM</strong>, a modern
                            authenticated cipher: it encrypts and detects
                            tampering, and every encryption uses a fresh random
                            nonce. Your passphrase is turned into the key, so
                            its strength is what protects the vault.
                        </li>
                        <li>
                            The result is encoded as <strong>base64url</strong>{" "}
                            — URL-safe text, the long string you copy or
                            bookmark.
                        </li>
                        <li>
                            Your data is a simple list of records (alias,
                            username, password), each tagged with an id derived
                            from its alias and username.
                        </li>
                        <li>
                            The engine is <strong>stateless</strong>: every
                            operation re-reads and re-encrypts the vault on the
                            fly, and the passphrase is not held in memory
                            between calls.
                        </li>
                        <li>
                            The interface is built with{" "}
                            <strong>SolidJS</strong> and styled with{" "}
                            <strong>PicoCSS</strong>, served as a single-page
                            app.
                        </li>
                    </ul>
                </Section>

                <Section title="Security, honestly">
                    <ul class="plain">
                        <li>
                            Security rests on <em>something you know</em> (the
                            passphrase) plus <em>something you have</em> (the
                            bookmark or file) — both are needed.
                        </li>
                        <li>Nothing is ever uploaded; there is no server to attack.</li>
                        <li>
                            Losing the passphrase means losing the vault,
                            permanently.
                        </li>
                        <li>
                            A bookmark URL may linger in your browser history —
                            treat the vault string as private.
                        </li>
                        <li>
                            The key is derived with a fast hash, so a long,
                            random passphrase matters far more than it would
                            with a slower key-derivation scheme.
                        </li>
                    </ul>
                </Section>

                <Section title="Tips">
                    <p>
                        Use a passphrase unlike any other account you have, and
                        keep a second copy of your vault file.
                    </p>
                </Section>

                <footer class="help-footer">
                    <Sparkles size={14} /> No data leaves your browser.
                </footer>
            </main>
        </div>
    );
}

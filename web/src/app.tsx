import { MetaProvider, Title } from "@solidjs/meta";

import { Show } from "solid-js";

import { AppStateProvider, useAppState } from "./state/AppState";

import PasswordsWorkspace from "~/components/PasswordsWorkspace";
import PasswordsList from "~/components/PasswordsList";
import HelpPage from "~/components/HelpPage";

import ConfirmDialog from "~/ui/ConfirmDialog";
import Toaster from "~/ui/Toaster";

import { useHashRoute } from "~/lib/hashRoute";

import "@picocss/pico/css/pico.min.css";
import "@picocss/pico/css/pico.colors.min.css";
import "./app.css";

function WasmGate() {
    const { wasmStatus } = useAppState();

    return (
        <Show when={wasmStatus() !== "ready"}>
            <div class="wasm-gate" role="status">
                <Show
                    when={wasmStatus() === "error"}
                    fallback={<p>Loading MyKeys engine…</p>}
                >
                    <p>Could not load the MyKeys engine. Reload to try again.</p>
                </Show>
            </div>
        </Show>
    );
}

export default function App() {
    const hash = useHashRoute();
    const isHelp = () => hash() === "#/help";

    return (
        <AppStateProvider>
            <MetaProvider>
                <Title>{isHelp() ? "Help · Mykeys.live" : "Mykeys.live"}</Title>

                <Show
                    when={isHelp()}
                    fallback={
                        <PasswordsWorkspace>
                            <PasswordsList></PasswordsList>
                        </PasswordsWorkspace>
                    }
                >
                    <HelpPage />
                </Show>

                <ConfirmDialog />
                <Toaster />
                <WasmGate />
            </MetaProvider>
        </AppStateProvider>
    );
}
# Web app audit

Scope: `web/` (SolidJS + SolidStart SPA). Go core (`api/`, `passwords/`,
`cmd/webassembly`), Dockerfile, Makefile, CI workflows and the root README are
**out of scope** — they are only *documented* as follow-ups where relevant.

Decisions locked in this audit:

- WASM core stays **stateless** (each call re-imports + re-exports the vault).
  The O(n²) churn is accepted for safety (no plaintext/passphrase retained in
  wasm memory between calls); see [Performance](#performance).
- Deployment target for the built SPA: **static files behind nginx**.
  See [Deployment](#deployment).

Severity legend: **[HIGH]** data loss / crash / security · **[MED]** incorrect
behavior · **[LOW]** polish / cleanup.

---

## 1. Bugs

### B1 — [HIGH] WASM race: `wasmReady` is never consumed

`loadWasm()` is async (`AppState.tsx:103-119`) and the `wasmReady` signal is
set (`setWasmReady(true)`) but **never read anywhere** (verified by grep). If
the user opens a file and unlocks before the 3.5 MB `mykeys.wasm` finishes
loading, `window.MyKeysCLI.list(...)` (`PasswordsWorkspace.tsx:137`) throws an
uncaught `TypeError` (`undefined` is not an object). There is no loading
indicator and no error surface if the wasm fails to load (the `catch` only sets
a signal nobody reads).

Fix: gate all `MyKeysCLI` calls on `wasmReady`, render a loading state, and
surface load failure with an error toast.

### B2 — [HIGH] Unlock modal can silently discard the loaded vault

The unlock `PassphraseModal` passes `onClose={reset}` (`PasswordsWorkspace.tsx:156`)
and `closeButton={false}`. Because `Modal` dismisses on ESC and on backdrop
click by default (`Modal.tsx:60-81`), an accidental ESC or backdrop click calls
`reset()` and wipes the just-loaded encrypted file — no confirmation, and no
visible close affordance.

Fix: make the unlock modal non-dismissable (`persistent`, `dismissOnOutsideClick={false}`)
and route dismissal through `confirmDiscard()` with a visible Cancel button.

### B3 — [LOW] Re-selecting the same file does not reload

`fileInput.value` is never reset (`PasswordsWorkspace.tsx:128,169`), so after
"New" picking the same file again produces no `change` event (unlike
`csvInput`, which is reset at `PasswordsList.tsx:153`).

Fix: clear `event.currentTarget.value` after reading the file.

### B4 — [LOW] Stale search text after New / Open

`reset()` clears `state.query` (`AppState.tsx:92-101`) but `SearchBox` keeps its
own internal `value` signal (`SearchBox.tsx:13`), so after a reset the input
still shows the old query even though nothing is filtered.

Fix: drive the input value from `state.query`.

### B5 — [MED] CSV import "overwrite" silently duplicates in memory mode

`importRecords` confirms "will overwrite N records" (`PasswordsList.tsx:112-144`)
and then calls `persistPassword` with no `old`. In vault mode Go's `Set`
dedupes by the alias-username id (real overwrite); in memory mode
`persistPassword` **appends**, creating duplicates for every matched row.

Fix: resolve the existing match and pass it as `old` so overwrite is real and
records a proper `update` change.

### B6 — [MED] "Change passphrase" leaves `state.passphrase` stale

Saving with a new passphrase via `SavePasswordsModal` → `handleSavePassphrase`
(`PasswordsWorkspace.tsx:59-62`) calls `buildVaultExport(state, newPass)` but
never updates `state.passphrase`. The invariant behind `buildVaultExport`'s
shortcut (`AppState.tsx:305-307`, "same passphrase → return
`state.encrypted.content`") is then broken: the next `handleSaveClick` saves
with the *old* passphrase and returns content that is encrypted with the *new*
key.

Fix: after a successful save with a different passphrase, update
`state.passphrase`.

### B7 — [MED] Cannot save a "delete everything" state

`hasSaveableChanges` requires `passwords.length > 0` (`PasswordsWorkspace.tsx:40-42`),
so after deleting all records the Save action disappears and the emptied vault
can never be persisted.

Fix: gate on a non-open change alone.

---

## 2. Dead / removable code

| Item | Location |
|------|----------|
| `wasmReady` signal (set, never read) — reworked in B1 | `AppState.tsx:90` |
| `.modal-layer` block (class never rendered) | `Modal.css:1-10` |
| Empty `.modal-dialog` rule (comment only) | `Modal.css:12-14` |
| `persistent` prop — no consumer sets it today (B2 will use it) | `Modal.tsx:15,48,57,67` |
| `Table` props `column` / `row` / `columnSpan` / `rowSpan` / `minColumnWidth` | `Table.tsx:7,22-28,92-120` |
| `CopyButton` `role` prop — never passed; renders invalid `role=""` | `CopyButton.tsx:10,73` |
| `MyKeysCLI.get` — exposed by Go wasm, never called from frontend | `global.d.ts:10` |
| `Toaster` `position` prop + 5 of 6 position classes (only `top-right` used) | `Toaster.tsx:12-18,87,111`; `Toaster.css:21-46` |
| `SearchBox` `onSubmit` + Enter path — duplicates debounced `onSearch`; both wired to same handler | `SearchBox.tsx:6-8,22-29`; `PasswordsWorkspace.tsx:186-189` |
| `dismissToast` export (used internally only) | `Toaster.tsx:52` |
| `ToastVariant.warning` — never used | `Toaster.tsx:10` |

---

## 3. Design / refactors

### D1 — `filtered` should be derived, not stored

`state.filtered` is a pure function of `passwords` + `query` but is stored and
hand-synced in 6 places (`AppState.tsx:197,241,264,290`; `PasswordsWorkspace.tsx:122,154`).
Every path that writes `passwords` must remember to write `filtered`. A
`createMemo`/selector removes the whole class of drift bugs (and simplifies B5).

### D2 — Duplicated outside-click + ESC dismissal

The same `createEffect` (pointerdown-outside + Escape → close) is copy-pasted in
`Topbar.tsx:32-49`, `BottomBar.tsx:57-74`, `PasswordsList.tsx:45-62`. Extract a
`useDismiss(ref, open)` hook.

### D3 — `PasswordsWorkspace` is an orchestrator and should be split

`PasswordsWorkspace.tsx` (229 lines) wires 4 flows (load, unlock, create, save)
and duplicates the `loadFile`/`loadText` logic already present in `DropZone`.
Extract a `useVaultActions` hook (or smaller components) and unify file/text
loading into one module.

### D4 — Search UX

- No "no results" state: a query with 0 matches renders a header-only table
  (`PasswordsList.tsx:167` gates on `passwords`, not `filtered`).
- Query is not trimmed (`filterPasswords(" foo")` finds nothing).
- `SearchBox` should reflect `state.query` (B4).

### D5 — Changelog times never tick

`relativeTime` (`ChangeLog.tsx:25-34`) is computed once at render; "just now"
stays "just now" and "1m ago" never advances. Add a periodic re-render ticker.

### D6 — No "clean after save" model

The changelog/Save never acknowledge a successful export: after saving,
`hasSaveableChanges` is still true, the Save button stays, and the bottom bar
still shows pending changes. Decide: clear non-open changes after a successful
export so pending counts reflect truly unsaved edits (the "open" entry remains).

### D7 — A11y

- Row focus is invisible: rows are `display: contents` with `tabIndex={0}`
  (`Table.tsx:57-77`), so the focus outline is not drawn. Add `:focus-visible`
  styling on the cells.
- Copy spans in the table are not keyboard-focusable (no `tabIndex`/`role`) —
  copy is mouse-only (`CopyButton.tsx:69-86`).
- Error toasts use `role="status"` — use `role="alert"` for errors.

### D8 — Misc

- `CopyToClipboard` is the function name but the component is used as
  `<CopyButton>` — rename.
- `recordChange` ids are `length + 1` — brittle if entries are ever removed;
  fine while append-only.
- `reset()` duplicates `defaultState` — keep in sync when adding fields.

---

## 4. Performance

- **O(n²) WASM churn (accepted)**: every `set`/`del` call re-runs Go
  `New` (passphrase validation) + `Import` (full decrypt + parse) + `Export`
  (full encrypt + encode). CSV import of N rows and re-encryption on save both
  cost N full vault cycles. A stateful wasm API (hold the decrypted map between
  calls) would be O(n), but it keeps plaintext + passphrase in wasm memory for
  the session. **Decision: keep stateless.** Noted for future: if vaults grow,
  add a batch API in the Go layer rather than a stateful session.
- `size` is recomputed with a fresh `TextEncoder` on every persist — negligible.
- Per-keystroke full-list filtering is fine at realistic sizes.

---

## 5. Security / privacy

- **No lock action**: passphrase + decrypted list stay in memory for the whole
  session. Add a Lock action (clears `passphrase`, `passwords`, and the derived
  list, via `confirm`).
- **`?data=` URLs**: the encrypted vault goes into history/bookmarks by design
  ("bookmark your passwords"), but URL length limits (Firefox ~64 KB–2 MB,
  Safari smaller) mean large vaults fail the Open/Bookmark flow silently.
- **Clipboard**: `navigator.clipboard.writeText` requires a secure context;
  there is no fallback, so copy fails on plain http. Add an `execCommand`
  textarea fallback.
- **No CSP / security headers**: the app itself cannot set headers; nginx must
  add `X-Content-Type-Options`, `frame-ancestors`, etc. Note `wasm_exec.js`
  should be CSP-tested before adding a strict policy.
- **`.gitignore` gaps** (`web/.gitignore`): `public/mykeys.wasm` and
  `public/wasm_exec.js` (3.5 MB build artifact) are not ignored; and the
  `.env*` rules only cover `.env*.local` (agent rules require `.env.*` /
  `*.env`).

---

## 6. Deployment

The current `npm run build` emits a **Nitro node-server** preset
(`.output/server/index.mjs`, `nitro.json: preset "node-server"`) and
`.output/public` contains **no `index.html`** — the SPA shell is generated at
request time. nginx / a static host cannot serve this as-is.

**Decision: static build + nginx.** Change `vite.config.ts` to the Nitro
**static** preset (verify an `index.html` shell is emitted for the SPA) so
`npm run build` produces a directly-servable `public/`.

Recommended `build/nginx.conf` additions (file is outside `web/` — documented
here, not edited):

```nginx
server {
    listen 80;
    root /webapp;
    index index.html;

    # allow very long ?data= bookmark URLs
    client_header_buffer_size 5120k;
    large_client_header_buffers 16 5120k;

    location / {
        try_files $uri /index.html;
    }

    # wasm MIME type + caching
    location ~* \.wasm$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options SAMEORIGIN always;
}
```

### Out of scope follow-ups (do when scope extends)

- `Makefile` (`make serve` runs `python3 -m http.server` on `web/`, which
  cannot serve the built app), `Dockerfile` (still builds the old static
  layout: `web/mykeys.wasm`, `sw.src.js` → `sw.js`, checksums), `.github/workflows/release.yml`
  (copies `web/mykeys.wasm` from the old path), root `README.md` (describes a
  "dependency-free static site, no server, offline PWA" that the SolidStart app
  is not), and CI has no frontend typecheck/test job.
- The old app was an installable **PWA with a service worker** (`sw.js`,
  offline). The new app has no SW — decide whether offline/PWA matters.
- Dependency posture: `vite 8`, `nitro 3.0.260610-beta`, `@solidjs/start ^2`,
  solid 1.9 — all bleeding-edge/beta. Consider pinning and a deliberate
  Solid 2.x upgrade path.

---

## 7. Repo hygiene

- `package.json` `name` was `example-basic` → renamed to `mykeys-web`.
- Both `package-lock.json` and `pnpm-lock.yaml` are present — one is redundant.
- `web/README.md` is scaffold boilerplate.
- No `devDependencies` at all — `typescript` added + `npm run typecheck` now a
  real check (previously `npx tsc` was npm's placeholder).
- No linter/formatter; no web tests. Go-side CI only.

---

## 8. Status (after audit fixes)

Implemented in this pass (see commit history / `git diff`):

| Item | Result |
|------|--------|
| B1 wasm race | `wasmStatus` in context + full-screen `WasmGate` overlay (loading/error) |
| B2 unlock discard | unlock modal is `persistent` + `dismissOnOutsideClick={false}`, explicit "Discard" button routed through `confirmDiscard` |
| B3 file input | `fileInput.value` cleared after read |
| B4 search sync | `SearchBox` value driven by `state.query`; `onSubmit` redundancy removed |
| B5 import overwrite | import passes matched `old` → real overwrite + `update` change in memory mode |
| B6 passphrase drift | successful export with a new passphrase adopts it into `state.passphrase` + `state.encrypted` |
| B7 delete-all save | `hasSaveableChanges` no longer requires passwords; empty vault exports a valid encrypted dump via `del("", pass, "")` |
| Dead code | removed `modal-layer`, unused `Table` props, `CopyButton.role`, `MyKeysCLI.get`, `Toaster` `position` + dead classes, `warning` variant, `dismissToast` export |
| Type hygiene | discriminated-union `PasswordOpResult`; `global.d.ts` `declare global` + `Go` typing; `skipLibCheck`; `noUnusedLocals/Parameters` |
| D1 | `filtered` is now a `createMemo` — no stored duplicate |
| D2 | `useDismiss` hook replaces 3 duplicated dismissal effects |
| D4 | trim query + "no results" empty state |
| D5 | changelog relative times tick every 30s |
| D6 | non-open changes cleared after a successful export (Save/pending reflect unsaved edits only) |
| D7/D8 | row `:focus-visible`, copy spans keyboard-focusable, error toasts `role="alert"`, `CopyButton` renamed |
| D3 | unified `lib/vaultFile.ts` (file/text → `LoadedFile`) |
| E1 | Lock action (clears passphrase + decrypted data, confirmed) |
| E2 | clipboard `execCommand` fallback |
| E3 | `web/.gitignore`: ignores `public/mykeys.wasm` + `wasm_exec.js`, full `.env.*` patterns |
| F | `npm run build` emits a static SPA shell: `.output/public/index.html` (+ `_build/assets`, wasm, `wasm_exec.js`) servable by nginx; node-server still works |

### Remaining / out of scope

- **Deploy wiring** (`Makefile`, `Dockerfile`, `.github/workflows/release.yml`,
  root `README.md`, `build/nginx.conf`): still target the old static app.
  Recommended nginx `root` is the built `.output/public` (see [Deployment](#deployment)).
- **PWA/service worker / offline** was a selling point of the old app; the
  SolidStart app has none. Decide whether to reintroduce.
- **Bleeding-edge deps** (`vite 8`, `nitro 3 beta`, `@solidjs/start ^2`):
  pin deliberately; consider the Solid 2.x path.
- **`@solidjs/router`** is an unused dependency (left to avoid touching Start's
  peer resolution).
- **No web tests / no linter**; `pnpm-lock.yaml` duplicates `package-lock.json`.

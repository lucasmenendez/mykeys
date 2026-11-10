import { store } from './state.js';
import { waitForWasm } from './wasm.js';
import { unlockScreen } from './components/unlock.js';
import { passwordTableScreen } from './components/password-table.js';
import { saveScreen } from './components/save-bar.js';

const ROOT = document.getElementById('app');

let currentCleanup = null;

function loadingScreen() {
  ROOT.innerHTML = `
    <div class="screen-centered">
      <div class="screen-panel" style="text-align: center;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">🔐</span>
        <h2>MyKeys</h2>
        <p class="text-muted">Loading…</p>
      </div>
    </div>
  `;
}

async function initWasm() {
  try {
    const go = new Go();
    const result = await WebAssembly.instantiateStreaming(
      fetch('mykeys.wasm'),
      go.importObject
    );
    go.run(result.instance);
    await waitForWasm();
    store.set('wasmReady', true);
  } catch (err) {
    console.error('WASM init failed:', err);
    ROOT.innerHTML = `
      <div class="screen-centered">
        <div class="screen-panel">
          <div class="alert alert-error">
            <strong>Failed to load the encryption engine.</strong><br>
            ${err.message || 'Unknown error'}<br><br>
            Try reloading the page.
          </div>
        </div>
      </div>
    `;
  }
}

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  if (data) {
    store.set('encryptedData', decodeURIComponent(data));
    store.set('mode', 'open');
    store.set('screen', 'unlock');
  }
}

function mountScreen() {
  const screen = store.get('screen');

  if (currentCleanup) {
    currentCleanup();
    currentCleanup = null;
  }

  ROOT.innerHTML = '';

  switch (screen) {
    case 'unlock':
      currentCleanup = unlockScreen(ROOT);
      break;
    case 'passwords':
      currentCleanup = passwordTableScreen(ROOT);
      break;
    case 'save':
      saveScreen(ROOT);
      break;
  }
}

function restoreTheme() {
  const stored = localStorage.getItem('mykeys-dark-mode');
  const dark = stored === 'true';
  store.set('darkMode', dark);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

async function main() {
  store.set('siteUrl', `${window.location.origin}${window.location.pathname}`);
  store.set('canDownload', true);
  restoreTheme();

  checkUrlParams();
  loadingScreen();

  await initWasm();

  if (!store.get('wasmReady')) return;

  mountScreen();

  store.on('screen', () => mountScreen());
  store.on('darkMode', (val) => {
    localStorage.setItem('mykeys-dark-mode', String(val));
    document.documentElement.setAttribute('data-theme', val ? 'dark' : 'light');
  });
}

main();

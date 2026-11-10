import { store } from '../state.js';
import { tryDecrypt } from '../wasm.js';
import { showToast } from './toast.js';

export function unlockScreen(container) {

  let isDestroyed = false;

  function render() {
    const mode = store.get('mode');
    const encryptedData = store.get('encryptedData');
    const passphrase = store.get('passphrase');
    const hasPreloadedData = !!encryptedData;
    const isCreate = mode === 'create' && !hasPreloadedData;

    container.innerHTML = `
      <div class="screen-centered">
        <div class="screen-panel">
          ${!isCreate && !hasPreloadedData ? `
            <h1 style="margin-bottom: 4px;">MyKeys</h1>
            <p class="text-muted mb-6">Open your encrypted passwords or create a new collection.</p>

            <div class="drop-zone mb-4" id="drop-zone">
              <span class="drop-zone-icon">📂</span>
              <p class="drop-zone-text">Drop your .mykeys file or bookmark link here</p>
              <p class="drop-zone-hint">or click to browse</p>
              <input type="file" id="file-input" accept=".mykeys,.txt,.*" style="display:none;">
            </div>

            <div class="divider-text">or paste encrypted data</div>

            <textarea
              class="textarea mb-4"
              id="data-input"
              rows="3"
              placeholder="Paste the encrypted base64 string here..."
            ></textarea>

            <div class="divider-text">or</div>

            <button type="button" class="btn btn-outline btn-full mb-6" id="create-new-btn">
              + Create new collection
            </button>
          ` : ''}
          ${isCreate ? `
            <h1 style="margin-bottom: 4px;">New collection</h1>
            <p class="text-muted mb-6">Choose a passphrase to encrypt your passwords.</p>
          ` : ''}
          ${hasPreloadedData ? `
            <h1 style="margin-bottom: 4px;">Unlock passwords</h1>
            <p class="text-muted mb-4">Enter your passphrase to decrypt the loaded data.</p>
            <div class="section mb-6">
              <p class="text-small" style="color: var(--c-text-muted);">Encrypted data loaded</p>
              <div class="text-mono mt-1" style="word-break: break-all; max-height: 48px; overflow: hidden; opacity: .6;">
                ${escapeHtml(encryptedData.substring(0, 120))}${encryptedData.length > 120 ? '…' : ''}
              </div>
            </div>
          ` : ''}

          <div class="form-group mb-3">
            <label class="label">Passphrase</label>
            <div class="input-password-group">
              <input
                type="password"
                class="input"
                id="passphrase-input"
                placeholder="Enter your passphrase"
                value="${escapeAttr(passphrase)}"
                autocomplete="new-password"
              >
              <button type="button" class="toggle-vis" id="toggle-pass" title="Show passphrase">
                ${eyeIcon()}
              </button>
            </div>
          </div>

          <div class="mb-4" id="req-indicator">
            ${reqIndicator(passphrase)}
          </div>

          <div id="error-area">${errorHtml(store.get('error'))}</div>

          <button
            type="button"
            class="btn btn-primary btn-lg btn-full"
            id="unlock-btn"
            ${!passphrase || (!isCreate && !hasPreloadedData && !encryptedData) ? 'disabled' : ''}
          >
            ${!isCreate && !hasPreloadedData ? (encryptedData ? 'Unlock' : 'Unlock') : (isCreate ? 'Create collection' : 'Unlock')}
          </button>
        </div>
      </div>
    `;

    bindEvents();
  }

  function updateReqIndicator(pp) {
    const el = container.querySelector('#req-indicator');
    if (el) el.innerHTML = reqIndicator(pp);
  }

  function updateError(msg) {
    const el = container.querySelector('#error-area');
    if (el) el.innerHTML = errorHtml(msg);
  }

  function updateUnlockButton(hasPassphrase, hasData) {
    const btn = container.querySelector('#unlock-btn');
    if (btn) {
      const mode = store.get('mode');
      const isCreate = mode === 'create' && !hasData;
      btn.disabled = !hasPassphrase || (!isCreate && !hasData);
    }
  }

  function updateEncryptedData(data) {
    const ta = container.querySelector('#data-input');
    if (ta && document.activeElement !== ta) {
      ta.value = data || '';
    }
  }

  function errorHtml(msg) {
    return msg ? `<div class="alert alert-error mb-4">${escapeHtml(msg)}</div>` : '';
  }

  function bindEvents() {
    const mode = store.get('mode');
    const encryptedData = store.get('encryptedData');
    const hasPreloadedData = !!encryptedData;
    const isCreate = mode === 'create' && !hasPreloadedData;

    if (!isCreate && !hasPreloadedData) {
      const dropZone = container.querySelector('#drop-zone');
      const fileInput = container.querySelector('#file-input');
      const dataInput = container.querySelector('#data-input');

      if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
          if (e.target.files.length === 0) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const d = String(ev.target.result).trim();
            store.set('encryptedData', d);
            store.set('mode', 'open');
          };
          reader.readAsText(e.target.files[0]);
        });

        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', () => {
          dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropZone.classList.remove('drag-over');
          const file = e.dataTransfer.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const d = String(ev.target.result).trim();
              store.set('encryptedData', d);
              store.set('mode', 'open');
            };
            reader.readAsText(file);
            return;
          }
          const text = e.dataTransfer.getData('text/uri-list').trim()
            || e.dataTransfer.getData('text/plain').trim();
          if (!text) return;
          const data = extractDataParam(text);
          if (data) {
            store.set('encryptedData', data);
            store.set('mode', 'open');
          } else {
            store.set('encryptedData', text);
            store.set('mode', 'open');
          }
        });
      }

      if (dataInput) {
        dataInput.addEventListener('input', (e) => {
          const d = e.target.value.trim();
          if (d) {
            store.set('encryptedData', d);
            store.set('mode', 'open');
          }
          updateUnlockButton(!!store.get('passphrase'), !!d);
        });
        dataInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const pp = container.querySelector('#passphrase-input');
            if (pp) pp.focus();
          }
        });
      }

      const createBtn = container.querySelector('#create-new-btn');
      if (createBtn) {
        createBtn.addEventListener('click', () => {
          store.set('mode', 'create');
          store.set('encryptedData', '');
          render();
        });
      }
    }

    const passInput = container.querySelector('#passphrase-input');
    const toggleBtn = container.querySelector('#toggle-pass');
    const unlockBtn = container.querySelector('#unlock-btn');

    if (passInput) {
      passInput.addEventListener('input', (e) => {
        const val = e.target.value;
        store.set('passphrase', val);
        store.set('error', '');
        updateReqIndicator(val);
        const ed = store.get('encryptedData');
        const m = store.get('mode');
        const isC = m === 'create' && !ed;
        updateUnlockButton(!!val, isC || !!ed);
      });

      passInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          unlockBtn?.click();
        }
      });
    }

    if (toggleBtn && passInput) {
      toggleBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        toggleBtn.innerHTML = isPass ? eyeOffIcon() : eyeIcon();
      });
    }

    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        const pp = store.get('passphrase');
        const ed = store.get('encryptedData');
        const m = store.get('mode');
        const isOpen = !!ed && m !== 'create';

        if (!pp) {
          store.set('error', 'Please enter your passphrase.');
          return;
        }
        if (isOpen) {
          if (!ed) {
            store.set('error', 'Please provide encrypted data or a file.');
            return;
          }
          const result = tryDecrypt(ed, pp);
          if (result.error) {
            const msg = result.error.includes('message authentication failed') || result.error.includes('Wrong')
              ? 'Wrong passphrase or corrupted data.'
              : result.error;
            store.set('error', msg);
            return;
          }
          store.set('passwords', result.data || []);
        } else {
          store.set('passwords', []);
        }
        store.set('screen', 'passwords');
      });
    }
  }

  function extractDataParam(text) {
    try {
      const lines = text.split('\n');
      for (const line of lines) {
        const u = new URL(line.trim());
        const data = u.searchParams.get('data');
        if (data) return data;
      }
    } catch {
      try {
        const trimmed = text.trim();
        if (!trimmed.includes('?')) return null;
        const qs = trimmed.split('?')[1];
        const params = new URLSearchParams(qs);
        const data = params.get('data');
        if (data) return data;
      } catch {}
    }
    return null;
  }

  function reqIndicator(pp) {
    const len = (pp || '').length >= 8;
    const lower = /[a-z]/.test(pp || '');
    const upper = /[A-Z]/.test(pp || '');
    const digit = /[0-9]/.test(pp || '');

    return `
      <ul class="req-list">
        <li class="req-item ${len ? 'met' : ''}">
          <span class="req-icon">${len ? '✓' : '○'}</span> 8+ characters
        </li>
        <li class="req-item ${lower ? 'met' : ''}">
          <span class="req-icon">${lower ? '✓' : '○'}</span> Lowercase letter
        </li>
        <li class="req-item ${upper ? 'met' : ''}">
          <span class="req-icon">${upper ? '✓' : '○'}</span> Uppercase letter
        </li>
        <li class="req-item ${digit ? 'met' : ''}">
          <span class="req-icon">${digit ? '✓' : '○'}</span> Number
        </li>
      </ul>
    `;
  }

  function eyeIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  }

  function eyeOffIcon() {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  const unsubError = store.on('error', () => {
    if (isDestroyed) return;
    updateError(store.get('error'));
  });

  const unsubEncryptedData = store.on('encryptedData', () => {
    if (isDestroyed) return;
    updateEncryptedData(store.get('encryptedData'));
  });

  render();

  return () => {
    isDestroyed = true;
    unsubError();
    unsubEncryptedData();
  };
}

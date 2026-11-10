import { store } from '../state.js';
import { showToast } from './toast.js';

export function saveScreen(container) {

  function render() {
    const url = store.get('bookmarkUrl') || '';
    const encryptedData = store.get('encryptedData') || '';

    container.innerHTML = `
      <div class="screen-centered">
        <div class="screen-panel">
          <div class="mb-6">
            <h1 style="margin-bottom: 8px;">Saved & encrypted</h1>
            <p class="text-muted">Your passwords are encrypted. Save this link or file to open them later.</p>
          </div>

          <div class="section mb-4">
            <p class="save-section-title">⭐ Bookmark this link</p>
            <p class="text-small text-muted mb-3">
              Copy the link and bookmark it (Ctrl+D / ⌘D). Click the bookmark to open your passwords later.
            </p>
            <div class="save-section-url">${escapeHtml(url)}</div>
            <button class="btn btn-primary btn-full" id="copy-url-btn">
              Copy link
            </button>
          </div>

          ${store.get('canDownload') !== false ? `
          <div class="section mb-4">
            <p class="save-section-title">📥 Download file</p>
            <p class="text-small text-muted mb-3">
              Save a <code>.mykeys</code> file to your device. Open it by dropping it on this page.
            </p>
            <button class="btn btn-outline btn-full" id="download-btn">
              Download .mykeys file
            </button>
          </div>` : ''}

          <div class="flex gap-2">
            <button class="btn btn-ghost btn-full" id="back-to-edit-btn">Back to edit</button>
            <button class="btn btn-outline btn-full" id="back-to-start-btn">New collection</button>
          </div>
        </div>
      </div>
    `;

    bindEvents(encryptedData);
  }

  function bindEvents(encryptedData) {
    container.querySelector('#copy-url-btn')?.addEventListener('click', async () => {
      const url = store.get('bookmarkUrl');
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied to clipboard', 'success');
      } catch {
        showToast('Could not copy. Select the link manually.', 'error');
      }
    });

    container.querySelector('#download-btn')?.addEventListener('click', () => {
      const blob = new Blob([encryptedData], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'secret.mykeys';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });

    container.querySelector('#back-to-edit-btn')?.addEventListener('click', () => {
      store.set('screen', 'passwords');
    });

    container.querySelector('#back-to-start-btn')?.addEventListener('click', () => {
      store.set('screen', 'unlock');
      store.set('passphrase', '');
      store.set('passwords', []);
      store.set('encryptedData', '');
      store.set('mode', '');
      store.set('error', '');
    });
  }

  render();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

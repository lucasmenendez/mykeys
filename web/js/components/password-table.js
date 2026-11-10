import { store, encryptPasswords } from '../state.js';
import { showToast } from './toast.js';

export function passwordTableScreen(container) {

  let isMobile = window.innerWidth < 640;
  let viewMode = isMobile ? 'list' : 'table';
  let lastPasswordsJson = '';

  function passwordsChanged() {
    const current = JSON.stringify(store.get('passwords'));
    if (current !== lastPasswordsJson) {
      lastPasswordsJson = current;
      return true;
    }
    return false;
  }

  function render() {
    const passwords = store.get('passwords') || [];
    const passphrase = store.get('passphrase');
    const filterText = store.get('filterText') || '';

    container.innerHTML = `
      ${headerHtml(passphrase)}
      <div class="toolbar" id="main-toolbar">
        <div class="toolbar-search">
          <input type="text" class="input" id="filter-input" placeholder="Search by alias…" value="${escapeAttr(filterText)}">
        </div>
        <div class="toolbar-actions">
          <button class="btn btn-icon" id="view-toggle" title="${viewMode === 'list' ? 'Switch to table' : 'Switch to list'}">
            ${viewMode === 'list' ? '☰' : '☷'}
          </button>
          <button class="btn btn-primary" id="add-btn">+ Add</button>
        </div>
      </div>
      <div id="content-area"></div>
    `;

    renderContentArea(passwords, passphrase);

    bindToolbar();
    bindContent();
  }

  function renderContentArea(passwords, passphrase) {
    const area = container.querySelector('#content-area');
    if (!area) return;

    const filterText = store.get('filterText') || '';
    const filtered = passwords.filter(p =>
      !filterText || p.alias.toLowerCase().includes(filterText.toLowerCase())
    );

    if (passwords.length === 0) {
      area.innerHTML = `
        <div class="content-area">
          <div class="empty-state">
            <span class="empty-state-icon">🔐</span>
            <p class="empty-state-text">No passwords yet.</p>
            <button class="btn btn-primary" id="add-from-empty">Add your first password</button>
          </div>
          <div class="save-section mt-4">
            <p class="save-section-title">Change passphrase?</p>
            <p class="text-small text-muted mb-3">Update your encryption passphrase before saving.</p>
            <div class="input-password-group mb-3">
              <input type="password" class="input" id="new-pp-input" placeholder="Enter passphrase…" autocomplete="new-password">
              <button type="button" class="toggle-vis" id="toggle-new-pp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            <button class="btn btn-primary" id="encrypt-empty">Encrypt & Save</button>
          </div>
        </div>
      `;
    } else {
      area.innerHTML = `
        <div class="content-area">
          ${viewMode === 'list' ? listHtml(filtered) : tableHtml(filtered)}
        </div>
        <div class="content-area" style="text-align: center; padding-top: 0;">
          <button class="btn btn-outline" id="add-bottom-btn">+ Add password</button>
        </div>
        <div class="content-area" style="padding-top: 0;">
          <div class="save-section">
            <p class="save-section-title">Ready to save?</p>
            <p class="text-small text-muted mb-3">Encrypt and get a shareable URL or file.</p>
            <button class="btn btn-primary" id="encrypt-btn">Encrypt & Save</button>
          </div>
        </div>
      `;
    }

    bindContent();
  }

  function headerHtml(passphrase) {
    const locked = !passphrase;
    return `
      <div class="app-header">
        <a class="app-brand" href="/">🔐 MyKeys</a>
        <div class="flex gap-2 items-center">
          <span class="lock-indicator ${locked ? 'locked' : 'unlocked'}">
            ${locked ? 'Locked' : 'Unlocked'}
          </span>
          <button class="theme-toggle" id="theme-toggle" title="Toggle dark mode">
            ${store.get('darkMode') ? 'Light' : 'Dark'}
          </button>
          <button class="btn btn-ghost" id="lock-btn" title="Lock and return to start">Lock</button>
        </div>
      </div>
    `;
  }

  function tableHtml(passwords) {
    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Alias</th>
              <th>Username</th>
              <th>Password</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${passwords.map((p, i) => `
              <tr>
                <td><input type="text" class="input" data-field="alias" data-idx="${i}" value="${escapeAttr(p.alias)}" placeholder="e.g. Spotify"></td>
                <td><input type="text" class="input" data-field="username" data-idx="${i}" value="${escapeAttr(p.username)}" placeholder="e.g. me@mail.com"></td>
                <td>
                  <div class="input-password-group" style="max-width:200px;">
                    <input type="password" class="input" data-field="password" data-idx="${i}" value="${escapeAttr(p.password)}" placeholder="Password" style="padding-right:36px;">
                    <button type="button" class="toggle-vis" data-toggle="${i}">
                      ${eyeIcon()}
                    </button>
                  </div>
                </td>
                <td class="col-actions">
                  <button class="btn btn-ghost btn-icon" data-copy="${i}" title="Copy">📋</button>
                  <button class="btn btn-danger-ghost btn-icon" data-delete="${i}" title="Delete">🗑</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function listHtml(passwords) {
    return `
      <div class="password-list">
        ${passwords.map((p, i) => `
          <div class="password-entry">
            <div class="password-entry-header">
              <div class="password-entry-alias">
                <input type="text" class="input" data-field="alias" data-idx="${i}" value="${escapeAttr(p.alias)}" placeholder="Alias">
              </div>
              <div class="password-entry-actions">
                <button class="btn btn-ghost btn-icon" data-copy="${i}" title="Copy">📋</button>
                <button class="btn btn-danger-ghost btn-icon" data-delete="${i}" title="Delete">🗑</button>
              </div>
            </div>
            <div class="password-entry-body">
              <div class="password-entry-field">
                <span class="label">Username</span>
                <input type="text" class="input" data-field="username" data-idx="${i}" value="${escapeAttr(p.username)}" placeholder="e.g. me@mail.com">
              </div>
              <div class="password-entry-field">
                <span class="label">Password</span>
                <div class="input-password-group">
                  <input type="password" class="input" data-field="password" data-idx="${i}" value="${escapeAttr(p.password)}" placeholder="Password">
                  <button type="button" class="toggle-vis" data-toggle="${i}">
                    ${eyeIcon()}
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function bindToolbar() {
    container.querySelector('#filter-input')?.addEventListener('input', (e) => {
      store.set('filterText', e.target.value);
    });

    container.querySelectorAll('#add-btn, #add-from-empty, #add-bottom-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const passwords = store.get('passwords') || [];
        passwords.push({ alias: '', username: '', password: '' });
        store.set('passwords', [...passwords]);
      });
    });

    container.querySelector('#view-toggle')?.addEventListener('click', () => {
      viewMode = viewMode === 'list' ? 'table' : 'list';
      const tbl = container.querySelector('#main-toolbar');
      if (tbl) {
        const toggle = tbl.querySelector('#view-toggle');
        if (toggle) toggle.innerHTML = viewMode === 'list' ? '☰' : '☷';
      }
      renderContentArea(store.get('passwords') || [], store.get('passphrase'));
    });

    container.querySelector('#lock-btn')?.addEventListener('click', () => {
      store.set('screen', 'unlock');
      store.set('passphrase', '');
      store.set('passwords', []);
      store.set('encryptedData', '');
      store.set('error', '');
    });

    container.querySelector('#theme-toggle')?.addEventListener('click', () => {
      const current = store.get('darkMode');
      const next = !current;
      store.set('darkMode', next);
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    });
  }

  function bindContent() {
    const area = container.querySelector('#content-area');
    if (!area) return;

    area.querySelector('#encrypt-btn')?.addEventListener('click', doEncrypt);
    area.querySelector('#encrypt-empty')?.addEventListener('click', doEncrypt);

    const toggleBtn = area.querySelector('#toggle-new-pp');
    const ppInput = area.querySelector('#new-pp-input');

    if (toggleBtn && ppInput) {
      toggleBtn.addEventListener('click', () => {
        const isPass = ppInput.type === 'password';
        ppInput.type = isPass ? 'text' : 'password';
        toggleBtn.innerHTML = isPass ? eyeOffIcon() : eyeIcon();
      });
    }

    if (ppInput) {
      ppInput.addEventListener('input', (e) => {
        store.set('passphrase', e.target.value);
      });
      ppInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doEncrypt();
      });
    }

    area.querySelectorAll('[data-field]').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.idx);
        const field = e.target.dataset.field;
        const passwords = store.get('passwords');
        if (passwords && passwords[idx]) {
          passwords[idx][field] = e.target.value;
        }
      });
    });

    area.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = this.dataset.toggle;
        const pwInputs = area.querySelectorAll(`[data-field="password"][data-idx="${idx}"]`);
        if (pwInputs.length === 0) return;
        const input = pwInputs[0];
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        this.innerHTML = isPass ? eyeOffIcon() : eyeIcon();
      });
    });

    area.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async function() {
        const idx = parseInt(this.dataset.copy);
        const passwords = store.get('passwords');
        const pass = passwords?.[idx];
        if (!pass) return;
        try {
          await navigator.clipboard.writeText(pass.password);
          showToast('Copied', 'success');
        } catch {
          showToast('Could not copy', 'error');
        }
      });
    });

    area.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.dataset.delete);
        const passwords = store.get('passwords');
        const pass = passwords?.[idx];
        if (!pass) return;
        const label = pass.alias || 'this entry';
        if (!confirm(`Delete "${label}"?`)) return;
        passwords.splice(idx, 1);
        store.set('passwords', [...passwords]);
      });
    });
  }

  function doEncrypt() {
    const pp = store.get('passphrase');
    if (!pp) {
      showToast('Please set a passphrase first.', 'error');
      return;
    }
    const lenOk = pp.length >= 8;
    const lowerOk = /[a-z]/.test(pp);
    const upperOk = /[A-Z]/.test(pp);
    const digitOk = /[0-9]/.test(pp);
    if (!lenOk || !lowerOk || !upperOk || !digitOk) {
      showToast('Passphrase must be at least 8 characters with uppercase, lowercase, and digit.', 'error');
      return;
    }

    const result = encryptPasswords();
    if (!result) {
      if (store.get('error')) return;
      showToast('Nothing to encrypt.', 'info');
      return;
    }

    const base = store.get('siteUrl') || `${window.location.origin}${window.location.pathname}`;
    const url = `${base}?data=${encodeURIComponent(result)}`;
    store.set('bookmarkUrl', url);
    store.set('encryptedData', result);
    store.set('screen', 'save');
  }

  const unsubPasswords = store.on('passwords', () => {
    if (passwordsChanged()) {
      renderContentArea(store.get('passwords') || [], store.get('passphrase'));
    }
  });

  const unsubFilter = store.on('filterText', () => {
    renderContentArea(store.get('passwords') || [], store.get('passphrase'));
  });

  const unsubPassphrase = store.on('passphrase', () => render());

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const was = isMobile;
      isMobile = window.innerWidth < 640;
      if (was !== isMobile) {
        viewMode = isMobile ? 'list' : 'table';
        const tbl = container.querySelector('#main-toolbar');
        if (tbl) {
          const toggle = tbl.querySelector('#view-toggle');
          if (toggle) toggle.innerHTML = viewMode === 'list' ? '☰' : '☷';
        }
        renderContentArea(store.get('passwords') || [], store.get('passphrase'));
      }
    }, 150);
  };
  window.addEventListener('resize', onResize);

  render();

  return () => {
    unsubPasswords();
    unsubFilter();
    unsubPassphrase();
    window.removeEventListener('resize', onResize);
  };
}

function eyeIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function eyeOffIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

function escapeAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

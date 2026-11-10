import { createElement } from '../utils/dom.js';

let container = null;

function ensureContainer() {
  if (!container) {
    container = createElement('<div class="toast-container"></div>');
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, type = 'info', duration = 3000) {
  const c = ensureContainer();
  const toast = createElement(`
    <div class="toast toast-${type}">
      <span class="toast-msg">${escapeHtml(message)}</span>
    </div>
  `);
  c.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.style.transition = 'all .2s ease';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

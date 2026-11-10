class StateStore {
  constructor(initial = {}) {
    this._state = { ...initial };
    this._listeners = {};
    this._anyListeners = [];
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    const old = this._state[key];
    if (old === value) return;
    this._state[key] = value;
    const fns = this._listeners[key];
    if (fns) fns.forEach(fn => { try { fn(value, old); } catch (e) { console.error(e); } });
    this._anyListeners.forEach(fn => { try { fn(key, value, old); } catch (e) { console.error(e); } });
  }

  on(key, fn) {
    if (key === '*') {
      this._anyListeners.push(fn);
      return () => {
        const idx = this._anyListeners.indexOf(fn);
        if (idx !== -1) this._anyListeners.splice(idx, 1);
      };
    }
    if (!this._listeners[key]) this._listeners[key] = [];
    this._listeners[key].push(fn);
    return () => {
      const arr = this._listeners[key];
      if (!arr) return;
      const idx = arr.indexOf(fn);
      if (idx !== -1) arr.splice(idx, 1);
    };
  }

  snapshot() {
    return { ...this._state };
  }
}

export const store = new StateStore({
  screen: 'unlock',
  mode: 'open',
  encryptedData: '',
  passphrase: '',
  passwords: [],
  error: '',
  wasmReady: false,
  bookmarkUrl: '',
});

export function encryptPasswords() {
  const pwds = store.get('passwords');
  const pp = store.get('passphrase');
  if (!pwds || pwds.length === 0) return '';
  let content = '';
  for (const p of pwds) {
    const result = window.MyKeysCLI.set(content, pp, p.alias, p.username, p.password);
    if (result.error) {
      store.set('error', result.error);
      return content || '';
    }
    content = result.data;
  }
  return content;
}

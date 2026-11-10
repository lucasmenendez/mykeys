export function html(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const v = values[i];
      if (v === null || v === undefined || v === false) {
        result += '';
      } else if (Array.isArray(v)) {
        result += v.map(x => escapeAttr(x)).join('');
      } else {
        result += escapeAttr(String(v));
      }
    }
  }
  return result;
}

export function createElement(htmlString) {
  const tpl = document.createElement('template');
  tpl.innerHTML = htmlString.trim();
  return tpl.content.firstElementChild;
}

export function createElements(htmlString) {
  const tpl = document.createElement('template');
  tpl.innerHTML = htmlString.trim();
  const frag = document.createDocumentFragment();
  while (tpl.content.firstChild) {
    frag.appendChild(tpl.content.firstChild);
  }
  return frag;
}

export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function on(el, event, selectorOrFn, handler) {
  if (typeof selectorOrFn === 'function') {
    el.addEventListener(event, selectorOrFn);
  } else {
    el.addEventListener(event, (e) => {
      const target = e.target.closest(selectorOrFn);
      if (target && el.contains(target)) {
        handler.call(target, e);
      }
    });
  }
}

function escapeAttr(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function fix(content) {
    document.addEventListener('DOMContentLoaded', () => {
        var div = document.getElementById("short");
        if (!div) {
            var div = document.createElement('div');
            div.id = 'short';
        } else {
            console.log("As script")
            const short = document.querySelector('#short');
            short.parentNode.removeChild(short);    
        }
        if (content) {
          div.innerHTML = content;
        }
        document.body.appendChild(div);
    });
}

function createShortClass(cssUrl) {
    return class Short extends HTMLElement {
        constructor() {
            super();

            const shadow = this.attachShadow({ mode: 'open' });

            shadow.innerHTML = `
                <slot name="title">Default Title Here!!!</slot>
            `;

            if (!cssUrl) {
                return;
            }

            fetch(cssUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Unable to load ${cssUrl}`);
                    }
                    return response.text();
                })
                .then(css => {
                    const style = document.createElement('style');
                    style.textContent = css;
                    shadow.prepend(style);
                })
                .catch(console.error);
        }

        render(content) {
            const slot = this.shadowRoot.querySelector('slot[name="title"]');
            slot.innerHTML = content;
        }
    };
}

/* shadow fix */
export function sfix(txt, cssUrl, elem  = 'short-app') {
    document.addEventListener('DOMContentLoaded', () => {
        const el = document.createElement(elem);
        el.id = elem;
        document.body.appendChild(el);

        if (!customElements.get(elem)) {
            customElements.define(elem, createShortClass(cssUrl));
        }

        el.render(txt)
    });
}

/* ─────────────────────────────────────────────────────────────
   tgl(key, elements)
   Reactive show/hide toggle.

   Given a map of element ids → visibility (true = visible, false = hidden),
   sets up a reactive boolean property on window and an init script that
   syncs each element's 'hidden' class to the current value.

   Returns:
     init    — <script> block to embed in the template
     show(id) — inline onclick expression to show element `id`
     hide(id) — inline onclick expression to hide element `id`
     toggle(id) — inline onclick expression to flip element `id`
   ───────────────────────────────────────────────────────────── */
export function tgl(elements) {
    const id = Math.random().toString(36).slice(2, 8);
    const prop = `__tgl:${id}`;
    const keys = Object.keys(elements);
    const initialValue = Object.values(elements).includes(false) ? false : true;

    const init = `<script>
(function() {
    var _val = ${JSON.stringify(initialValue)};
    var _els = ${JSON.stringify(elements)};
    function _sync(v) {
        Object.keys(_els).forEach(function(k) {
            var el = document.getElementById(k);
            if (!el) return;
            if (v === _els[k]) el.classList.remove('hidden');
            else el.classList.add('hidden');
        });
    }
    Object.defineProperty(window, '${prop}', {
        get: function() { return _val; },
        set: function(v) { _val = v; _sync(v); }
    });
    _sync(_val);
})();
<\/script>`;

    function expr(id, val) {
        return `window['${prop}'] = ${JSON.stringify(val)}; return false;`;
    }

    const toggle = (id) => `window['${prop}'] = !window['${prop}']; return false;`;
    const controller = (id) => toggle(id);

    return Object.assign(controller, {
        init,
        show: (id) => expr(id, true),
        hide: (id) => expr(id, false),
        toggle,
    });
}

/* Helpers */

export function lnk({ ref, txt, cls }) {
    return (`<a href="${ref}" class="${cls}">${txt}</a>`);
}

export function btn( {txt = null, cls = null, clk = null}) {
    return (
        `<button type="submit" onClick="${clk}" class="${cls}">${txt}</button>`
    )
}

export function txt(txts) {
    return txts;
}

export function inp({ lbl = null, ph = null, ty = 'text', cls = null }) {
  var str = ' <input type="'+ty+'" '
  if (cls) {
    str += ' class="'+cls+'"'
  }
  if (lbl) {
    str = '<label>' + lbl + str
  }
  if (ph) {
    str += ' placeholder = "'.concat(ph).concat('"')
  }

  str += ' />';
  if (lbl) {
    str += '</label>';
  }

  return (
    str
  )

}


/* ─────────────────────────────────────────────────────────────
   st(key | state, opts)

   Reactive state for short components.

   String form — shorthand for a reactive <span>:
     st('count')  →  <span data-st="count"></span>

   Object form — full component setup:
     const s = st({ count: 0, step: 1 });
     return `<p>${st('count')}</p>
       <button onclick="${s.set('count', +1)}">+</button>
       <button onclick="${s.set('count', -1)}">−</button>` + s.init();

   s.set(key, delta) generates an inline expression that mutates a
   reactive property by the given delta (e.g. +1 → "+= 1", -2 → "-= 2",
   or any plain number → "= N").

   opts.elAttr: the data attribute to use (default: "data-st")
   ───────────────────────────────────────────────────────────── */
export function st(key, opts = {}) {
    if (typeof key === 'string') {
        const { elAttr = 'data-st' } = opts;
        return `<span ${elAttr}="${key}"></span>`;
    }

    const { elAttr = 'data-st', scoped = false } = opts;
    const state = key;
    const id = Math.random().toString(36).slice(2, 8);
    const keys = Object.keys(state);
    const marker = k => scoped ? `${id}:${k}` : k;

    const bindings = keys.map(k => {
        const fullKey = `st:${id}:${k}`;
        return `"${k}": Object.defineProperty(window, '${fullKey}', {
            get: function() { return _s['${k}']; },
            set: function(v) {
                _s['${k}'] = v;
                document.querySelectorAll('[${elAttr}="${marker(k)}"]').forEach(function(el) {
                    el.textContent = v;
                });
            }
        })`;
    }).join(',\n        ');

    const init = () => `<script>
(function() {
    var _s = ${JSON.stringify(state)};
    var _sel = '[${elAttr}]';
    var _scope = '${scoped ? id + ':' : ''}';
    var _id = '${id}';
    var _api = {
        get: function(k) { return _s[k]; },
        set: function(k, v) {
            _s[k] = v;
            document.querySelectorAll('[${elAttr}="' + _scope + k + '"]').forEach(function(el) {
                el.textContent = v;
            });
        }
    };
    var _bindings = {
        ${bindings}
    };
    Object.keys(_s).forEach(function(k) {
        var name = k.charAt(0).toUpperCase() + k.slice(1);
        _api['get' + name] = function() { return _api.get(k); };
        _api['set' + name] = function(v) { _api.set(k, v); };
    });
    window['st:' + _id] = _api;
    Object.keys(_s).forEach(function(k) {
        var attr = _sel.replace('[', '').replace(']', '');
        document.querySelectorAll('[' + attr + '="' + _scope + k + '"]').forEach(function(el) {
            el.textContent = _s[k];
        });
    });
})();
<\/script>`;

    const html = keys.map(k => state[k]).join('');

    function set(k, delta) {
        const prop = `window['st:${id}:${k}']`;
        if (typeof delta === 'number' && Number.isFinite(delta)) {
            if (delta > 0) return `${prop} += ${delta}`;
            if (delta < 0) return `${prop} -= ${Math.abs(delta)}`;
            return `${prop} = 0`;
        }
        return `${prop} = ${JSON.stringify(delta)}`;
    }

    function val(k) {
        return `<span ${elAttr}="${marker(k)}">${state[k]}</span>`;
    }

    function raw(k) {
        return state[k];
    }

    function bind(key) {
        if (Array.isArray(key)) {
            const result = {};
            key.forEach(k => {
                const getState = () => state[k];
                const setter = (delta) => set(k, delta);
                result[k] = [
                    getState,
                    (arg) => {
                        if (typeof arg === 'function') return setter(arg(getState()));
                        return setter(arg);
                    }
                ];
            });
            return result;
        }

        const getState = () => state[key];
        const setter = (delta) => set(key, delta);
        return [getState, (arg) => {
            if (typeof arg === 'function') return setter(arg(getState()));
            return setter(arg);
        }];
    }

    return { html, init, id, keys, state, set, raw, val, bind };
}

st.define = define;

export function define(state, bindKeys = Object.keys(state), opts = {}) {
    const s = st(state, opts);
    const bound = s.bind(bindKeys);
    const result = {
        init: s.init(),
        id: s.id,
        keys: s.keys,
        state: s.state,
        set: s.set,
        raw: s.raw,
        val: s.val,
        bind: s.bind,
    };

    bindKeys.forEach(k => {
        const [get, set] = bound[k];
        result[`get${capitalize(k)}`] = get;
        result[`set${capitalize(k)}`] = set;
    });

    return result;
}

function capitalize(s) { return s[0].toUpperCase() + s.slice(1); }

var stateObj = new Map();

export function state({ of, val = 0 }) {
    const initialValue = typeof val === 'string' && val.trim() !== '' && Number.isFinite(Number(val))
        ? Number(val)
        : val;
    const state = { [of]: initialValue };
    const accessors = define(state, [of], { scoped: true });
    const { init, id, raw, set } = accessors;
    const get = accessors[`get${capitalize(of)}`];
    const update = accessors[`set${capitalize(of)}`];
    const namedInit = init.replace(
        '</script>',
        `window['st:${of}'] = window['st:${id}'];
window['get${capitalize(of)}'] = window['st:${id}']['get${capitalize(of)}'];
window['set${capitalize(of)}'] = window['st:${id}']['set${capitalize(of)}'];
</script>`
    );
    stateObj.set(of, { id, val, raw, set, get, update });
    return `<span data-st="${id}:${of}"></span>${namedInit}`;
}

export function gets(value) {
    const of = typeof value === 'string' ? value : value.of;
    if (typeof value === 'string') {
        return `window['st:${of}'].get${capitalize(of)}()`;
    }
    const { raw } = stateObj.get(of);
    return raw(of);
}

export function upds(of, to) {
    const value = typeof to === 'string' && to.startsWith('window[')
        ? `(${to})`
        : JSON.stringify(to);
    return `window['st:${of}'].set${capitalize(of)}(${value})`;
}

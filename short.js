export function fix(content) {
    document.addEventListener('DOMContentLoaded', () => {
        var div = document.getElementById("short");
        console.log("div == " + JSON.stringify(div))
        if (!div) {
            console.log("Create short div");
            var div = document.createElement('div');
            div.id = 'short';
        } else {
            console.log("As script")
            const short = document.querySelector('#short');

            const html = short.outerHTML;
            short.parentNode.removeChild(short);
            console.log(html);
               console.log('Copied text:', html);
    console.log(
        'Still in DOM:',
        document.querySelector('#short')
    );
        }
        if (content) {
          div.innerHTML = content;
        }
        document.body.appendChild(div);
        console.log("Fixed " + Object.keys(this));
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
    // String form: shorthand for a reactive span
    if (typeof key === 'string') {
        const { elAttr = 'data-st' } = opts;
        return `<span ${elAttr}="${key}"></span>`;
    }

    // Object form: full reactive state setup
    const {
        elAttr = 'data-st',  // e.g. "data-st" → <span data-st="count">
    } = opts;

    const state = key;
    const id = Math.random().toString(36).slice(2, 8);
    const keys = Object.keys(state);

    // Build reactive window bindings for each state key
    // e.g. window['st:abc123:count'] → setter updates all [data-st="count"] elements
    const bindings = keys.map(k => {
        const fullKey = `st:${id}:${k}`;
        return `"${k}": Object.defineProperty(window, '${fullKey}', {
            get: function() { return _s['${k}']; },
            set: function(v) {
                _s['${k}'] = v;
                document.querySelectorAll('[${elAttr}="${k}"]').forEach(function(el) {
                    el.textContent = v;
                });
            }
        })`;
    }).join(',\n        ');

    const init = function() {
        return `<script>
(function() {
    var _s = ${JSON.stringify(state)};
    var _sel = '[${elAttr}]';
    var _id = '${id}';
    var _bindings = {
        ${bindings}
    };
    // Initialize reactive elements with current state
    Object.keys(_s).forEach(function(k) {
        var attr = _sel.replace('[', '').replace(']', '');
        document.querySelectorAll('[' + attr + '="' + k + '"]').forEach(function(el) {
            el.textContent = _s[k];
        });
    });
})();
<\/script>`;
    };

    // Build HTML snippet with initial values embedded
    // Caller inserts this into their template
    const html = keys.map(k => state[k]).join('');

    // set(key, delta) → inline expression that mutates the reactive property
    // Positive delta → "+= N", negative delta → "-= |N|", otherwise "= val"
    function set(k, delta) {
        const prop = `window['st:${id}:${k}']`;
        if (typeof delta === 'number' && Number.isFinite(delta)) {
            if (delta > 0) return `${prop} += ${delta}`;
            if (delta < 0) return `${prop} -= ${Math.abs(delta)}`;
            return `${prop} = 0`;
        }
        return `${prop} = ${JSON.stringify(delta)}`;
    }

    // val(key) → <span data-st="key">initialVal</span> shorthand
    function val(k) {
        return `<span ${elAttr}="${k}">${state[k]}</span>`;
    }

    // raw(key) → initial value of that state key
    function raw(k) {
        return state[k];
    }

    return { html, init, id, keys, state, set, raw, val };
}



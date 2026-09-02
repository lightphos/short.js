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
   st(state, opts)

   Reactive state for short components.

   Usage in a component:
     export function myComp() {
       const { html, init } = st({ count: 0, step: 1 });
       return html + init();
     }

   In the template, use ${key} for initial values and
   data-st="key" for reactive elements that update automatically.
   Use window['st:{id}:{key}'] (bracket notation!) in event handlers,
   because the property name contains colons.

   Example:
     return `<div>
       Count: <span data-st="count">${count}</span>
       <button onclick="window['st:${id}:count'] += window['st:${id}:step']">+</button>
     </div>` + init();

   opts.elAttr: the data attribute to use (default: "data-st")
   ───────────────────────────────────────────────────────────── */
export function st(state = {}, opts = {}) {
    const {
        elAttr = 'data-st',  // e.g. "data-st" → <span data-st="count">
    } = opts;

    const id = Math.random().toString(36).slice(2, 8);
    const keys = Object.keys(state);

    // Build reactive window bindings for each state key
    // e.g. window['st:abc123:count'] → setter updates all [data-st="count"] elements
    const bindings = keys.map(key => {
        const fullKey = `st:${id}:${key}`;
        return `"${key}": Object.defineProperty(window, '${fullKey}', {
            get: function() { return _s['${key}']; },
            set: function(v) {
                _s['${key}'] = v;
                document.querySelectorAll('[${elAttr}="${key}"]').forEach(function(el) {
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
    Object.keys(_s).forEach(function(key) {
        document.querySelectorAll('[' + _sel.replace('[', '').replace(']', '') + '="' + key + '"]').forEach(function(el) {
            el.textContent = _s[key];
        });
    });
})();
<\/script>`;
    };

    // Build HTML snippet with initial values embedded
    // Caller inserts this into their template
    const html = keys.map(key => state[key]).join('');

    return { html, init, id, keys, state };
}



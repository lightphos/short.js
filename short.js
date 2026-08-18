
async function createShort(root) {
    const { createRoot } = await import("https://esm.sh/react-dom/client");

    return createRoot(root)
}

async function initFix(content) {
    console.log("Fix content " + content)

    var sdiv = document.getElementById("short");
    if (!sdiv) {
        var div = document.createElement('div');
        div.id = 'short';
        sdiv = div;
        document.body.appendChild(sdiv);
    } 

    console.log(sdiv)
    let root = await createShort(sdiv)
    console.log(root)
    root.render(content)
}

export function fix(content) {
    if (document.readyState !== "loading") {
      initFix(content);
      return this;
    }

    document.addEventListener("DOMContentLoaded", () => initFix(content));
    return this;
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

export function inp({ lbl = null, ph = null, ty = 'text' }) {
  var str = ' <input type="'+ty+'" '
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

const _shortMap = new Map()

export function store(val) {
  const key = crypto.randomUUID();
  console.log(key); 

  _shortMap.set(key, val);
  return [
    () => _shortMap.get(key), 
    (newVal) => _shortMap.set(key, newVal)
  ];

}

export function value(key) {
    let v = _shortMap.get(key);
    return v
}



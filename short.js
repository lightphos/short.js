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




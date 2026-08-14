
function render(content) {
    document.addEventListener('DOMContentLoaded', () => {
    const div = document.createElement('div');
    div.id = 'short-content';
    div.innerHTML = content; // Set the content of the div';
    document.body.appendChild(div);
    }); // Append the div to the body  
}

class Short extends HTMLElement {
    constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    // ===== Markup =====
    shadow.innerHTML = `
        <slot name="title">Default Title Here!!!</slot>
    `;

    fetch('slots.css')
    .then(res => res.text())
    .then(css => {
    const style = document.createElement('style');
    style.textContent = css;
    shadow.prepend(style); 
    });
    }

    render(content) {
    this.shadowRoot.querySelector('slot').innerHTML = content;
    }
}

function short(content) {
    document.addEventListener('DOMContentLoaded', () => {

        const el = document.createElement('short-app');
        el.id = 'short';
        document.body.appendChild(el);

        customElements.define('short-app', Short);

        const short = document.getElementById('short');
        short.render(content);
    })
}

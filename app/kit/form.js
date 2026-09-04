import { tgl } from '../../short.js';

/**
 * Reusable form component.
 * @param {Object}  opts
 * @param {string}  opts.id        - form element id
 * @param {string}  opts.title     - form heading text
 * @param {string[]} opts.fields   - array of rendered field HTML strings
 * @param {string}  opts.action    - onclick expression for the submit button
 * @param {Object}  opts.toggle    - { text, link, onclick } for the footer link
 * @param {boolean} opts.init      - initial visibility: true=visible, false=hidden
 */
export function form({ id, title, fields = [], action = 'submitForm()', toggle = null, init = true }) {
    const fieldHtml = fields.join('\n');
    const cls = init ? 'bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100'
                     : 'bg-white rounded-2xl shadow-xl p-8 space-y-5 border border-gray-100 hidden';
    const toggleHtml = toggle
        ? `<div class="text-center text-sm text-gray-600">
                ${toggle.text}
                <a href="#" onclick="${toggle.onclick}"
                   class="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer">${toggle.link}</a>
           </div>`
        : '';

    return `
        <form id="${id}" class="${cls}">
            <h2 class="text-3xl font-bold text-center text-gray-800">${title}</h2>
            ${fieldHtml}
            <sub click="${action}"></sub>
            ${toggleHtml}
        </form>
    `;
}

export function auth() {
    const t = tgl({ 'signin-form': false, 'signup-form': true });

    return `
        ${form({
            id: 'signin-form',
            title: 'Sign In',
            fields: [usr({}), pwd({})],
            action: "alert('click')",
            init: true,   // target=false, val starts=false → visible
            toggle: {
                text: "Don't have an account?",
                link: 'Sign up',
                onclick: t.toggle(),
            },
        })}

        ${form({
            id: 'signup-form',
            title: 'Sign Up',
            fields: [usr({}), pwd({}), pwd({ placeholder: 'confirm' })],
            action: 'submitForm()',
            init: false,  // target=true, val starts=false → hidden
            toggle: {
                text: 'Already have an account?',
                link: 'Sign in',
                onclick: t.toggle(),
            },
        })}
        ${t.init}
    `;
}

export function usr({username}) {
    return `<p>
        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input type="text" 
          class='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition'
          name="username" placeholder="username" />
    </p>`;
}

export function pwd({password, placeholder}) {
    let ph = placeholder ? placeholder : 'password';
    return `<p>
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input type="password" name="password" placeholder="${ph}"
            class='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition' />
    </p>`;
}

export function sub({click}) {
    let clk = click ? click : 'submitForm()';
    return `
      <button 
        onclick="${clk}"
        class='mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md hover:shadow-lg'>
        Submit
      </button>
    `;
}
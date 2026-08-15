import { short } from '../short-api.js';

export function header({ txt }) {
    return (
        `
        <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            ${txt}
            ${short.lnk({ ref: "/", txt: "Home" , cls: "text-blue-600 hover:text-gray-800 transition" })}
            ${short.lnk({ ref: "./slots", txt: "Slots" , cls: "text-blue-600 hover:text-gray-800 transition" })}
        </div>
        </header>
        `
    );
}

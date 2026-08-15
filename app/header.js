import { lnk } from '../short.js';

export function header({ txt }) {
    return (
        `
        <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            ${txt}
            ${lnk({ ref: "/", txt: "Home" , cls: "text-blue-600 hover:text-gray-800 transition" })}
            ${lnk({ ref: "./slots", txt: "Slots" , cls: "text-blue-600 hover:text-gray-800 transition" })}
        </div>
        </header>
        `
    );
}

export function getState({gfn}) {
    return `
    <span data-st="count">${gfn()}</span>
    `;
}

export function set(val, oper) {
    return `
    <button class="ct-btn ct-btn-inc"
        onclick="${sfn(val)}">${oper}</button>
    `;
}

export function banner({v}) {
    return `
        <div class="px-4 py-2 mb-4 bg-indigo-100 text-indigo-800 rounded-lg border border-indigo-200 shadow-sm">
            <div class="font-semibold">${v}</div>
        </div>
    `;
}

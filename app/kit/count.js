import { st } from '../../short.js';

export function count({ inc = 1 }) {
    const step = parseInt(inc) || 1;
    const { getCount, setCount, init } = st.define({ count: 0 }, ['count']);
    
    return `
        <div class="ct-card">
            <h2 class="ct-title">Counter</h2>
            <p class="ct-value"><span data-st="count">${getCount()}</span></p>
            <div class="ct-btn-group">
                <button class="ct-btn ct-btn-dec"
                    onclick="${setCount(c => c - step)}">−</button>
                <button class="ct-btn ct-btn-inc"
                    onclick="${setCount(c => c + step)}">+</button>
                <button class="ct-btn ct-btn-reset"
                    onclick="${setCount(0)}">Reset</button>
            </div>
        </div>
        ${init}
    `;
}

export function defState() {
    const { getCount, setCount, init } = st.define({ count: 0 }, ['count']);
    
//    $init; // Initialize the state
    getFn = getCount;
    setFn = setCount;
    return ``;
}


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

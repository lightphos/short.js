import { st } from '../../short.js';

export function count({ inc = 1 }) {
    const s = st({ count: 0, step: parseInt(inc) || 1 });

    return `
        <div class="ct-card">
            <h2 class="ct-title">Counter</h2>
            <p class="ct-value">${s.val('count')}</p>
            <div class="ct-btn-group">
                <button class="ct-btn ct-btn-dec"
                    onclick="${s.set('count', -s.raw('step'))}">−</button>
                <button class="ct-btn ct-btn-inc"
                    onclick="${s.set('count', +s.raw('step'))}">+</button>
                <button class="ct-btn ct-btn-reset"
                    onclick="${s.set('count', 0)}">Reset</button>
            </div>
        </div>
        ${s.init()}
    `;
}

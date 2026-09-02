import { st } from '../../short.js';

export function count({ inc = 1 }) {
    const { init, id } = st({ count: 0, step: parseInt(inc) || 1 });

    return `
        <div class="cnt-card">
            <h2 class="cnt-title">Counter</h2>
            <p class="cnt-value">
                <span data-st="count"></span>
            </p>
            <div class="cnt-btn-group">
                <button class="cnt-btn cnt-btn-dec"
                    onclick="window['st:${id}:count'] -= window['st:${id}:step']">−</button>
                <button class="cnt-btn cnt-btn-inc"
                    onclick="window['st:${id}:count'] += window['st:${id}:step']">+</button>
                <button class="cnt-btn cnt-btn-reset"
                    onclick="window['st:${id}:count'] = 0">Reset</button>
            </div>
        </div>
        ${init()}
    `;
}

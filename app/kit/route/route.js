export const defaultNavStyle = {
    navClass: 'w-full border-b border-slate-200 bg-slate-50',
    ulClass: 'flex flex-wrap items-center gap-2 p-3 m-0 list-none',
    itemClass: 'list-none',
    linkClass: 'inline-block px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors',
    activeLinkClass: 'bg-slate-200 text-slate-500 cursor-default pointer-events-none',
    activeStyle: 'background-color:#e2e8f0;color:#64748b;cursor:default;pointer-events:none;'
};

export function nav(fields = [], style = defaultNavStyle) {
    const items = Array.isArray(fields) ? fields : [];
    const resolved = { ...defaultNavStyle, ...style };
    const { navClass, ulClass, itemClass, linkClass, activeLinkClass, activeStyle, selected } = resolved;

    const links = items.map((f) => {
        const name = f && f.name ? f.name : '';
        const label = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
        const isSelected = selected && (typeof selected === 'string' ? selected === name : selected === f);
        const classes = isSelected ? `${linkClass} ${activeLinkClass}` : linkClass;
        const inlineStyle = isSelected ? ` style="${activeStyle}"` : '';
        return `<li class="${itemClass}"><a href="${name}" class="${classes}"${inlineStyle}>${label}</a></li>`;
    }).join('');

    return `
        <nav class="${navClass}">
            <ul class="${ulClass}">
                ${links}
            </ul>
        </nav>
    `;
}

export function menu(opts = {}) {
    const {
        items = [
            {name: 'home'},
            {name: 'products'},
            {name: 'services'}
        ],
        navClass,
        ulClass,
        itemClass,
        linkClass,
        activeLinkClass,
        activeStyle,
        selected
    } = opts;

    return nav(items, {
        ...defaultNavStyle,
        ...(navClass ? { navClass } : {}),
        ...(ulClass ? { ulClass } : {}),
        ...(itemClass ? { itemClass } : {}),
        ...(linkClass ? { linkClass } : {}),
        ...(activeLinkClass ? { activeLinkClass } : {}),
        ...(activeStyle ? { activeStyle } : {}),
        ...(typeof selected !== 'undefined' ? { selected } : {})
    });
}

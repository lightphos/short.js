export function stxt({v}) {
    return `
        <div class="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 shadow-sm">
            <span class="font-semibold">stxt:</span> ${v}
        </div>
    `;
}

export function mtxt({v}) {
    return `
        <div class="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg border border-amber-200 shadow-sm">
            <span class="font-semibold">mtxt:</span> ${v}
        </div>
    `;
}

export function cmp({v}) {
    return `
    <div class="p-6 bg-white rounded-2xl shadow-md border border-gray-100">
        <h1 class="text-2xl font-bold text-indigo-600">cmp ${v}</h1>
        <p class="mt-2 text-gray-600">A styled component card.</p>
    </div>
    `;
}

export function bcmp({v}) {
    return `
        <button
            onclick="alert('Button clicked!')"
            class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >${v}</button>
    `;
}

export function back() {
    return `
        <div class="max-w-md mx-auto mb-6">
            <a href="../app.html" class="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition">
                <span class="text-xl">←</span>
                <span class="font-medium">Back to App</span>
            </a>
        </div>
    `;
}

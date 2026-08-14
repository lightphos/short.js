export function header({ children }) {
    return (
        `
        <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            ${children}
        </div>
        </header>
        `
    );
}

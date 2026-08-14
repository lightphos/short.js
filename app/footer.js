export function footer({ children }) {
    return (
        `
    <footer class="bg-gray-900 text-gray-300 mt-auto">
      <div class="max-w-6xl mx-auto px-4 py-8">
        ${children}
      </div>
    </footer>
        `
    );
}

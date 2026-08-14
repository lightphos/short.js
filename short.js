
function render(content) {
    document.addEventListener('DOMContentLoaded', () => {
    const div = document.createElement('div');
    div.id = 'short-content';
    div.innerHTML = content; // Set the content of the div';
    document.body.appendChild(div);
    }); // Append the div to the body  
}

# short.js

A lightweight JavaScript library for building modular web components using Shadow DOM and Web Components API.

## Features

- **Modular Components**: Easily create and reuse components.
- **Shadow DOM**: Encapsulated styles to prevent CSS collisions.
- **Lightweight**: Minimal footprint for fast loading.
- **Template-driven**: Simple API for rendering dynamic content.
- **Helper Utilities**: Convenience functions for common DOM operations.

## Installation

You can include `short.js` directly in your HTML file:

```html
<script type="module" src="./short.js"></script>
```

## Usage

### Using the `fix` function

The `fix` function injects a `div` with id `short-app` the specified content into the document body.

```javascript
import { fix } from './short.js';

fix('<h1>Hello, World!</h1>');
```

### Using the `sfix` function

The `sfix` function creates a custom element `<short-app>` and renders the provided content inside its Shadow DOM.

```javascript
import { sfix } from './short.js';

sfix('<p>This is rendered inside a Shadow DOM.</p>');
```

### Helper Utilities

short.js includes several helper functions for common DOM operations:

#### `lnk({ ref, txt, cls })`

Generates a styled anchor tag.

```javascript
import { lnk } from './short.js';

const example = lnk({ 
  ref: 'https://example.com', 
  txt: 'Click Me', 
  cls: 'text-blue-600' 
});
```

#### `btn({ txt, cls, clk })`

Generates a clickable button element.

```javascript
import { btn } from './short.js';

const example = btn({ 
  txt: 'Submit', 
  cls: 'bg-blue-600 hover:bg-blue-700', 
  clk: 'handleSubmit()' 
});
```

#### `txt(txts)`

Returns the provided text content.

```javascript
import { txt } from './short.js';

const example = txt('Hello, World!');
```

## Project Structure

- `short.js`: Core library with helper utilities (`fix`, `sfix`, `lnk`, `btn`, `txt`).
- `app/`: Contains application-specific components and logic (`app.js`, `header.js`, `footer.js`, `content.js`).
- `index.html`: Example implementation.
- `slots.css` / `slots.html`: Example usage of slots and CSS.

## License

This project is licensed under the [LICENSE](LICENSE).

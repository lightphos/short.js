# short.js

A lightweight JavaScript library for building modular web components using Shadow DOM and Web Components API.

## Features

- **Modular Components**: Easily create and reuse components.
- **Shadow DOM**: Encapsulated styles to prevent CSS collisions.
- **Lightweight**: Minimal footprint for fast loading.
- **Template-driven**: Simple API for rendering dynamic content.

## Installation

You can include `short.js` directly in your HTML file:

```html
<script type="module" src="./short.js"></script>
```

## Usage

### Using the `shorten` function

The `shorten` function injects a `div` with the specified content into the document body.

```javascript
import { shorten } from './short.js';

shorten('<h1>Hello, World!</h1>');
```

### Using the `shadow` function

The `shadow` function creates a custom element `<short-app>` and renders the provided content inside its Shadow DOM.

```javascript
import { shadow } from './short.js';

shadow('<p>This is rendered inside a Shadow DOM.</p>');
```

### The `link` utility

A helper function for generating styled anchor tags.

```javascript
import { link } from './short.js';

const myLink = link({ 
  link: 'https://example.com', 
  children: 'Click Me', 
  clazz: 'y-custom-class' 
});
```

## Project Structure

- `short.js`: Core library.
- `app/`: Contains application-specific components and logic.
- `index.html`: Example implementation.
- `slots.css` / `slots.html`: Example usage of slots and CSS.

## License

This project is licensed under the [LICENSE](LICENSE).

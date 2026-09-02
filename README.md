# short.js

A lightweight JavaScript library for building modular web components with Shadow DOM, and a compiler that transforms `.st` template files into static HTML.

## Features

- **Modular Components**: Create and reuse custom components with ES modules
- **Shadow DOM**: Encapsulated styles to prevent CSS collisions
- **ST Compiler**: Transform `.st` template files with embedded components into static HTML
- **ES Module Scripts**: Write component logic using native ES module imports
- **Tailwind CSS**: Built-in support for Tailwind CSS styling
- **Watch Mode**: Auto-recompile on file changes

## Quick Start

### Install

```bash
npm install
```

### Compile Templates

```bash
# Compile all .st files
npm run build:st

# Watch mode - recompile on changes
npm run watch:st
```

### Start Dev Server

```bash
npx http-server ./app -p 3000 --cors -c-1
```

## Template Syntax (.st Files)

Create `.st` files with HTML and embedded component scripts:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>My App</title>
    <style src="./app.css"></style>
</head>

<body>
    <div id="short">
        <h1>Welcome</h1>
        <cmp v="1"></cmp>
        <mybutton></mybutton>
    </div>
</body>

<script type="module">
    import { txt } from './app.js';

    function cmp({v}) {
        return `<div>Component: ${v}</div>`;
    }

    function mybutton() {
        return `<button>Click me</button>`;
    }

    return { cmp, mybutton };
</script>
</html>
```

### Script Features

- **ES Module Imports**: Use `import` to include shared utilities
- **Return Object**: Export components via the `return { ... }` statement
- **Auto-discovered**: Imported functions are automatically available as components

```javascript
<script type="module">
    import { inp, btn } from './short.js';

    function usr({sh}) {
        return `<p>${sh.inp({lbl: 'Name', ph: 'Enter name'})}</p>`;
    }

    function sub({sh}) {
        return sh.btn({txt: 'Submit', cls: 'btn-primary'});
    }

    return { usr, sub };
</script>
```

### CSS Shortcut

Use `<style src="path/to.css">` as shorthand for `<link rel="stylesheet">`:

```html
<style src="./app.css"></style>
```

Compiles to:

```html
<link rel="stylesheet" href="./app.css">
```

## Helper Utilities

short.js includes helper functions passed to components as `sh`:

### `sh.inp({ lbl, ph, ty, cls })`

Generates an input field with optional label.

```javascript
sh.inp({ lbl: 'Email', ph: 'you@example.com', ty: 'email', cls: 'w-full' })
```

### `sh.btn({ txt, cls, clk })`

Generates a styled button.

```javascript
sh.btn({ txt: 'Submit', clk: 'handleClick()', cls: 'bg-blue-600' })
```

### `sh.lnk({ ref, txt, cls })`

Generates an anchor tag.

```javascript
sh.lnk({ ref: '/page', txt: 'Go to Page', cls: 'text-blue-600' })
```

### `sh.txt(content)`

Returns text content.

```javascript
sh.txt('Hello, World!')
```

## Project Structure

```
├── short.js          # Core library with helper utilities
├── compile/
│   └── cmp.mjs      # .st to .html compiler
├── app/
│   ├── app.st       # Template source files
│   ├── app.html     # Compiled output
│   ├── app.css      # Tailwind CSS (compile with `npm run tw`)
│   └── app.js       # Shared component functions
└── Makefile          # Build shortcuts
```

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run build:st` | Compile all `.st` files |
| `npm run watch:st` | Watch and recompile on changes |
| `npm run tw` | Build Tailwind CSS |
| `make twi` | Install Tailwind dependencies |
| `make all` | Start HTTP server |

## License

MIT

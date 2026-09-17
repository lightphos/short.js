# Short

Short is a lightweight JavaScript library for building modular HTML components, a compiler for `.st` templates, and a small CLI for serving `.short` apps.

## Why use Short

Short keeps web UI composition simple:

- build reusable HTML snippets as plain JavaScript functions
- keep templates readable with `.st` files and component-style exports
- serve a `.short` app locally without a heavy framework
- use a minimal, DOM-first toolkit that ships as ES modules

It is a good fit for tiny app shells, prototype UIs, component experiments, and lightweight static-site workflows.

## Quick example

```javascript
import { inp, btn, tgl } from 'short';

const toggle = tgl({ details: true, panel: false });

const form = `
  <form>
    ${inp({ lbl: 'Email', ph: 'you@example.com', ty: 'email' })}
    ${btn({ txt: 'Save', cls: 'primary' })}
    ${toggle.init}
  </form>
`;

console.log(form);
```

This pattern lets you assemble UI sections directly from helper functions and compose them with `.st` templates when you want a more structured build flow.

## Beta publish note

This package is currently in beta. Install it with:

```bash
npm install @reuelworks/short@beta
```

For a beta npm release, publish with:

```bash
npm publish --access=public --tag beta
```

## Features

- **Component helpers** for DOM-first UI building
- **Compiler for `.st` files** into static HTML
- **CLI runner for `.short` apps** with a local dev server
- **Reactive helpers** such as `tgl()` and `st()`
- **ES module exports** for browser-side usage
- **Tailwind-friendly styling** for app templates

## Install

### From npm (beta)

```bash
npm install @reuelworks/short@beta
```

### Local development

```bash
npm install
npm test
```

## Run a `.short` app

Use the CLI with either a `.short` file or a directory of `.short` files.

### From the local repo

```bash
node ./cli.mjs ./.short --serve --port 3000
```

### From an installed package

```bash
npx short ./site.short --serve --port 3000
```

### Serve a directory

```bash
npx short ./.short --serve --port 3000
```

### Compile without serving

```bash
npx short ./site.short --out ./dist
```

### Local project helper scripts

```bash
npm run server
npm run start
npm run build:st
npm run watch:st
```

## Compile templates

The project includes the compiler in [compile/cmp.mjs](compile/cmp.mjs):

```bash
node ./compile/cmp.mjs ./app/kit/states.st --out ./dist
```

Or use the project scripts:

```bash
npm run build:st
npm run watch:st
```

## Template syntax (`.st`)

Create a `.st` file with HTML and a module script:

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

    function cmp({ v }) {
      return `<div>Component: ${v}</div>`;
    }

    function mybutton() {
      return `<button>Click me</button>`;
    }

    return { cmp, mybutton };
  </script>
</html>
```

### Script features

- Import shared utilities with normal ES modules
- Return a component map from the script
- Use helper functions from `short` by passing them as `sh`

Example:

```html
<script type="module">
  import { inp, btn } from 'short';

  function usr({ sh }) {
    return `<p>${sh.inp({ lbl: 'Name', ph: 'Enter name' })}</p>`;
  }

  function sub({ sh }) {
    return sh.btn({ txt: 'Submit', cls: 'btn-primary' });
  }

  return { usr, sub };
</script>
```

## Helper utilities

The library exposes helpers that are passed to components as `sh`.

### `inp({ lbl, ph, ty, cls })`
Common input tag short form.
```javascript
sh.inp({ lbl: 'Email', ph: 'you@example.com', ty: 'email', cls: 'w-full' })
```

### `btn({ txt, cls, clk })`
Button short form.
```javascript
sh.btn({ txt: 'Submit', clk: 'handleClick()', cls: 'bg-blue-600' })
```

### `lnk({ ref, txt, cls })`
Link (anchor) short form.
```javascript
sh.lnk({ ref: '/page', txt: 'Go to Page', cls: 'text-blue-600' })
```

### `tgl(elements)`

Creates a reactive visibility map for elements, with helper methods to show, hide, and toggle them.

```javascript
const t = sh.tgl({ hello: true, goodbye: false });
return `
  <button onclick="${t.show('hello')}">Show</button>
  <button onclick="${t.hide('goodbye')}">Hide</button>
  ${t.init}
`;
```

### `frm({ id, title, fields, cls, hdrCls, action, toggle })`

Builds a simple form fragment from an array of field strings.

```javascript
sh.frm({
  id: 'signup-form',
  title: 'Create account',
  cls: 'space-y-4',
  hdrCls: 'font-bold',
  fields: [
    sh.inp({ lbl: 'Email', ph: 'you@example.com', ty: 'email' }),
    sh.inp({ lbl: 'Password', ph: '••••••••', ty: 'password' })
  ],
  action: 'submitForm()'
})
```

## Project layout

```text
├── short.js             # Main library
├── short-api.js         # Exposed helper API
├── cli.mjs              # CLI entry for .short apps
├── compile/
│   ├── cmp.mjs          # Compiler for `.st` templates
│   └── copy-assets.mjs
├── app/                 # Example app assets
├── tests/               # Vitest checks
├── package.json
├── README.md
└── LICENSE
```

## Development scripts

```bash
npm run build:st
npm run watch:st
npm run tw
npm run test
npm run server
```

## License

MIT

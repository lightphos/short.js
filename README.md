# Short

Short is a lightweight JavaScript library for building modular HTML components, a compiler for `.st` templates, and a small CLI for serving short apps.

https://github.com/lightphos/short.js


## Why use Short

Short keeps web UI composition simple:

- build reusable HTML snippets as plain JavaScript functions
- keep templates readable with `.st` files and component-style exports
- serve a short app locally without a heavy framework
- use a minimal, DOM-first toolkit that ships as ES modules

It is a good fit for tiny app shells, prototype UIs, component experiments, and lightweight static-site workflows.

## Feature Summary

- **Component helpers** for DOM-first UI building
- **Compiler for `.st` files** into static HTML
- **CLI runner for `.short` apps** with a local dev server
- **Reactive helpers** for toggles, state and routes
- **ES module exports** for browser-side usage
- **Tailwind-friendly styling** for app templates
- **REST API helper** with JSON request and response handling

## Install

### From npm (current in beta)

```bash
npm install @reuelworks/short@beta
```

## Run a Short app

### Development
Assuming the st files are in app directory:
 
With bun (https://bun.com/)

```bash
bunx short --root app --port 3001
```

### Build distribution

```bash
bunx short app --root . --out ./dist
```


## Quick example

`form.st`

```html
<html>
<body>
  <form>
    <inp lbl='Username' ph='Enter username' ty='email' cls='frm-inp mb-5'></inp>
    <inp lbl='Password' ph='Enter password' ty='password' cls='frm-inp mb-5'></inp>
    <btn txt="Submit" cls="frm-btn" clk="submitForm()"></btn>
  </form>
</body>
<script type="module">
    import { inp, btn } from '@reuelworks/short';
    return { inp };
</script>
</html>
```

This pattern lets you assemble UI sections directly from helper functions and compose them with `.st` templates when you want a more structured and reusable build flow.

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
      <cmp v="Hello"></cmp>
      <inp lbl='Name' ph='Enter name' ty='email' cls='mb-5'></inp>
      <btn txt="Submit" cls="frm-btn" clk="submitForm()"></btn>
    </div>
  </body>

  <script type="module">
    import { inp, btn } from '@reuelworks/short';
    function cmp({ v }) {
      return `<div>${v}</div>`;
    }

    return { cmp, btn };
  </script>
</html>
```

### Detailed features

- Import shared utilities with normal ES modules
- Return a component map from the script
- Use helper functions from `short`

Example:

```html
<script type="module">
  import { inp, btn } from '@reuelworks/short';

  function usr() {
    return `<p>${inp({ lbl: 'Name', ph: 'Enter name' })}</p>`;
  }

  function sub() {
    return btn({ txt: 'Submit', cls: 'btn-primary' });
  }

  return { usr, sub };
</script>
```

## Helper utilities

The library exposes helpers that are passed to components as `sh`.

### `inp({ lbl, ph, ty, cls })`
Input tag short form.
```javascript
inp({ lbl: 'Email', ph: 'you@example.com', ty: 'email', cls: 'w-full' })
```

### `btn({ txt, cls, clk })`
Button short form.
```javascript
btn({ txt: 'Submit', clk: 'handleClick()', cls: 'bg-blue-600' })
```

### `lnk({ ref, txt, cls })`
Link (anchor) short form.
```javascript
lnk({ ref: '/page', txt: 'Go to Page', cls: 'text-blue-600' })
```

### `tgl(elements)`

Creates a reactive visibility map for elements, with helper methods to show, hide and toggle them.

```javascript
const t = tgl({ hello: true, goodbye: false });
return `
  <button onclick="${t.show('hello')}">Show</button>
  <button onclick="${t.hide('goodbye')}">Hide</button>
  ${t.init}
`;
```

### `frm({ id, title, fields, postfield, cls, hdrcls, btncls, btntxt, btnclk, action, toggle })`

Builds a form fragment from an array of field strings. The optional `postfield` and
`toggle` content is rendered after the submit button; `null` values render as empty
strings.

```javascript
frm({
  id: 'signup-form',
  title: 'Create account',
  cls: 'space-y-4',
  hdrcls: 'font-bold',
  btncls: 'btn-primary',
  btntxt: 'Create account',
  btnclk: 'submitForm()',
  fields: [
    inp({ lbl: 'Email', ph: 'you@example.com', ty: 'email' }),
    inp({ lbl: 'Password', ty: 'password' })
  ],
  postfield: '<p class="text-sm">Already have an account?</p>'
})
```

### `api`

Use the REST helper for JSON APIs. `post`, `put`, and `patch` serialize plain
JavaScript values as JSON. Responses are parsed from JSON when the server sets
an `application/json` content type; other responses are returned as text.

```javascript
import { api } from '@reuelworks/short';

const user = await api.post('/api/users', { name: 'Ada' });
const users = await api.get('/api/users');
await api.put(`/api/users/${user.id}`, { name: 'Ada Lovelace' });
await api.delete(`/api/users/${user.id}`);
```

HTTP errors reject with an error containing `status`, `statusText`, and parsed
response `data` fields. Pass fetch options such as `headers`, `credentials`,
or `signal` as the final argument to any method.

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

## License

MIT

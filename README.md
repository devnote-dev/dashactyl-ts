<h1>dashactyl-ts<img align="right" src="https://avatars.githubusercontent.com/u/96547349?s=75&v=4" alt="votion-logo"></img></h1>
<h3>A wrapper for <a href="https://github.com/Votion-Development/Dashactyl-v2">Dashactyl</a> by Votion Development.</h3>

---

## Features
- Extensive class-based structure
- Supports Dashactyl v2
- Works with JavaScript

## Installing
This package is not available on NPM yet, but it can be installed with this command:
```
npm install git+https://github.com/devnote-dev/dashactyl-ts
```

## Usage
```ts
// With TypeScript
import Client from 'dashactyl-ts';

// With JavaScript
const Client = require('dashactyl-ts');

// Initialising
const client = new Client(
    'your.dashactyl.domain',
    'dashactyl_api_key'
);

// Making requests
client.users.fetch(5).then(console.log);
```

## Documentation
Coming soon...

---

This repository is managed under the [MIT license](https://github.com/devnote-dev/dashactyl-ts/blob/master/LICENSE).

© 2021-2022 devnote-dev

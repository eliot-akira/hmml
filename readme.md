# hmml

Hypermedia markup language

## Goal

HTML transpiler for generating static pages with dynamic features

## Install

```sh
npm install -s hmml
```

## API

### render(source, options)

```js
const hmml = require('hmml')

hmml.render(source)
.then(result => console.log(result))
.catch(err => console.log(error)))
```

#### options

- `tags`

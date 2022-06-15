# ts-import-transformer

TypeScript tranformer to turn package imports into a relative path.

## Purpose

Sometimes you have TypeScript code that you intend to build for the client that also depends on a `node_modules` package.

Use this tranformer to change the package import to a relative asset path.

## Install

```bash
npm install --save-dev typescript ttypescript ts-import-transformer
```

## Config

### `tsconfig.client.json`

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "ts-import-transformer",
        "superstruct": "./assets/superstruct/index"
      }
    ]
  }
}
```

## Compile

```bash
npx ttsc -p tsconfig.client.json
```
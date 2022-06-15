# ts-import-transformer

TypeScript tranformer to turn package imports into a relative path.

## Purpose

Sometimes you have TypeScript code that you intend to build for both client and server that depends on a package.

When building for the client, you'll want to change the import to point to a relative path.

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
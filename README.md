# ts-import-transformer

TypeScript tranformer to turn package imports into a relative path.

## Purpose

Use this tranformer to change package imports to relative asset paths (usually for client builds).

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
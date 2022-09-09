# ts-import-transformer

Transform import and export paths to work on client and server environments.

## Transforms

* User-configured path replacements
* Fix `baseUrl` relative paths
* Add `.js` extension

## Install

```bash
npm install --save-dev typescript ttypescript ts-import-transformer
```

## Config

In this example, we enable the plugin and configure a path replacement for the `superstruct` library within our `tsconfig.json`:

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
npx ttsc -p tsconfig.json
```
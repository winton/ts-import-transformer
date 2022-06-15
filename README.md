# ts-import-transformer

TypeScript tranformer to turn package imports into a relative path.

## Purpose

Sometimes you have TypeScript code that you intend to build for client and server.

If that code depends on a package, you'll want to change the import to point to a relative path.

## Install

```bash
npm install --save-dev typescript ttypescript ts-import-transformer
```

## TS config

```json
{
	"compilerOptions": {
		"plugins": [
			{
				"transform": "ts-import-transformer",
				"superstruct": "./assets/superstruct/index"
			}
		]
	},
}
```

## Compile

```bash
npx ttsc -p tsconfig.json
```
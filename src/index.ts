import { lstatSync } from "fs"
import { dirname, join, relative } from "path"
import ts from "typescript"

export type ExtractElement<T> =
  T extends Array<unknown> ? T[number] : T

export type CustomTransformer = {
  [Key in keyof ts.CustomTransformers]:
    ExtractElement<ts.CustomTransformers[Key]>
}

const pathCache: Record<string, boolean> = {}

export function pathExists(path: string) {
  if (pathCache[path] !== undefined) {
    return pathCache[path]
  }

  try {
    return pathCache[path] = (lstatSync(path)).isFile()
  } catch (e) {
    return pathCache[path] = false
  }
}

export default function transformPaths(
  program: ts.Program,
  config: Record<string, string> = {}
) {
  const compilerOptions = program.getCompilerOptions()
  const cwd = program.getCurrentDirectory()
  const outDir = compilerOptions.outDir || "."
  const srcDir = compilerOptions.baseUrl || "."
  const outDirToCwd = relative(outDir, cwd)

  const replaceRegex = new RegExp(
    `^(${Object.keys(config).join("|")})$`
  )

  const innerQuoteRegex = /^["'](.+)["']$/

  function transformPath(path: string, fileName: string) {
    const ogPath = path
    const innerQuoteMatch = path.match(innerQuoteRegex)

    let replaceMatch: RegExpMatchArray | null = null
    
    if (innerQuoteMatch && innerQuoteMatch[1]) {
      path = innerQuoteMatch[1]
    } else {
      return
    }

    replaceMatch = path.match(replaceRegex)

    if (replaceMatch && replaceMatch[1]) {
      const pathToSrc = relative(dirname(fileName), srcDir)
      const relPath = join(pathToSrc, outDirToCwd, config[replaceMatch[1]])
      path = relPath[0] === "." ? relPath : `./${relPath}`
    }

    if (!path.endsWith(".js")) {
      path += ".js"
    }

    if (path[0] !== "." && pathExists(join(srcDir, path.replace(/\.[a-zA-Z]+$/, ".ts")))) {
      const pathToSrc = relative(dirname(fileName), srcDir)
      const relPath = join(pathToSrc, path)
      path = relPath[0] === "." ? relPath : `./${relPath}`
    }

    return path !== ogPath ? path : undefined
  }

  function createTransformer(context: ts.TransformationContext) {
    return (sf: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isImportDeclaration(node)) {
          const path = transformPath(node.moduleSpecifier.getText(), sf.fileName)
            
          if (path) {
            return context.factory.createImportDeclaration(
              node.decorators,
              node.modifiers,
              node.importClause,
              context.factory.createStringLiteral(path),
              node.assertClause
            )
          } else {
            return node
          }
        }

        if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
          const path = transformPath(node.moduleSpecifier.getText(), sf.fileName)
            
          if (path) {
            return context.factory.createExportDeclaration(
              node.decorators,
              node.modifiers,
              node.isTypeOnly,
              node.exportClause,
              context.factory.createStringLiteral(path),
              node.assertClause
            )
          } else {
            return node
          }
        }
  
        return ts.visitEachChild(node, visitor, context)
      }

      return ts.visitNode(sf, visitor)
    }
  }

  const plugin: CustomTransformer = {
    before: createTransformer,
    afterDeclarations:
      createTransformer as CustomTransformer['afterDeclarations']
  }

  return plugin
}
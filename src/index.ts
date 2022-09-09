import { dirname, join, relative } from "path"
import ts from "typescript"

export type ExtractElement<T> =
  T extends Array<unknown> ? T[number] : T

export type CustomTransformer = {
  [Key in keyof ts.CustomTransformers]:
    ExtractElement<ts.CustomTransformers[Key]>
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

  const regex = new RegExp(
    `^["'](${Object.keys(config).join("|")})["']$`
  )

  function transformPath(path: string, fileName: string) {
    let match: RegExpMatchArray | null = null

    const ogPath = path

    try {
      match = path.match(regex)
    } catch (e) {}

    if (match && match[1]) {
      const pathToSrc = relative(dirname(fileName), srcDir)
      const relPath = join(pathToSrc, outDirToCwd, config[match[1]])
      path = relPath[0] === "." ? relPath : `./${relPath}`
    }

    if (!path.endsWith(".js")) {
      path += ".js"
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
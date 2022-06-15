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
  const srcDir = join(cwd, compilerOptions.baseUrl || ".")
  const outDirToCwd = relative(outDir, cwd)

  const regex = new RegExp(
    `^["'](${Object.keys(config).join("|")})["']$`
  )

  function createTransformer(context: ts.TransformationContext) {
    return (sf: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isImportDeclaration(node)) {
          let match: RegExpMatchArray | null

          try {
            match = node.moduleSpecifier.getText().match(regex)
          } catch (e) {
            return node
          }
  
          if (match && match[1]) {
            const pathToSrc = relative(dirname(sf.fileName), srcDir)
            const relPath = join(pathToSrc, outDirToCwd, config[match[1]])

            return context.factory.createImportDeclaration(
              node.decorators,
              node.modifiers,
              node.importClause,
              context.factory.createStringLiteral(
                relPath[0] === "." ? relPath : `./${relPath}`
              ),
              node.assertClause
            )
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
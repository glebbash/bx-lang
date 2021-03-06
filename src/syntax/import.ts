import { Atom, Context, Expression, ExprParser, subContext } from "../core"
import { VOID } from "../engine/prelude"
import { expectIdent } from "./ident"
import { KVPair, OBJECT } from "./object"

export const IMPORT: Atom<ImportExpr> = (parser: ExprParser) => {
    let path = ""
    while (true) {
        path += parser.expect({ type: "identifier" }).value as string
        if (parser.nextIs({ value: "::" })) {
            parser.next()
            break
        }
        parser.expect({ value: "." })
        path += "."
    }
    if (parser.nextIs({ type: "block_brace" })) {
        // TODO: check object
        return new ImportExpr(path, OBJECT(parser, parser.next()).pairs)
    }
    return new ImportExpr(path, [[expectIdent(parser).name, null]])
}

export class ImportExpr implements Expression {
    constructor(private path: string, private pairs: KVPair[]) {}

    eval(ctx: Context) {
        const importCtx = subContext(ctx)
        importCtx.scope.exports = new Set()

        ctx.core.evalFile(this.path, importCtx)

        for (const [name, val] of this.pairs) {
            ctx.scope.define(
                val?.toString() ?? name,
                importCtx.scope.get(name),
                true,
            )
        }
        // TODO: handle varargs import
        return VOID
    }

    toString(): string {
        // TODO: handle varargs and named imports
        return `import ${this.path}::${this.pairs
            .map(([k]) => k)
            .join(", ")}`
    }
}

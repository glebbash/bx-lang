import { readFileSync } from "fs"
import { Context, subContext } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { expectIdent } from "./ident"
import { KVPair, OBJECT } from "./object"
import { PrefixParser } from "./prefix-op"

export const IMPORT: PrefixParser<ImportExpr> = (parser: Parser) => {
    let path = ""
    while (true) {
        path += parser.expect({ type: "identifier" }).value as string
        if (parser.nextIs({ value: "::" })) {
            parser.next()
            break
        }
        parser.expect({ value: "." })
        path += "/"
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
        const file = readFileSync("data/" + this.path + ".bx", {
            encoding: "utf-8",
        })

        const importCtx = subContext(ctx)
        importCtx.scope.exports = new Set()

        ctx.core.eval(file, importCtx)

        for (const [name, val] of this.pairs) {
            ctx.scope.define(val?.toString() ?? name, importCtx.scope.get(name), true)
        }
        // TODO: handle varargs import
        return VOID
    }

    toString(): string {
        // TODO: handle varargs and named imports
        return `import ${this.path.replace("/", ".")}::${this.pairs
            .map(([k]) => k)
            .join(", ")}`
    }
}

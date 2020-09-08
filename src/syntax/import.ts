import { readFile, readFileSync } from "fs"
import { Context, subContext } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { Callback, Expression } from "./expression"
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
        const objToken = parser.next()
        const obj = OBJECT(parser, objToken)
        if (!obj.isValid()) {
            return parser.unexpectedToken(objToken)
        }
        return new ImportExpr(path, obj.pairs)
    }
    return new ImportExpr(path, [[expectIdent(parser).name, null]])
}

export class ImportExpr implements Expression {
    constructor(private path: string, private pairs: KVPair[]) {}

    eval(ctx: Context, cb: Callback) {
        readFile(
            "data/" + this.path + ".bx",
            { encoding: "utf-8" },
            (err, file) => {
                if (err) return cb(VOID, err)

                const importCtx = subContext(ctx)
                importCtx.scope.exports = new Set()

                ctx.core.eval(
                    file,
                    (_, err) => {
                        if (err) return cb(VOID, err)

                        for (const [name, val] of this.pairs) {
                            ctx.scope.define(
                                val?.toString() ?? name,
                                importCtx.scope.get(name),
                                true,
                            )
                        }

                        cb(VOID)
                    },
                    importCtx,
                )
            },
        )
    }

    toString(): string {
        // TODO: handle varargs and named imports
        return `import ${this.path.replace("/", ".")}::${this.pairs
            .map(([k]) => k)
            .join(", ")}`
    }
}

import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BObject } from "../engine/prelude"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { expectIndent, IdentExpr } from "./ident"
import { PrefixParser } from "./prefix-op"

type Pair = [string, Expression | null]

export const OBJECT: PrefixParser<ObjectExpr> = (
    parser: Parser,
    token: Token,
) => {
    const exprs = token.value as Expr[]
    const pairs: Pair[] = []
    for (const expr of exprs) {
        const subParser = parser.subParser(expr)
        while (subParser.nextToken(false) !== null) {
            const name = expectIndent(subParser).name
            const value = subParser.nextIs({ value: ":" })
                ? (subParser.next(), subParser.parse())
                : null
            pairs.push([name, value])
            if (subParser.nextToken(false) !== null) {
                subParser.expect({ value: "," })
            }
        }
    }
    return new ObjectExpr(pairs)
}

export class ObjectExpr implements Expression {
    constructor(public pairs: Pair[]) {}

    eval(ctx: Context): BValue {
        const data: Record<string, BValue> = {}
        for (const [name, val] of this.pairs) {
            data[name] = val?.eval(ctx) ?? new IdentExpr(name).eval(ctx)
        }
        return new BObject(data)
    }

    toString(symbol = "", indent = ""): string {
        const bodyIndent = symbol + indent
        return (
            indent +
            "{" +
            this.pairs
                .map(([name, val]) => {
                    if (val)
                        return `${name}: ${val.toString(symbol, bodyIndent)}`
                })
                .join(",\n") +
            "\n" +
            indent +
            "}"
        )
    }
}

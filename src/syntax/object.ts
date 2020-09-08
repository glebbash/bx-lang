import { Atom, Context, Expression, ExprParser } from "../core"
import { BValue } from "../engine/engine"
import { BObject, VOID } from "../engine/prelude"
import { Token, Tokens } from "../lexer"
import { AssignableExpr } from "./assignable"
import { expectIdent, IdentExpr } from "./ident"

export type KVPair = [string, Expression | null]

export const OBJECT: Atom<ObjectExpr> = (parser: ExprParser, token: Token) => {
    const exprs = token.value as Tokens[]
    const pairs: KVPair[] = []
    for (const expr of exprs) {
        const subParser = parser.subParser(expr)
        while (subParser.nextToken(false) !== null) {
            const name = expectIdent(subParser).name
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

export class ObjectExpr extends AssignableExpr {
    constructor(public pairs: KVPair[]) {
        super()
    }

    isValid() {
        return this.pairs.every(
            ([_, value]) => value === null || value instanceof IdentExpr,
        )
    }

    eval(ctx: Context): BValue {
        const data: Record<string, BValue> = {}
        for (const [name, val] of this.pairs) {
            data[name] = val?.eval(ctx) ?? new IdentExpr(name).eval(ctx)
        }
        return new BObject(data)
    }

    define(ctx: Context, value: BValue, constant: boolean): void {
        if (value === VOID) {
            for (const [name, value] of this.pairs) {
                ctx.scope.define(value?.toString() ?? name, VOID, constant)
            }
            return
        }
        const obj = value.as(BObject).data
        for (const [name, value] of this.pairs) {
            ctx.scope.define(value?.toString() ?? name, obj[name], constant)
        }
    }

    assign(ctx: Context, value: BValue): void {
        const obj = value.as(BObject).data
        for (const [name, value] of this.pairs) {
            ctx.scope.set(value?.toString() ?? name, obj[name])
        }
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

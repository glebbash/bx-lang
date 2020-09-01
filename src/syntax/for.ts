import { Context, subContext } from "../context"
import { BValue } from "../engine/engine"
import { BREAK, BReturn, VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { panic } from "../utils/panic"
import { blockOrExpr } from "./block"
import { Expression } from "./expression"
import { expectIndent } from "./ident"
import { parenExpr } from "./paren"
import { PrefixParser } from "./prefix-op"

export const FOR: PrefixParser<ForExpr> = (parser: Parser) => {
    let name: string
    let iterable: Expression
    if (parser.nextIs({ type: "block_paren" })) {
        const subParser = parser.subParser(parenExpr(parser, parser.next()))
        name = expectIndent(subParser).name
        subParser.expect({ value: "in" })
        iterable = subParser.parseToEnd()
    } else {
        name = expectIndent(parser).name
        parser.expect({ value: "in" })
        iterable = parser.parse()
    }
    const body = blockOrExpr(parser)
    return new ForExpr(name, iterable, body)
}

export class ForExpr implements Expression {
    constructor(
        private name: string,
        private iterable: Expression,
        private body: Expression,
    ) {}

    eval(ctx: Context) {
        const iter = this.iterable.eval(ctx)
        if (!isIterable(iter)) {
            panic(`${iter} is not iterable`)
        }
        const forCtx = subContext(ctx)
        forCtx.scope.define(this.name, VOID, false)
        for (const val of iter) {
            forCtx.scope.set(this.name, val)
            const res = this.body.eval(forCtx)
            if (res === BREAK) {
                break
            } else if (res.is(BReturn)) {
                return res
            }
        }
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `for ${this.name} in ${this.iterable} ${this.body.toString(
            symbol,
            indent,
        )}`
    }
}

function isIterable(value: BValue): value is BValue & Iterable<BValue> {
    return (value as any)[Symbol.iterator] !== undefined
}

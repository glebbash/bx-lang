import { Context, subContext } from "../context"
import { BREAK, BReturn, TRUE, VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { blockOrExpr } from "./block"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const WHILE: PrefixParser<WhileExpr> = (parser: Parser) => {
    const cond = parser.parse()
    const body = blockOrExpr(parser)
    return new WhileExpr(cond, body)
}

export class WhileExpr implements Expression {
    constructor(private cond: Expression, private body: Expression) {}

    eval(ctx: Context) {
        const loopCtx = subContext(ctx)
        while (this.cond.eval(ctx) === TRUE) {
            const res = this.body.eval(loopCtx)
            if (res === BREAK) {
                break
            } else if (res.is(BReturn)) {
                return res
            }
        }
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `while ${this.cond} ${this.body.toString(
            symbol,
            symbol + indent,
        )}`
    }
}

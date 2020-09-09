import { Atom, Context, Expression, ExprParser, subContext } from "../core"
import { BBreak, BContinue, BReturn, TRUE, VOID } from "../engine/prelude"
import { blockOrExpr } from "./block"

export const WHILE: Atom<WhileExpr> = (parser: ExprParser) => {
    const cond = parser.parse()
    const body = blockOrExpr(parser)
    return new WhileExpr(cond, body)
}

export class WhileExpr implements Expression {
    constructor(private cond: Expression, private body: Expression) {}

    eval(ctx: Context) {
        while (this.cond.eval(ctx) === TRUE) {
            const loopCtx = subContext(ctx)
            const res = this.body.eval(loopCtx)
            if (res.is(BBreak)) {
                if (--res.data !== 0) {
                    return res
                }
                break
            } else if (res.is(BContinue)) {
                if (--res.data !== 0) {
                    return res
                }
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

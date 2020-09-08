import { Context, subContext } from "../context"
import { BBreak, BContinue, BReturn, TRUE, VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { blockOrExpr } from "./block"
import { Callback, Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const WHILE: PrefixParser<WhileExpr> = (parser: Parser) => {
    const cond = parser.parse()
    const body = blockOrExpr(parser)
    return new WhileExpr(cond, body)
}

export class WhileExpr implements Expression {
    constructor(private cond: Expression, private body: Expression) {}

    eval(ctx: Context, cb: Callback) {
        const loopCtx = subContext(ctx)
        const next = () => {
            this.cond.eval(ctx, (cond, err) => {
                if (err) return cb(VOID, err)
                if (cond !== TRUE) {
                    return cb(VOID)
                }
                this.body.eval(loopCtx, (res, err) => {
                    if (err) return cb(VOID, err)
                    if (res.is(BBreak)) {
                        if (--res.data !== 0) {
                            return cb(res)
                        }
                        return cb(VOID)
                    } else if (res.is(BContinue)) {
                        if (--res.data !== 0) {
                            return cb(res)
                        }
                    } else if (res.is(BReturn)) {
                        return cb(res)
                    }
                    next()
                })
            })
        }
        next()
    }

    toString(symbol = "", indent = ""): string {
        return `while ${this.cond} ${this.body.toString(
            symbol,
            symbol + indent,
        )}`
    }
}

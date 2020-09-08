import { Context, subContext } from "../context"
import { TRUE, VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { blockOrExpr } from "./block"
import { Callback, Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const IF: PrefixParser<IfExpr> = (parser: Parser) => {
    const cond = parser.parse()
    const ifTrue = blockOrExpr(parser)
    if (parser.nextIs({ value: "else" })) {
        parser.next()
        const ifFalse = blockOrExpr(parser)
        return new IfExpr(cond, ifTrue, ifFalse)
    }
    return new IfExpr(cond, ifTrue)
}

export class IfExpr implements Expression {
    constructor(
        private cond: Expression,
        private ifTrue: Expression,
        private ifFalse?: Expression,
    ) {}

    eval(ctx: Context, cb: Callback) {
        this.cond.eval(ctx, (cond, err) => {
            if (err) return cb(VOID, err)
            if (cond === TRUE) {
                return this.ifTrue.eval(subContext(ctx), cb)
            } else if (this.ifFalse) {
                return this.ifFalse.eval(subContext(ctx), cb)
            } else {
                return cb(VOID)
            }
        })
    }

    toString(symbol = "", indent = ""): string {
        return (
            `if ${this.cond.toString(symbol, indent)} ${this.ifTrue.toString(
                symbol,
                indent,
            )}` +
            (!this.ifFalse
                ? ""
                : `else ${this.ifFalse.toString(symbol, indent)}`)
        )
    }
}

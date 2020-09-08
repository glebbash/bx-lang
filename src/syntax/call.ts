import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BFunction, VOID } from "../engine/prelude"
import { ARRAY, ArrayExpr } from "./array"
import { seq } from "./block"
import { Callback, Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const call = (precedence: number) =>
    postfixParser(precedence, (parser, token, expr) => {
        return new CallExpr(expr, ARRAY(parser, token))
    })

export class CallExpr implements Expression {
    constructor(private fun: Expression, private args: ArrayExpr) {}

    eval(ctx: Context, cb: Callback) {
        this.fun.eval(ctx, (f, err) => {
            if (err) return cb(VOID, err)
            const fun = f.as(BFunction)
            const args: BValue[] = []
            seq(
                ctx,
                this.args.items,
                (val, err, next) => {
                    if (err) return cb(VOID, err)
                    args.push(val)
                    next()
                },
                () => {
                    fun.call(cb, ...args)
                },
            )
        })
    }

    toString(symbol = "", indent = ""): string {
        return `${this.fun}(${this.args.toString(symbol, indent).slice(1, -1)})`
    }
}

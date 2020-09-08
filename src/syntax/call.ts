import { action, Context, Expression } from "../core"
import { BFunction } from "../engine/prelude"
import { ARRAY, ArrayExpr } from "./array"

export const call = (precedence: number) =>
    action(precedence, (parser, token, expr) => {
        return new CallExpr(expr, ARRAY(parser, token))
    })

export class CallExpr implements Expression {
    constructor(private fun: Expression, private args: ArrayExpr) {}

    eval(ctx: Context) {
        const fun = this.fun.eval(ctx).as(BFunction)
        const args = this.args.items.map((arg) => arg.eval(ctx))
        const value = fun.call(...args)
        return value
    }

    toString(symbol = "", indent = ""): string {
        return `${this.fun}(${this.args.toString(symbol, indent).slice(1, -1)})`
    }
}

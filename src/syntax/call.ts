import { Context } from "../context"
import { BFunction } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { ARRAY, ArrayExpr } from "./array"
import { Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const call = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, token: Token, expr: Expression) => {
            return new CallExpr(expr, ARRAY(parser, token))
        },
    )

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

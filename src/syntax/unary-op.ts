import { Context } from "../context"
import { BValue } from "../engine/engine"
import { VOID } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Callback, Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const unaryOp = (fun: (x: BValue) => BValue): PrefixParser => (
    parser: Parser,
    token: Token,
) => {
    const expr = parser.parse()
    return new UnaryOpExpr(token.value as string, expr, fun)
}

export class UnaryOpExpr implements Expression {
    constructor(
        private operator: string,
        private expr: Expression,
        private fun: (x: BValue) => BValue,
    ) {}

    eval(ctx: Context, cb: Callback) {
        this.expr.eval(ctx, (val, err) => {
            if (err) return cb(VOID, err)
            cb(this.fun(val))
        })
    }

    toString(symbol = "", indent = ""): string {
        return this.operator + this.expr.toString(symbol, indent)
    }
}

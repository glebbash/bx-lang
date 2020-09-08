import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { BinaryFun } from "../utils/binary-fun"
import { Callback, Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const binaryOp = (
    precedence: number,
    fun: BinaryFun,
    rightAssoc = false,
) =>
    postfixParser(precedence, (parser, token, expr1) => {
        const expr2 = parser.parse(precedence - (rightAssoc ? 1 : 0))
        return new BinaryOpExpr(token.value as string, expr1, expr2, fun)
    })

export class BinaryOpExpr implements Expression {
    constructor(
        private operator: string,
        private expr1: Expression,
        private expr2: Expression,
        private fun: BinaryFun,
    ) {}

    eval(ctx: Context, cb: Callback) {
        this.expr1.eval(ctx, (val1, err) => {
            if (err) return cb(VOID, err)
            this.expr2.eval(ctx, (val2, err) => {
                if (err) return cb(VOID, err)
                return cb(this.fun(val1, val2))
            })
        })
    }

    toString(_symbol = "", indent = ""): string {
        return `${indent}${this.expr1} ${this.operator} ${this.expr2}`
    }
}

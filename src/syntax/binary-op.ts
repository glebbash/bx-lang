import { Context } from "../context"
import { BinaryFun } from "../utils/binary-fun"
import { Expression } from "./expression"
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

    eval(ctx: Context) {
        const value = this.fun(this.expr1.eval(ctx), this.expr2.eval(ctx))
        return value
    }

    toString(_symbol = "", indent = ""): string {
        return `${indent}${this.expr1} ${this.operator} ${this.expr2}`
    }
}

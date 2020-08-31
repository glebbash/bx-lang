import { Scope } from "../engine/scope"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { BinaryFun } from "../utils/binary-fun"
import { Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const binaryOp = (
    precedence: number,
    fun: BinaryFun,
    rightAssoc = false,
) =>
    postfixParser(
        precedence,
        (parser: Parser, token: Token, expr1: Expression) => {
            const expr2 = parser.parse(precedence - (rightAssoc ? 1 : 0))
            return new BinaryOpExpr(token.value as string, expr1, expr2, fun)
        },
    )

export class BinaryOpExpr implements Expression {
    constructor(
        private operator: string,
        private expr1: Expression,
        private expr2: Expression,
        private fun: BinaryFun,
    ) {}

    eval(scope: Scope) {
        const value = this.fun(this.expr1.eval(scope), this.expr2.eval(scope))
        return value
    }

    print(): string {
        return (
            this.expr1.print() + " " + this.operator + " " + this.expr2.print()
        )
    }
}

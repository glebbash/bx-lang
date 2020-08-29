import { Parser } from "../parser"
import { Token } from "../lexer"
import { Expression } from "./expression"
import { postfixParser } from "./postfix-op"
import { BinaryFun } from "../utils/binary-fun"
import { Scope } from "../engine/scope"

export const binaryOpParser = (
    precedence: number,
    fun: BinaryFun,
) =>
    postfixParser(
        precedence,
        (parser: Parser, token: Token, expr1: Expression) => {
            const expr2 = parser.parse(precedence)
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
        return this.fun(this.expr1.eval(scope), this.expr2.eval(scope))
    }

    print(): string {
        return (
            this.expr1.print() + " " + this.operator + " " + this.expr2.print()
        )
    }
}

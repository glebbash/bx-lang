import { Blocks } from "../core"
import { Expression } from "./expression"
import { Parser } from "../parser"
import { Token } from "../tokenizer"
import { PostfixParser } from "./postfix-op"

export const binaryOpParser = (
    precedence: number,
    fun: (...args: any[]) => any,
): PostfixParser => ({
    precedence,
    parse(parser: Parser, token: Token, expr1: Expression): Expression {
        const expr2 = parser.parse(precedence)
        return new BinaryOpExpr(token.value as string, expr1, expr2, fun)
    },
})

export class BinaryOpExpr implements Expression {
    constructor(
        private operator: string,
        private expr1: Expression,
        private expr2: Expression,
        private fun: (...args: any[]) => any,
    ) {}

    eval(core: Blocks) {
        return this.fun(this.expr1.eval(core), this.expr2.eval(core))
    }

    print(): string {
        return (
            this.expr1.print() + " " + this.operator + " " + this.expr2.print()
        )
    }
}

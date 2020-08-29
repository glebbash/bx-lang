import { Parser } from "../parser"
import { Token } from "../lexer"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"
import { Scope } from "../engine/scope"

export const unaryOpParser = (fun: (x: any) => any): PrefixParser => (
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
        private fun: (...args: any[]) => any,
    ) {}

    eval(scope: Scope) {
        return this.fun(this.expr.eval(scope))
    }

    print(): string {
        return this.operator + this.expr.print()
    }
}

import { BValue } from "../engine/engine"
import { Scope } from "../engine/scope"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
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

    eval(scope: Scope) {
        return this.fun(this.expr.eval(scope))
    }

    print(): string {
        return this.operator + this.expr.print()
    }
}

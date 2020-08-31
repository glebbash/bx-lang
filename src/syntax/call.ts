import { BFunction } from "../engine/prelude"
import { Scope } from "../engine/scope"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PAREN } from "./paren"
import { postfixParser } from "./postfix-op"

export const call = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, token: Token, expr: Expression) => {
            return new CallExpr(expr, PAREN(parser, token))
        },
    )

export class CallExpr implements Expression {
    constructor(private fun: Expression, private args: Expression) {}

    eval(scope: Scope) {
        const fun = this.fun.eval(scope)
        const value = fun.as(BFunction).call(this.args.eval(scope))
        return value
    }

    print(): string {
        return `${this.fun.print()}(${this.args.print()})`
    }
}

import { Scope } from "../engine/scope"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PAREN_PARSER } from "./paren"
import { postfixParser } from "./postfix-op"

export const callParser = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, token: Token, expr: Expression) => {
            return new CallExpr(expr, PAREN_PARSER(parser, token))
        },
    )

export class CallExpr implements Expression {
    constructor(private fun: Expression, private args: Expression) {}

    eval(scope: Scope) {
        const fun = this.fun.eval(scope)
        return fun(this.args.eval(scope))
    }

    print(): string {
        return `${this.fun.print()}(${this.args.print()})`
    }
}

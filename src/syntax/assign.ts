import { Scope } from "../engine/scope"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { syntaxError } from "../utils/syntax-error"
import { Expression } from "./expression"
import { IdentExpr } from "./ident"
import { postfixParser } from "./postfix-op"

export const assign = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, token: Token, ident: Expression) => {
            if (!(ident instanceof IdentExpr)) {
                syntaxError("Unexpected token " + token.value, token.start)
            }
            return new AssignExpr(ident.name, parser.parse(precedence))
        },
    )

export class AssignExpr implements Expression {
    constructor(private name: string, private value: Expression) {}

    eval(scope: Scope) {
        const value = this.value.eval(scope)
        scope.set(this.name, value)
        return value
    }

    print(): string {
        return this.name + " = " + this.value.print()
    }
}

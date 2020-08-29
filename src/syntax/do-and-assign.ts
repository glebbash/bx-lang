import { Parser } from "../parser"
import { Token } from "../lexer"
import { syntaxError } from "../utils/syntax-error"
import { Expression } from "./expression"
import { IdentExpr } from "./ident"
import { postfixParser } from "./postfix-op"
import { BinaryFun } from "../utils/binary-fun"
import { Scope } from "../engine/scope"

export const doAndAssign = (precedence: number, fun: BinaryFun) => postfixParser(
    precedence,
    (parser: Parser, token: Token, ident: Expression) => {
        if (!(ident instanceof IdentExpr)) {
            syntaxError("Unexpected token " + token.value, token.start)
        }
        return new DoAndAssignExpr(ident.name, parser.parse(precedence), fun)
    },
)

export class DoAndAssignExpr implements Expression {
    constructor(private name: string, private value: Expression, private fun: BinaryFun) {}

    eval(scope: Scope) {
        const val = this.value.eval(scope)
        const prev = scope.get(this.name)
        scope.set(this.name, this.fun(prev, val))
        return val
    }

    print(): string {
        return this.name + " = " + this.value.print()
    }
}

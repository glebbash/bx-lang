import { Scope } from "../engine/scope"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const IDENT: PrefixParser<IdentExpr> = (_parser: Parser, token: Token) =>
    new IdentExpr(token.value as string)

export class IdentExpr implements Expression {
    constructor(public name: string) {}

    eval(scope: Scope) {
        return scope.get(this.name)
    }

    print() {
        return this.name
    }
}

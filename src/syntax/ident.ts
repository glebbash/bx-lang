import { Parser } from "../parser"
import { Token } from "../lexer"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"
import { Scope } from "../engine/scope"

export const IDENT_PARSER: PrefixParser<IdentExpr> = (
    _parser: Parser,
    token: Token,
) => new IdentExpr(token.value as string)

export class IdentExpr implements Expression {
    constructor(public name: string) {}

    eval(scope: Scope) {
        return scope.get(this.name)
    }

    print() {
        return this.name
    }
}

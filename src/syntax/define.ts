import { VOID } from "../engine/prelude"
import { Scope } from "../engine/scope"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { IDENT } from "./ident"
import { PrefixParser } from "./prefix-op"

export const define = (constant: boolean): PrefixParser<DefineExpr> => (
    parser: Parser,
) => {
    const identExpr = IDENT(parser, parser.expect({ complexType: "<IDENT>" }))
    parser.expect({ value: "=" })
    return new DefineExpr(identExpr.name, parser.parse(), constant)
}

export class DefineExpr implements Expression {
    constructor(
        private name: string,
        private expr: Expression,
        private constant: boolean,
    ) {}

    eval(scope: Scope) {
        scope.define(this.name, this.expr.eval(scope), this.constant)
        return VOID
    }

    print(): string {
        return `let ${this.name} = ${this.expr.print()}`
    }
}

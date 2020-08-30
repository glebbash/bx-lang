import { Scope } from "../engine/scope"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { IDENT_PARSER } from "./ident"
import { PrefixParser } from "./prefix-op"

export const defineParser = (constant: boolean): PrefixParser<DefineExpr> => (
    parser: Parser,
) => {
    const identExpr = IDENT_PARSER(
        parser,
        parser.expect({ complexType: "<IDENT>" }),
    )
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
        return null
    }

    print(): string {
        return `let ${this.name} = ${this.expr.print()}`
    }
}

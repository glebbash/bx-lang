import { Expression } from "./expression"
import { Parser } from "../parser"
import { IDENT_PARSER } from "./ident"
import { PrefixParser } from "./prefix-op"
import { Blocks } from "../core"

export const LET_PARSER: PrefixParser<LetExpr> = {
    parse(parser: Parser) {
        const identExpr = IDENT_PARSER.parse(parser, parser.next())
        parser.nextValue("=")
        return new LetExpr(identExpr.name, parser.parse())
    },
}

export class LetExpr implements Expression {
    constructor(private name: string, private expr: Expression) {}

    eval(core: Blocks) {
        core.engine.scope.define(this.name, this.expr.eval(core))
        return null
    }

    print(): string {
        return `let ${this.name} = ${this.expr.print()}`
    }
}

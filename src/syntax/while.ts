import { Scope } from "../engine/scope"
import { Parser } from "../parser"
import { BLOCK_PARSER } from "./block"
import { Expression } from "./expression"
import { PAREN_PARSER } from "./paren"
import { PrefixParser } from "./prefix-op"

export const WHILE_PARSER: PrefixParser<WhileExpr> = (parser: Parser) => {
    const cond = PAREN_PARSER(parser, parser.expect({ type: "block_paren" }))
    const body = BLOCK_PARSER(parser, parser.next())
    return new WhileExpr(cond, body)
}

export class WhileExpr implements Expression {
    constructor(private cond: Expression, private body: Expression) {}

    eval(scope: Scope) {
        const loopScope = new Scope(scope)
        while (this.cond.eval(scope)) {
            this.body.eval(loopScope)
        }
        return null
    }

    print(): string {
        return `while (${this.cond.print()}) { ${this.body.print()} }`
    }
}

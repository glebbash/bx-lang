import { Scope } from "../engine/scope"
import { Parser } from "../parser"
import { BLOCK_PARSER } from "./block"
import { Expression } from "./expression"
import { PAREN_PARSER } from "./paren"
import { PrefixParser } from "./prefix-op"

export const IF_PARSER: PrefixParser<IfExpr> = (parser: Parser) => {
    const cond = PAREN_PARSER(parser, parser.next())
    const ifTrue = BLOCK_PARSER(parser, parser.next())
    if (parser.nextIs({ value: "else" })) {
        parser.next()
        const ifFalse = BLOCK_PARSER(parser, parser.next())
        return new IfExpr(cond, ifTrue, ifFalse)
    }
    return new IfExpr(cond, ifTrue)
}

export class IfExpr implements Expression {
    constructor(
        private cond: Expression,
        private ifTrue: Expression,
        private ifFalse?: Expression,
    ) {}

    eval(scope: Scope) {
        if (this.cond.eval(scope)) {
            return this.ifTrue.eval(scope)
        } else if (this.ifFalse !== undefined) {
            return this.ifFalse.eval(scope)
        }
        return null
    }

    print(): string {
        if (this.ifFalse) {
            return `if ${this.cond.print()} { ${this.ifTrue.print()} } else { ${this.ifFalse.print()} }`
        }
        return `if ${this.cond.print()} { ${this.ifTrue.print()} }`
    }
}
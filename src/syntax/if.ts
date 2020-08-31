import { TRUE, VOID } from "../engine/prelude"
import { Scope } from "../engine/scope"
import { Parser } from "../parser"
import { BLOCK } from "./block"
import { Expression } from "./expression"
import { PAREN } from "./paren"
import { PrefixParser } from "./prefix-op"

export const IF: PrefixParser<IfExpr> = (parser: Parser) => {
    const cond = PAREN(parser, parser.expect({ type: "block_paren" }))
    const ifTrue = BLOCK(parser, parser.next())
    if (parser.nextIs({ value: "else" })) {
        parser.next()
        const ifFalse = BLOCK(parser, parser.next())
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
        if (this.cond.eval(scope) === TRUE) {
            return this.ifTrue.eval(scope)
        } else if (this.ifFalse !== undefined) {
            return this.ifFalse.eval(scope)
        }
        return VOID
    }

    print(): string {
        if (this.ifFalse) {
            return `if ${this.cond.print()} { ${this.ifTrue.print()} } else { ${this.ifFalse.print()} }`
        }
        return `if ${this.cond.print()} { ${this.ifTrue.print()} }`
    }
}

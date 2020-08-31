import { BREAK, BReturn, VOID } from "../engine/prelude"
import { Scope } from "../engine/scope"
import { Parser } from "../parser"
import { BLOCK } from "./block"
import { Expression } from "./expression"
import { PAREN } from "./paren"
import { PrefixParser } from "./prefix-op"

export const WHILE: PrefixParser<WhileExpr> = (parser: Parser) => {
    const cond = PAREN(parser, parser.expect({ type: "block_paren" }))
    const body = BLOCK(parser, parser.next())
    return new WhileExpr(cond, body)
}

export class WhileExpr implements Expression {
    constructor(private cond: Expression, private body: Expression) {}

    eval(scope: Scope) {
        const loopScope = new Scope(scope)
        while (this.cond.eval(scope)) {
            const res = this.body.eval(loopScope)
            if (res === BREAK) {
                break
            } else if (res.is(BReturn)) {
                return res
            }
        }
        return VOID
    }

    print(): string {
        return `while (${this.cond.print()}) { ${this.body.print()} }`
    }
}

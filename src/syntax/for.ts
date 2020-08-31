import { BRange, BREAK, BReturn, VOID } from "../engine/prelude"
import { Scope } from "../engine/scope"
import { Expr } from "../lexer"
import { Parser } from "../parser"
import { syntaxError } from "../utils/syntax-error"
import { BLOCK } from "./block"
import { Expression } from "./expression"
import { IDENT } from "./ident"
import { PrefixParser } from "./prefix-op"

export const FOR: PrefixParser<ForExpr> = (parser: Parser) => {
    const condExpr = parser.expect({ type: "block_paren" })
    const exprs = condExpr.value as Expr[]
    if (exprs.length !== 1) {
        syntaxError("Multiple expressions in parentheses.", condExpr.start)
    }
    if (exprs[0].length === 0) {
        syntaxError("Invalid for loop condition", condExpr.start)
    }
    const condParser = parser.subParser(exprs[0])
    const name = IDENT(condParser, condParser.next()).name
    condParser.expect({ value: "in" })
    const iterable = condParser.parse()

    const body = BLOCK(parser, parser.next())
    return new ForExpr(name, iterable, body)
}

export class ForExpr implements Expression {
    constructor(
        private name: string,
        private iterable: Expression,
        private body: Expression,
    ) {}

    eval(scope: Scope) {
        const iter = this.iterable.eval(scope).as(BRange)
        const forScope = new Scope(scope)
        forScope.define(this.name, VOID, false)
        for (const val of iter) {
            forScope.set(this.name, val)
            const res = this.body.eval(forScope)
            if (res === BREAK) {
                break
            } else if (res.is(BReturn)) {
                return res
            }
        }
        return VOID
    }

    print(): string {
        return `for (${
            this.name
        } in ${this.iterable.print()}) { ${this.body.print()} }`
    }
}

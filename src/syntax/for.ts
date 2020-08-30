import { Scope } from "../engine/scope"
import { Expr } from "../lexer"
import { Parser } from "../parser"
import { syntaxError } from "../utils/syntax-error"
import { BLOCK_PARSER } from "./block"
import { Expression } from "./expression"
import { IDENT_PARSER } from "./ident"
import { PrefixParser } from "./prefix-op"

export const FOR_PARSER: PrefixParser<ForExpr> = (parser: Parser) => {
    const condExpr = parser.expect({ type: "block_paren" })
    const exprs = condExpr.value as Expr[]
    if (exprs.length !== 1) {
        syntaxError("Multiple expressions in parentheses.", condExpr.start)
    }
    if (exprs[0].length === 0) {
        syntaxError("Invalid for loop condition", condExpr.start)
    }
    const condParser = parser.subParser(exprs[0])
    const name = IDENT_PARSER(condParser, condParser.next()).name
    condParser.expect({ value: "in" })
    const iterable = condParser.parse()

    const body = BLOCK_PARSER(parser, parser.next())
    return new ForExpr(name, iterable, body)
}

export class ForExpr implements Expression {
    constructor(
        private name: string,
        private iterable: Expression,
        private body: Expression,
    ) {}

    eval(scope: Scope) {
        const iter = this.iterable.eval(scope)
        const forScope = new Scope(scope)
        forScope.define(this.name, null as any, false)
        for (const val of iter) {
            forScope.set(this.name, val)
            this.body.eval(forScope)
        }
        return null
    }

    print(): string {
        return `for (${
            this.name
        } in ${this.iterable.print()}) { ${this.body.print()} }`
    }
}

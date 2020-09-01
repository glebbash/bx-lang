import { Context } from "../context"
import { BValue } from "../engine/engine"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { AssignableExpr } from "./assignable"
import { PrefixParser } from "./prefix-op"

export function expectIdent(
    parser: Parser,
    includeSpecial = false,
): IdentExpr {
    if (includeSpecial) {
        return IDENT(parser, parser.expect({ type: "identifier" }))
    }
    return IDENT(parser, parser.expect({ complexType: "<IDENT>" }))
}

export const IDENT: PrefixParser<IdentExpr> = (_parser: Parser, token: Token) =>
    new IdentExpr(token.value as string)

export class IdentExpr extends AssignableExpr {
    constructor(public name: string) {
        super()
    }

    assign(ctx: Context, value: BValue): void {
        ctx.scope.set(this.name, value)
    }

    eval(ctx: Context) {
        return ctx.scope.get(this.name)
    }

    toString() {
        return this.name
    }
}

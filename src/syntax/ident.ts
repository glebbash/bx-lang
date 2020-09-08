import { Context } from "../context"
import { BValue } from "../engine/engine"
import { Token } from "../lexer"
import { panic } from "../utils/panic"
import { AssignableExpr } from "./assignable"
import { Atom, ExprParser } from "./core"
import { ExportableExpr } from "./export"

export function expectIdent(
    parser: ExprParser,
    includeSpecial = false,
): IdentExpr {
    if (includeSpecial) {
        return IDENT(parser, parser.expect({ type: "identifier" }))
    }
    return IDENT(parser, parser.expect({ complexType: "<IDENT>" }))
}

export const IDENT: Atom<IdentExpr> = (_parser: ExprParser, token: Token) =>
    new IdentExpr(token.value as string)

export class IdentExpr extends AssignableExpr implements ExportableExpr {
    constructor(public name: string) {
        super()
    }

    export(exports: Set<string>): void {
        if (exports!.has(this.name)) {
            panic(`Cannot re-export '${this.name}'`)
        }
        exports!.add(this.name)
    }

    define(ctx: Context, value: BValue, constant: boolean) {
        ctx.scope.define(this.name, value, constant)
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

import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { panic } from "../utils/panic"
import { DefineIdentExpr } from "./define"
import { Expression } from "./expression"
import { FunExpr } from "./fun"
import { IdentExpr } from "./ident"
import { PrefixParser } from "./prefix-op"

export const EXPORT: PrefixParser<ExportExpr> = (parser: Parser) => {
    const token = parser.next(false)
    const expr = parser.parse()
    if (
        (expr instanceof IdentExpr ||
            expr instanceof DefineIdentExpr ||
            expr instanceof FunExpr) &&
        expr.name !== null
    ) {
        return new ExportExpr(expr as any)
    }
    parser.unexpectedToken(token)
}

export class ExportExpr implements Expression {
    constructor(private expr: Expression & { name: string }) {}

    eval(ctx: Context) {
        this.expr.eval(ctx)
        if (ctx.scope.exports === null) {
            panic("Cannot export values from here")
        }
        if (ctx.scope.exports.has(this.expr.name)) {
            panic(`Cannot re-export '${this.expr.name}'`)
        }
        ctx.scope.exports.add(this.expr.name)
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `export ${this.expr.toString(symbol, indent)}`
    }
}

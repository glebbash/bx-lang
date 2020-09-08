import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { panic } from "../utils/panic"
import { Callback, Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export interface ExportableExpr extends Expression {
    export(exports: Set<string>): void
}

function isExportable(expr: Expression): expr is ExportableExpr {
    return (expr as any).export !== undefined
}

export const EXPORT: PrefixParser<ExportExpr> = (parser: Parser) => {
    const token = parser.next(false)
    const expr = parser.parse()
    if (!isExportable(expr)) {
        parser.unexpectedToken(token)
    }
    return new ExportExpr(expr)
}

export class ExportExpr implements Expression {
    constructor(private expr: ExportableExpr) {}

    eval(ctx: Context, cb: Callback) {
        this.expr.eval(ctx, (_, err) => {
            if (err) return cb(VOID, err)
            if (ctx.scope.exports === null) {
                return cb(VOID, new Error("Cannot export values from here"))
            }
            this.expr.export(ctx.scope.exports)
            cb(VOID)
        })
    }

    toString(symbol = "", indent = ""): string {
        return `export ${this.expr.toString(symbol, indent)}`
    }
}

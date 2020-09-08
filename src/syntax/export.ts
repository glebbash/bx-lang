import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { panic } from "../utils/panic"
import { Atom, Expression, ExprParser } from "./core"

export interface ExportableExpr extends Expression {
    export(exports: Set<string>): void
}

function isExportable(expr: Expression): expr is ExportableExpr {
    return (expr as any).export !== undefined
}

export const EXPORT: Atom<ExportExpr> = (parser: ExprParser) => {
    const token = parser.next(false)
    const expr = parser.parse()
    if (!isExportable(expr)) {
        parser.unexpectedToken(token)
    }
    return new ExportExpr(expr)
}

export class ExportExpr implements Expression {
    constructor(private expr: ExportableExpr) {}

    eval(ctx: Context) {
        this.expr.eval(ctx)
        if (ctx.scope.exports === null) {
            panic("Cannot export values from here")
        }
        this.expr.export(ctx.scope.exports)
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `export ${this.expr.toString(symbol, indent)}`
    }
}

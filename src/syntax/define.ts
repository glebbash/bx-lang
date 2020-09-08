import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { panic } from "../utils/panic"
import { AssignExpr } from "./assign"
import { Atom, Expression, ExprParser } from "./core"

export const define = (constant: boolean): Atom<DefineExpr> => (
    parser: ExprParser,
) => {
    const expr = parser.parse()
    if (!(expr instanceof AssignExpr) || !expr.assignable.isDefinable()) {
        panic("This expression is not definable")
    }
    return new DefineExpr(expr, constant)
}

export class DefineExpr implements Expression {
    constructor(private expr: AssignExpr, private constant: boolean) {}

    eval(ctx: Context) {
        const { assignable, value } = this.expr
        assignable.define(ctx, value.eval(ctx), this.constant)
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return (
            (this.constant ? "const " : "let ") +
            this.expr.toString(symbol, indent)
        )
    }
}

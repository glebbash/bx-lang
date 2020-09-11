import { Atom, Context, Expression, ExprParser } from "../core"
import { BValue } from "../engine/engine"
import { BPausedExec, ExecState, VOID } from "../engine/prelude"
import { panic } from "../utils/panic"
import { AssignExpr } from "./assign"

export const define = (constant: boolean): Atom<DefineExpr> => (
    parser: ExprParser,
) => {
    const expr = parser.parse()
    if (!(expr instanceof AssignExpr) || !expr.assignable.isDefinable()) {
        panic("This expression is not definable")
    }
    return new DefineExpr(expr, constant)
}

export class DefineExecState implements ExecState {
    constructor(public ctx: Context, public defineExpr: DefineExpr) {}

    resume(value?: BValue): BValue {
        return this.defineExpr.eval(this.ctx, value)
    }
}

export class DefineExpr implements Expression {
    constructor(private expr: AssignExpr, private constant: boolean) {}

    eval(ctx: Context, val?: BValue) {
        const { assignable, value } = this.expr
        val = val ?? value.eval(ctx)
        if (val.is(BPausedExec)) {
            val.data.execStack.unshift(new DefineExecState(ctx, this))
            return val
        }
        assignable.define(ctx, val, this.constant)
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return (
            (this.constant ? "const " : "let ") +
            this.expr.toString(symbol, indent)
        )
    }
}

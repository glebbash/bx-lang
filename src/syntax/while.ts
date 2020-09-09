import { Atom, Context, Expression, ExprParser, subContext } from "../core"
import { BValue } from "../engine/engine"
import {
    BBreak,
    BContinue,
    BPausedExec,
    BReturn,
    ExecState,
    TRUE,
    VOID,
} from "../engine/prelude"
import { blockOrExpr } from "./block"

export const WHILE: Atom<WhileExpr> = (parser: ExprParser) => {
    const cond = parser.parse()
    const body = blockOrExpr(parser)
    return new WhileExpr(cond, body)
}

export class WhileExecState implements ExecState {
    constructor(public ctx: Context, public whileExpr: WhileExpr) {}

    resume(res?: BValue): BValue {
        if (res !== undefined) {
            if (res.is(BBreak)) {
                if (--res.data !== 0) return res
                return VOID
            }
            if (res.is(BContinue) && --res.data !== 0) {
                return res
            }
        }
        return this.whileExpr.eval(this.ctx)
    }
}

export class WhileExpr implements Expression {
    constructor(private cond: Expression, private body: Expression) {}

    eval(ctx: Context) {
        while (this.cond.eval(ctx) === TRUE) {
            const loopCtx = subContext(ctx)
            const res = this.body.eval(loopCtx)
            if (res.is(BPausedExec)) {
                res.data.execStack.unshift(new WhileExecState(ctx, this))
                return res
            }
            if (res.is(BBreak)) {
                if (--res.data !== 0) return res
                break
            }
            if (res.is(BContinue) && --res.data !== 0) {
                return res
            }
            if (res.is(BReturn)) {
                return res
            }
        }
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `while ${this.cond} ${this.body.toString(
            symbol,
            symbol + indent,
        )}`
    }
}

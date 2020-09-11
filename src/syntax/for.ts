import { Atom, Context, Expression, ExprParser, subContext } from "../core"
import { BValue } from "../engine/engine"
import {
    BBreak,
    BContinue,
    BPausedExec,
    BReturn,
    ExecState,
    VOID,
} from "../engine/prelude"
import { panic } from "../utils/panic"
import { AssignableExpr, isAssignable } from "./assignable"
import { blockOrExpr } from "./block"
import { parenExpr } from "./paren"

export const FOR: Atom<ForExpr> = (parser: ExprParser) => {
    const condParser = parser.nextIs({ type: "block_paren" })
        ? parser.subParser(parenExpr(parser, parser.next()))
        : parser
    const bindingStartToken = condParser.next(false)
    const binding = condParser.parse()
    if (
        !isAssignable(binding) ||
        !binding.isDefinable() ||
        !binding.isValid()
    ) {
        return condParser.unexpectedToken(bindingStartToken)
    }
    condParser.expect({ value: "in" })
    const iterable = condParser.parse()
    const body = blockOrExpr(parser)
    return new ForExpr(binding, iterable, body)
}

export class ForExecState implements ExecState {
    constructor(
        public ctx: Context,
        public forExpr: ForExpr,
        public iterator: Iterator<BValue>,
    ) {}

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
        return this.forExpr.eval(this.ctx, this.iterator)
    }
}

export class ForExpr implements Expression {
    constructor(
        private binding: AssignableExpr,
        private iterable: Expression,
        private body: Expression,
    ) {}

    eval(ctx: Context, iterator?: Iterator<BValue>) {
        if (iterator === undefined) {
            const iter = this.iterable.eval(ctx)
            if (!isIterable(iter)) {
                panic(`${iter} is not iterable`)
            }
            iterator = iter[Symbol.iterator]()
        }
        let iter: IteratorResult<BValue>
        while (!(iter = iterator.next()).done) {
            const forCtx = subContext(ctx)
            this.binding.define(forCtx, iter.value, false)
            const res = this.body.eval(forCtx)
            if (res.is(BPausedExec)) {
                res.data.execStack.unshift(
                    new ForExecState(ctx, this, iterator),
                )
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
        return `for ${this.binding.toString(symbol, indent)} in ${
            this.iterable
        } ${this.body.toString(symbol, indent)}`
    }
}

function isIterable(value: BValue): value is BValue & Iterable<BValue> {
    return (value as any)[Symbol.iterator] !== undefined
}

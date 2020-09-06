import { Context, subContext } from "../context"
import { BValue } from "../engine/engine"
import { BBreak, BContinue, BReturn, VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { panic } from "../utils/panic"
import { AssignableExpr, isAssignable } from "./assignable"
import { blockOrExpr } from "./block"
import { Expression } from "./expression"
import { parenExpr } from "./paren"
import { PrefixParser } from "./prefix-op"

export const FOR: PrefixParser<ForExpr> = (parser: Parser) => {
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

export class ForExpr implements Expression {
    constructor(
        private binding: AssignableExpr,
        private iterable: Expression,
        private body: Expression,
    ) {}

    eval(ctx: Context) {
        const iter = this.iterable.eval(ctx)
        if (!isIterable(iter)) {
            panic(`${iter} is not iterable`)
        }
        const forCtx = subContext(ctx)
        this.binding.define(forCtx, VOID, false)
        for (const val of iter) {
            this.binding.assign(forCtx, val)
            const res = this.body.eval(forCtx)
            if (res.is(BBreak)) {
                if (--res.data !== 0) {
                    return res
                }
                break
            } else if (res.is(BContinue)) {
                if (--res.data !== 0) {
                    return res
                }
            } else if (res.is(BReturn)) {
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

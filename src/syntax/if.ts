import { Atom, Context, Expression, ExprParser, subContext } from "../core"
import { TRUE, VOID } from "../engine/prelude"
import { blockOrExpr } from "./block"

export const IF: Atom<IfExpr> = (parser: ExprParser) => {
    const cond = parser.parse()
    const ifTrue = blockOrExpr(parser)
    if (parser.nextIs({ value: "else" })) {
        parser.next()
        const ifFalse = blockOrExpr(parser)
        return new IfExpr(cond, ifTrue, ifFalse)
    }
    return new IfExpr(cond, ifTrue)
}

export class IfExpr implements Expression {
    constructor(
        private cond: Expression,
        private ifTrue: Expression,
        private ifFalse?: Expression,
    ) {}

    eval(ctx: Context) {
        if (this.cond.eval(ctx) === TRUE) {
            return this.ifTrue.eval(subContext(ctx))
        } else if (this.ifFalse !== undefined) {
            return this.ifFalse.eval(subContext(ctx))
        }
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return (
            `if ${this.cond.toString(symbol, indent)} ${this.ifTrue.toString(
                symbol,
                indent,
            )}` +
            (!this.ifFalse
                ? ""
                : `else ${this.ifFalse.toString(symbol, indent)}`)
        )
    }
}

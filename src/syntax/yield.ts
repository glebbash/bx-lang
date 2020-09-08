import { Atom, Context, Expression, ExprParser } from "../core"
import { BReturn } from "../engine/prelude"

export const YIELD: Atom<YieldExpr> = (parser: ExprParser) => {
    return new YieldExpr(parser.parse())
}

export class YieldExpr implements Expression {
    constructor(private value: Expression) {}

    eval(ctx: Context) {
        return new BReturn(this.value.eval(ctx))
    }

    toString(symbol = "", indent = ""): string {
        return `return ${this.value.toString(symbol, indent)}`
    }
}

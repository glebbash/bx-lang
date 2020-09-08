import { Atom, Context, Expression, ExprParser } from "../core"
import { BYield } from "../engine/prelude"

export const YIELD: Atom<YieldExpr> = (parser: ExprParser) => {
    return new YieldExpr(parser.parse())
}

export class YieldExpr implements Expression {
    constructor(private value: Expression) {}

    eval(ctx: Context) {
        return new BYield(this.value.eval(ctx))
    }

    toString(symbol = "", indent = ""): string {
        return `yield ${this.value.toString(symbol, indent)}`
    }
}

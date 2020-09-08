import { Context } from "../context"
import { BReturn } from "../engine/prelude"
import { Atom, Expression, ExprParser } from "./core"

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

import { Atom, Context, Expression, ExprParser } from "../core"
import { BReturn } from "../engine/prelude"

export const RETURN: Atom<ReturnExpr> = (parser: ExprParser) => {
    return new ReturnExpr(parser.parse())
}

export class ReturnExpr implements Expression {
    constructor(private value: Expression) {}

    eval(ctx: Context) {
        return new BReturn(this.value.eval(ctx))
    }

    toString(symbol = "", indent = ""): string {
        return `return ${this.value.toString(symbol, indent)}`
    }
}

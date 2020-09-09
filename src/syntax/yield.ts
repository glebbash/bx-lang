import { Atom, Context, Expression, ExprParser } from "../core"
import { BPausedExec } from "../engine/prelude"

export const YIELD: Atom<YieldExpr> = (parser: ExprParser) => {
    return new YieldExpr(parser.parseToEnd())
}

export class YieldExpr implements Expression {
    constructor(private value: Expression) {}

    eval(ctx: Context) {
        return new BPausedExec({
            returned: this.value.eval(ctx),
            execStack: [],
        })
    }

    toString(symbol = "", indent = ""): string {
        return `yield ${this.value.toString(symbol, indent)}`
    }
}

import { Atom, Context, Expression, ExprParser } from "../core"
import { BPausedExec } from "../engine/prelude"

export const AWAIT: Atom<AwaitExpr> = (parser: ExprParser) => {
    return new AwaitExpr(parser.parseToEnd())
}

export class AwaitExpr implements Expression {
    constructor(private value: Expression) {}

    eval(ctx: Context) {
        return new BPausedExec({
            returned: this.value.eval(ctx),
            execStack: [],
            async: true,
        })
    }

    toString(symbol = "", indent = ""): string {
        return `await ${this.value.toString(symbol, indent)}`
    }
}

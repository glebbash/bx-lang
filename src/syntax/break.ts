import { Atom, Expression, ExprParser } from "../core"
import { BBreak } from "../engine/prelude"

export const BREAK: Atom<BreakExpr> = (parser: ExprParser) => {
    if (parser.nextIs({ type: "number" })) {
        const token = parser.next()
        const times = Number(token.value)
        if (times < 2) {
            parser.unexpectedToken(token)
        }
        return new BreakExpr(times)
    }
    return new BreakExpr(1)
}

export class BreakExpr implements Expression {
    constructor(private times: number) {}

    eval() {
        return new BBreak(this.times)
    }

    toString(): string {
        return `break ${this.times === 1 ? "" : this.times}`
    }
}

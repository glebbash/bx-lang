import { BContinue } from "../engine/prelude"
import { Atom, Expression, ExprParser } from "./core"

export const CONTINUE: Atom<ContinueExpr> = (parser: ExprParser) => {
    if (parser.nextIs({ type: "number" })) {
        const token = parser.next()
        const times = Number(token.value)
        if (times < 2) {
            parser.unexpectedToken(token)
        }
        return new ContinueExpr(times)
    }
    return new ContinueExpr(1)
}

export class ContinueExpr implements Expression {
    constructor(private times: number) {}

    eval() {
        return new BContinue(this.times)
    }

    toString(): string {
        return `continue ${this.times === 1 ? "" : this.times}`
    }
}

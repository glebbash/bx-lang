import { BBreak } from "../engine/prelude"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const BREAK: PrefixParser<BreakExpr> = (parser: Parser) => {
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

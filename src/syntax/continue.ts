import { BContinue } from "../engine/prelude"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const CONTINUE: PrefixParser<ContinueExpr> = (parser: Parser) => {
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

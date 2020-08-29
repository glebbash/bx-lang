import { Blocks } from "../core"
import { Parser } from "../parser"
import { Token } from "../tokenizer"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const unaryOpParser = (fun: (...args: any[]) => any): PrefixParser => (
    parser: Parser,
    token: Token,
) => {
    const expr = parser.parse()
    return new UnaryOpExpr(token.value as string, expr, fun)
}

export class UnaryOpExpr implements Expression {
    constructor(
        private operator: string,
        private expr: Expression,
        private fun: (...args: any[]) => any,
    ) {}

    eval(core: Blocks) {
        return this.fun(this.expr.eval(core))
    }

    print(): string {
        return this.operator + this.expr.print()
    }
}

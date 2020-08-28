import { Blocks } from "../core"
import { Expression } from "./expression"

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

import { Blocks } from "../core"
import { Expression } from "./expression"

export class BinaryOpExpr implements Expression {
    constructor(
        private operator: string,
        private expr1: Expression,
        private expr2: Expression,
        private fun: (...args: any[]) => any,
    ) {}

    eval(core: Blocks) {
        return this.fun(this.expr1.eval(core), this.expr2.eval(core))
    }

    print(): string {
        return this.expr1.print() + this.operator + this.expr2.print()
    }
}

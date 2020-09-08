import { Context } from "../context"
import { BinaryFun } from "../utils/binary-fun"
import { AssignableExpr } from "./assignable"
import { action, Expression } from "./core"

export const doAndAssign = (precedence: number, fun: BinaryFun) =>
    action(precedence, (parser, token, assignable) => {
        if (!(assignable instanceof AssignableExpr)) {
            return parser.unexpectedToken(token)
        }
        return new DoAndAssignExpr(assignable, parser.parse(precedence), fun)
    })

export class DoAndAssignExpr implements Expression {
    constructor(
        private assignable: AssignableExpr,
        private value: Expression,
        private fun: BinaryFun,
    ) {}

    eval(ctx: Context) {
        const value = this.value.eval(ctx)
        const prev = this.assignable.eval(ctx)
        const res = this.fun(prev, value)
        this.assignable.assign(ctx, res)
        return res
    }

    toString(symbol = "", indent = ""): string {
        return `${this.assignable.toString(symbol, indent)} = ${this.value}`
    }
}

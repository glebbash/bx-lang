import { Context } from "../context"
import { Parser } from "../parser"
import { BinaryFun } from "../utils/binary-fun"
import { AssignableExpr } from "./assignable"
import { Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const doAndAssign = (precedence: number, fun: BinaryFun) =>
    postfixParser(precedence, (parser: Parser, token, assignable) => {
        if (!(assignable instanceof AssignableExpr)) {
            parser.unexpectedToken(token)
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

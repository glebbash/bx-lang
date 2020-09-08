import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { BinaryFun } from "../utils/binary-fun"
import { AssignableExpr } from "./assignable"
import { Callback, Expression } from "./expression"
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

    eval(ctx: Context, cb: Callback) {
        this.value.eval(ctx, (value, err) => {
            if (err) return cb(VOID, err)
            this.assignable.eval(ctx, (prev, err) => {
                if (err) return cb(VOID, err)
                const res = this.fun(prev, value)
                this.assignable.assign(ctx, res, (err) => {
                    if (err) return cb(VOID, err)
                    cb(res)
                })
            })
        })
    }

    toString(symbol = "", indent = ""): string {
        return `${this.assignable.toString(symbol, indent)} = ${this.value}`
    }
}

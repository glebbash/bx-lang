import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BArray, BNumber } from "../engine/prelude"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { panic } from "../utils/panic"
import { AssignableExpr } from "./assignable"
import { Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const element = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, token: Token, expr: Expression) => {
            const subParser = parser.subParser(token.value[0] as Expr)
            return new ElementExpr(expr, subParser.parseToEnd())
        },
    )

export class ElementExpr extends AssignableExpr {
    constructor(private arr: Expression, private index: Expression) {
        super()
    }

    assign(ctx: Context, value: BValue): void {
        const arr = this.arr.eval(ctx).as(BArray).data
        const index = this.index.eval(ctx).as(BNumber).data
        if (index < 0 || index > arr.length) {
            panic(
                `Index out of bounds: ${index}, array length is ${arr.length}`,
            )
        }
        arr[index] = value
    }

    eval(ctx: Context) {
        const arr = this.arr.eval(ctx).as(BArray).data
        const index = this.index.eval(ctx).as(BNumber).data
        if (index < 0 || index > arr.length) {
            panic(
                `Index out of bounds: ${index}, array length is ${arr.length}`,
            )
        }
        const value = arr[index]
        return value
    }

    toString(): string {
        return `${this.arr}[${this.index}]`
    }
}

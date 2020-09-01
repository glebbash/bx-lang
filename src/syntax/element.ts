import { Context } from "../context"
import { BArray, BNumber } from "../engine/prelude"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { panic } from "../utils/panic"
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

export class ElementExpr implements Expression {
    constructor(private arr: Expression, private index: Expression) {}

    eval(ctx: Context) {
        const arr = this.arr.eval(ctx).as(BArray)
        const index = this.index.eval(ctx).as(BNumber).data
        const value = arr.data[index]
        if (value === undefined) {
            panic(
                `Index out of bounds: ${index}, array length is ${arr.data.length}`,
            )
        }
        return value
    }

    toString(): string {
        return `${this.arr}[${this.index}]`
    }
}

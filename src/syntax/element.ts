import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BArray, BNumber, VOID } from "../engine/prelude"
import { Expr } from "../lexer"
import { panic } from "../utils/panic"
import { AssignableExpr } from "./assignable"
import { Callback, Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const element = (precedence: number) =>
    postfixParser(precedence, (parser, token, expr) => {
        const subParser = parser.subParser(token.value[0] as Expr)
        return new ElementExpr(expr, subParser.parseToEnd())
    })

export class ElementExpr extends AssignableExpr {
    constructor(private arr: Expression, private index: Expression) {
        super()
    }

    isDefinable() {
        return false
    }

    assign(ctx: Context, value: BValue, cb: (err?: Error) => void): void {
        this.arr.eval(ctx, (arrV, err) => {
            if (err) return cb(err)
            const arr = arrV.as(BArray).data
            this.index.eval(ctx, (indexV, err) => {
                if (err) return cb(err)
                const index = indexV.as(BNumber).data
                if (index < 0 || index > arr.length) {
                    panic(
                        `Index out of bounds: ${index}, array length is ${arr.length}`,
                    )
                }
                arr[index] = value
                cb()
            })
        })
    }

    eval(ctx: Context, cb: Callback) {
        this.arr.eval(ctx, (arrV, err) => {
            if (err) return cb(VOID, err)
            const arr = arrV.as(BArray).data
            this.index.eval(ctx, (indexV, err) => {
                if (err) return cb(VOID, err)
                const index = indexV.as(BNumber).data
                if (index < 0 || index > arr.length) {
                    panic(
                        `Index out of bounds: ${index}, array length is ${arr.length}`,
                    )
                }
                const value = arr[index]
                cb(value)
            })
        })
    }

    toString(): string {
        return `${this.arr}[${this.index}]`
    }
}

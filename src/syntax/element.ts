import { action, Context, Expression } from "../core"
import { BValue } from "../engine/engine"
import { BArray, BNumber } from "../engine/prelude"
import { Tokens } from "../lexer"
import { panic } from "../utils/panic"
import { AssignableExpr } from "./assignable"

export const element = (precedence: number) =>
    action(precedence, (parser, token, expr) => {
        const subParser = parser.subParser(token.value[0] as Tokens)
        return new ElementExpr(expr, subParser.parseToEnd())
    })

export class ElementExpr extends AssignableExpr {
    constructor(private arr: Expression, private index: Expression) {
        super()
    }

    isDefinable() {
        return false
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

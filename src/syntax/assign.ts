import { action, Context, Expression } from "../core"
import { AssignableExpr } from "./assignable"

export const assign = (precedence: number) =>
    action(precedence, (parser, token, assignable) => {
        if (!(assignable instanceof AssignableExpr) || !assignable.isValid()) {
            return parser.unexpectedToken(token)
        }
        // right associative
        return new AssignExpr(assignable, parser.parse(precedence - 1))
    })

export class AssignExpr implements Expression {
    constructor(public assignable: AssignableExpr, public value: Expression) {}

    eval(ctx: Context) {
        const value = this.value.eval(ctx)
        this.assignable.assign(ctx, value)
        return value
    }

    toString(symbol = "", indent = ""): string {
        return `${indent}${this.assignable} = ${this.value.toString(
            symbol,
            indent,
        )}`
    }
}

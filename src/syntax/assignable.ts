import { Context } from "../context"
import { BValue } from "../engine/engine"
import { panic } from "../utils/panic"
import { Callback, Expression } from "./expression"

export function isAssignable(expr: Expression): expr is AssignableExpr {
    return (expr as any).assign !== undefined
}

export abstract class AssignableExpr implements Expression {
    isValid() {
        return true
    }

    isDefinable() {
        return true
    }

    define(ctx: Context, value: BValue, constant: boolean): void {
        panic("This expression is not definable")
    }

    abstract eval(ctx: Context, cb: Callback): void

    abstract assign(
        ctx: Context,
        value: BValue,
        cb: (err?: Error) => void,
    ): void

    abstract toString(symbol?: string, indent?: string): string
}

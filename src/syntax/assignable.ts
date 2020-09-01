import { Context } from "../context"
import { BValue } from "../engine/engine"
import { Expression } from "./expression"

export abstract class AssignableExpr implements Expression {
    abstract eval(ctx: Context): BValue

    abstract assign(ctx: Context, value: BValue): void

    abstract toString(symbol?: string, indent?: string): string
}
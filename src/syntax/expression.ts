import { Context } from "../context"
import { BValue } from "../engine/engine"

export interface Expression {
    eval(ctx: Context): BValue

    toString(symbol?: string, indent?: string): string
}

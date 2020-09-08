import { Context } from "../context"
import { BValue } from "../engine/engine"

export type Callback = (value: BValue, err?: Error) => void

export interface Expression {
    eval(ctx: Context, cb: Callback): void

    toString(symbol?: string, indent?: string): string
}

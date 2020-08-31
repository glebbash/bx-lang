import { BValue } from "../engine/engine"
import { Scope } from "../engine/scope"

export interface Expression {
    eval(scope: Scope): BValue

    print(): string
}

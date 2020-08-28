import { Blocks } from "../core"
import { Expression } from "./expression"

export class LetExpr implements Expression {
    constructor(private name: string, private expr: Expression) {}

    eval(core: Blocks) {
        core.engine.scope.define(this.name, this.expr.eval(core))
        return null
    }

    print(): string {
        return `let ${this.name} = ${this.expr.print()}`
    }
}

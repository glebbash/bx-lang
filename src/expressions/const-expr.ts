import { Blocks } from "../core"
import { Expression } from "./expression"

export class ConstExpr implements Expression {
    constructor(private value: any) {}

    eval(_core: Blocks) {
        return this.value
    }

    print(): string {
        return "" + this.value
    }
}

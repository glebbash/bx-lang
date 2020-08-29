import { Blocks } from "../core"
import { Scope } from "../engine/scope"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const PRINT_PARSER: PrefixParser<PrintExpr> = (parser: Parser) => {
    return new PrintExpr(parser.parse())
}

export class PrintExpr implements Expression {
    constructor(private value: Expression) {}

    eval(scope: Scope) {
        console.log(this.value.eval(scope))
        return null
    }

    print(): string {
        return `print ${this.value.print()}`
    }
}

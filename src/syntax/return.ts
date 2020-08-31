import { BReturn } from "../engine/prelude"
import { Scope } from "../engine/scope"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const RETURN: PrefixParser<ReturnExpr> = (parser: Parser) => {
    return new ReturnExpr(parser.parse())
}

export class ReturnExpr implements Expression {
    constructor(private value: Expression) {}

    eval(scope: Scope) {
        return new BReturn(this.value.eval(scope))
    }

    print(): string {
        return `return ${this.value.print()}`
    }
}

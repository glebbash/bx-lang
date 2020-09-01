import { Context } from "../context"
import { BReturn } from "../engine/prelude"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const RETURN: PrefixParser<ReturnExpr> = (parser: Parser) => {
    return new ReturnExpr(parser.parse())
}

export class ReturnExpr implements Expression {
    constructor(private value: Expression) {}

    eval(ctx: Context) {
        return new BReturn(this.value.eval(ctx))
    }

    toString(symbol = "", indent = ""): string {
        return `return ${this.value.toString(symbol, indent)}`
    }
}

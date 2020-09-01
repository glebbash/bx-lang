import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const PRINT: PrefixParser<PrintExpr> = (parser: Parser) => {
    return new PrintExpr(parser.parse())
}

export class PrintExpr implements Expression {
    constructor(private value: Expression) {}

    eval(ctx: Context) {
        console.log(this.value.eval(ctx).toString())
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `print ${this.value.toString(symbol, indent)}`
    }
}

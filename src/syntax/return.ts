import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { Callback, Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const RETURN: PrefixParser<ReturnExpr> = (parser: Parser) => {
    return new ReturnExpr(parser.parse())
}

export class ReturnExpr implements Expression {
    constructor(private value: Expression) {}

    eval(ctx: Context, cb: Callback) {
        this.value.eval(ctx, (res, err) => {
            if (err) return cb(VOID, err)
            cb(VOID, err)
        })
    }

    toString(symbol = "", indent = ""): string {
        return `return ${this.value.toString(symbol, indent)}`
    }
}

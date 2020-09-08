import { Context } from "../context"
import { BValue } from "../engine/engine"
import { VOID } from "../engine/prelude"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { syntaxError } from "../utils/syntax-error"
import { Callback, Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export function parenExpr(parser: Parser, token: Token): Expr {
    const exprs = token.value as Expr[]
    if (exprs.length !== 1) {
        syntaxError("Multiple expressions in parentheses.", token.start)
    }
    if (exprs[0].length === 0) {
        parser.unexpectedToken(token)
    }
    return exprs[0]
}

export const PAREN: PrefixParser<ParenExpr> = (
    parser: Parser,
    token: Token,
) => {
    const expr = parenExpr(parser, token)
    return new ParenExpr(parser.subParser(expr).parseToEnd())
}

export class ParenExpr implements Expression {
    constructor(public expr: Expression) {}

    eval(ctx: Context, cb: Callback) {
        this.expr.eval(ctx, cb)
    }

    toString(symbol = "", indent = ""): string {
        return `(${this.expr.toString(symbol, indent)})`
    }
}

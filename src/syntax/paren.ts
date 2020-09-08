import { Context } from "../context"
import { BValue } from "../engine/engine"
import { Token, Tokens } from "../lexer"
import { syntaxError } from "../utils/syntax-error"
import { Atom, Expression, ExprParser } from "./core"

export function parenExpr(parser: ExprParser, token: Token): Tokens {
    const exprs = token.value as Tokens[]
    if (exprs.length !== 1) {
        syntaxError("Multiple expressions in parentheses.", token.start)
    }
    if (exprs[0].length === 0) {
        parser.unexpectedToken(token)
    }
    return exprs[0]
}

export const PAREN: Atom<ParenExpr> = (parser: ExprParser, token: Token) => {
    const expr = parenExpr(parser, token)
    return new ParenExpr(parser.subParser(expr).parseToEnd())
}

export class ParenExpr implements Expression {
    constructor(public expr: Expression) {}

    eval(ctx: Context): BValue {
        return this.expr.eval(ctx)
    }

    toString(symbol = "", indent = ""): string {
        return `(${this.expr.toString(symbol, indent)})`
    }
}

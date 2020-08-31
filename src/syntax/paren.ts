import { VOID } from "../engine/prelude"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { syntaxError } from "../utils/syntax-error"
import { ConstExpr } from "./literal"
import { PrefixParser } from "./prefix-op"

export const PAREN: PrefixParser = (parser: Parser, token: Token) => {
    const exprs = token.value as Expr[]
    if (exprs.length !== 1) {
        syntaxError("Multiple expressions in parentheses.", token.start)
    }
    if (exprs[0].length === 0) {
        return new ConstExpr(VOID)
    }
    return parser.parseSubExpr(exprs[0])
}

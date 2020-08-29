import { Expression } from "./expression"
import { Parser } from "../parser"
import { Expr, Token } from "../tokenizer"
import { PrefixParser } from "./prefix-op"
import { syntaxError } from "../utils/syntax-error"
import { ConstExpr } from "./const"

export const PAREN_PARSER: PrefixParser = {
    parse(parser: Parser, token: Token): Expression {
        const exprs = token.value as Expr[]
        if (exprs.length !== 1) {
            // TODO: should concat to one expr
            syntaxError("Multiple expressions in parentheses.", token.start)
        }
        if (exprs[0].length === 0) {
            return new ConstExpr(null)
        }
        return parser.parseSub(exprs[0])
    },
}

import { ConstExpr } from "../expressions/const-expr"
import { Expression } from "../expressions/expression"
import { Parser } from "../parser"
import { Expr, Token } from "../tokenizer"
import { panic } from "../utils/panic"
import { PrefixParser } from "./prefix-parser"
import { m } from "multiline-str"

export const PAREN_PARSER: PrefixParser = {
    parse(parser: Parser, token: Token): Expression {
        const exprs = token.value as Expr[]
        if (exprs.length !== 1) {
            // TODO: should concat to one expr
            panic(m`
                SyntaxError: Multiple expressions in parentheses.
                    at ${token.start}
                `)
        }
        if (exprs[0].length === 0) {
            return new ConstExpr(null)
        }
        return parser.parseSub(exprs[0])
    },
}

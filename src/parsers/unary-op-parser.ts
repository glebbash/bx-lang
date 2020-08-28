import { Expression } from "../expressions/expression"
import { UnaryOpExpr } from "../expressions/unary-op-expr"
import { Parser } from "../parser"
import { Token } from "../tokenizer"
import { PrefixParser } from "./prefix-parser"

export const unaryOpParser = (fun: (...args: any[]) => any): PrefixParser => ({
    parse(parser: Parser, token: Token): Expression {
        const expr = parser.parse()
        return new UnaryOpExpr(token.value as string, expr, fun)
    },
})

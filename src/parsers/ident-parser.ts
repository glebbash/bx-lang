import { IdentExpr } from "../expressions/ident-expr"
import { Parser } from "../parser"
import { Token } from "../tokenizer"
import { PrefixParser } from "./prefix-parser"

export const IDENT_PARSER: PrefixParser<IdentExpr> = {
    parse(_parser: Parser, token: Token) {
        return new IdentExpr(token.value as string)
    },
}

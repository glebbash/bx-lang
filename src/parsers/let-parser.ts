import { Expression } from "../expressions/expression"
import { IdentExpr } from "../expressions/ident-expr"
import { LetExpr } from "../expressions/let-expr"
import { Parser } from "../parser"
import { IDENT_PARSER } from "./ident-parser"
import { PrefixParser } from "./prefix-parser"

export const LET_PARSER: PrefixParser<LetExpr> = {
    parse(parser: Parser) {
        const identExpr = IDENT_PARSER.parse(parser, parser.next())
        parser.nextValue("=")
        return new LetExpr(identExpr.name, parser.parse())
    },
}

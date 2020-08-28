import { ConstExpr } from "../expressions/const-expr"
import { Expression } from "../expressions/expression"
import { Parser } from "../parser"
import { Token } from "../tokenizer"
import { PrefixParser } from "./prefix-parser"

export const CONST_PARSER: PrefixParser = {
    parse(_parser: Parser, token: Token): Expression {
        // prettier-ignore
        return new ConstExpr(token.type === "string" 
            ? token.value.slice(1, -1)
            : Number(token.value),
        )
    },
}

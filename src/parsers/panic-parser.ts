import { Expression } from "../expressions/expression"
import { PostfixParser } from "./postfix-parser"
import { PrefixParser } from "./prefix-parser"

export const PANIC_PARSER: PrefixParser & PostfixParser = {
    precedence: 0,

    parse(): Expression {
        throw new Error("Parser not implemented.")
    }
}
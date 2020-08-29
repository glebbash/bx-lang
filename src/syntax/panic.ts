import { Expression } from "./expression"
import { panic } from "../utils/panic"
import { PostfixParser } from "./postfix-op"
import { PrefixParser } from "./prefix-op"

export const PANIC_PARSER: PrefixParser & PostfixParser = {
    precedence: 0,

    parse(): Expression {
        panic("Parser not implemented.")
    },
}

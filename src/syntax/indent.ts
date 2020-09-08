import { Tokens } from "../lexer"
import { panic } from "../utils/panic"
import { action } from "./core"

export const INDENT = action(
    (parser) => {
        const token = parser.next(false)
        const sub = parser.getPostfixParser((token.value[0] as Tokens)[0])
        if (typeof sub.precedence !== "number") {
            panic("Something's wrong, I can feel it!")
        }
        return sub.precedence
    },
    (parser, token, expr) => {
        const sub = parser.subParser(
            ([] as Tokens).concat(...(token.value as Tokens[])),
        )
        while (0 < sub.tokenPrecedence()) {
            const token = sub.next()
            expr = sub.getPostfixParser(token)(sub, token, expr)
        }
        sub.checkTrailing()
        return expr
    },
)

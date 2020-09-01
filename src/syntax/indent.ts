import { Expr } from "../lexer"
import { panic } from "../utils/panic"
import { postfixParser } from "./postfix-op"

export const INDENT = postfixParser(
    (parser) => {
        const token = parser.next(false)
        const sub = parser.getPostfixParser((token.value[0] as Expr)[0])
        if (typeof sub.precedence !== "number") {
            panic("Something's wrong, I can feel it!")
        }
        return sub.precedence
    },
    (parser, token, expr) => {
        const sub = parser.subParser(
            ([] as Expr).concat(...(token.value as Expr[])),
        )
        while (0 < sub.tokenPrecedence()) {
            const token = sub.next()
            expr = sub.getPostfixParser(token)(sub, token, expr)
        }
        sub.checkTrailing()
        return expr
    },
)

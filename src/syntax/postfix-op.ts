import { Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"

export interface PostfixParser<T extends Expression = Expression> {
    precedence: number | ((parser: Parser) => number)

    (parser: Parser, token: Token, expr: Expression): T
}

export function postfixParser<T extends Expression>(
    precedence: PostfixParser<T>["precedence"],
    fun: (parser: Parser, token: Token, expr: Expression) => T,
): PostfixParser<T> {
    ;(fun as any).precedence = precedence
    return fun as any
}

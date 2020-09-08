import { Context } from "../context"
import { BValue } from "../engine/engine"
import { Token } from "../lexer"
import { Parser, postfixParser, PostfixParser, PrefixParser } from "../parser"

export type Atom<T extends Expression> = PrefixParser<Expression, T>
export type Action<T extends Expression> = PostfixParser<Expression, T>
export type ExprParser = Parser<Expression>

export const action: <T extends Expression>(
    precedence: PostfixParser<Expression>["precedence"],
    fun: (parser: Parser<Expression>, token: Token, expr: Expression) => T,
) => PostfixParser<Expression, T> = postfixParser

export interface Expression {
    eval(ctx: Context): BValue

    toString(symbol?: string, indent?: string): string
}

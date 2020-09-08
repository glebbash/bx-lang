import { Blocks } from "./blocks"
import { BValue } from "./engine/engine"
import { Scope } from "./engine/scope"
import { Token } from "./lexer"
import { Parser, postfixParser, PostfixParser, PrefixParser } from "./parser"

export interface Context {
    scope: Scope
    core: Blocks
}

export function subContext(ctx: Context): Context {
    return { scope: new Scope(ctx.scope), core: ctx.core }
}

export interface Expression {
    eval(ctx: Context): BValue

    toString(symbol?: string, indent?: string): string
}

export type ExprParser = Parser<Expression>

export type Atom<T extends Expression> = PrefixParser<Expression, T>

export type Action<T extends Expression> = PostfixParser<Expression, T>

export const action: <T extends Expression>(
    precedence: PostfixParser<Expression>["precedence"],
    fun: (parser: Parser<Expression>, token: Token, expr: Expression) => T,
) => PostfixParser<Expression, T> = postfixParser
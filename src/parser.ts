import { m } from "multiline-str"
import { Expression } from "./expressions/expression"
import { PostfixParser } from "./parsers/postfix-parser"
import { PrefixParser } from "./parsers/prefix-parser"
import { Expr, Token } from "./tokenizer"
import { panic } from "./utils/panic"
import { stream } from "./utils/stream"

type TokenStream = (consume?: boolean) => Token | null

export class Parser {
    constructor(
        public prefix: Map<string, PrefixParser>,
        public postfix: Map<string, PostfixParser>,
        private nextToken: TokenStream = null as any,
    ) {}

    parseSub(expr: Expr): Expression {
        return new Parser(this.prefix, this.postfix, stream(expr)).parse()
    }

    parseAll(exprs: Expr[]): Expression[] {
        return exprs.map((expr) => {
            this.nextToken = stream(expr)
            return this.parse()
        })
    }

    parse(precedence = 0): Expression {
        const token = this.next()
        let expr = this.getPrefixParser(token).parse(this, token)

        while (precedence < this.tokenPrecedence()) {
            const token = this.next()
            expr = this.getPostfixParser(token).parse(this, token, expr)
        }

        return expr
    }

    tokenPrecedence(): number {
        const value = this.nextToken(false)

        if (value == null) return 0

        return this.getPostfixParser(value, false)?.precedence ?? 0
    }

    getPrefixParser(token: Token): PrefixParser
    getPrefixParser(token: Token, strict: false): PrefixParser | undefined
    getPrefixParser(token: Token, strict = true): PrefixParser | undefined {
        const parser = this.prefix.get(this.getTokenType(token))
        if (parser === undefined && strict) {
            return panic("Invalid prefix operator: " + token.value)
        }
        return parser
    }

    getPostfixParser(token: Token): PostfixParser
    getPostfixParser(token: Token, strict: false): PostfixParser | undefined
    getPostfixParser(token: Token, strict = true): PostfixParser | undefined {
        const parser = this.postfix.get(this.getTokenType(token))
        if (parser === undefined && strict) {
            return panic("Invalid operator: " + token.value)
        }
        return parser
    }

    nextValue(value: string) {
        const token = this.next()
        if (token.value !== value) {
            panic(m`
                SyntaxError: Unexpected token ${token.type}, expecting ${value}.
                    at ${token.start}
                `)
        }
    }

    next(consume = true): Token {
        return this.nextToken(consume) ?? panic("Expected more tokens")
    }

    getTokenType(token: Token): string {
        switch (token.type) {
            case "string":
                return "<STRING>"
            case "number":
                return "<NUMBER>"
            case "block_brace":
            case "block_bracket":
            case "block_paren":
            case "block_indent":
                return `<${token.type.toUpperCase()}>`
            case "operator":
                return token.value as string
            case "identifier":
                if (
                    this.prefix.has(token.value as string) ||
                    this.postfix.has(token.value as string)
                ) {
                    return token.value as string
                }
                return "<IDENT>"
            default:
                panic("Unsupported token: " + token.type)
        }
    }
}

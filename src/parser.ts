import { Expression } from "./syntax/expression"
import { PostfixParser } from "./syntax/postfix-op"
import { PrefixParser } from "./syntax/prefix-op"
import { Expr, Token } from "./lexer"
import { stream } from "./utils/stream"
import { syntaxError } from "./utils/syntax-error"

type TokenStream = (consume?: boolean) => Token | null

const START_TOKEN: Token = <any>{
    end: [1, 1],
}

export class Parser {
    private prevToken = START_TOKEN

    constructor(
        public prefix: Map<string, PrefixParser>,
        public postfix: Map<string, PostfixParser>,
        private nextToken: TokenStream = null as any,
    ) {}

    subParser(expr: Expr): Parser {
        return new Parser(this.prefix, this.postfix, stream(expr))
    }

    parseSubExpr(expr: Expr): Expression {
        return this.subParser(expr).parse()
    }

    parseAll(exprs: Expr[]): Expression[] {
        return exprs.map((expr) => {
            this.nextToken = stream(expr)
            return this.parse()
        })
    }

    parse(precedence = 0): Expression {
        const token = this.next()
        let expr = this.getPrefixParser(token)(this, token)

        while (precedence < this.tokenPrecedence()) {
            const token = this.next()
            expr = this.getPostfixParser(token)(this, token, expr)
        }

        const next = this.nextToken(false)
        if (next !== null && !this.getPostfixParser(next, false)) {
            syntaxError(
                "Invalid operator " + this.getTokenType(next),
                next.start,
            )
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
            syntaxError("Invalid prefix operator: " + token.value, token.start)
        }
        return parser
    }

    getPostfixParser(token: Token): PostfixParser
    getPostfixParser(token: Token, strict: false): PostfixParser | undefined
    getPostfixParser(token: Token, strict = true): PostfixParser | undefined {
        const parser = this.postfix.get(this.getTokenType(token))
        if (parser === undefined && strict) {
            syntaxError("Invalid operator: " + token.value, token.start)
        }
        return parser
    }

    nextValue(value: string) {
        const token = this.next()
        if (token.value !== value) {
            syntaxError(
                `Unexpected token ${token.value}, expecting ${value}`,
                token.start,
            )
        }
    }

    eatValue(value: string) {
        const token = this.nextToken(false)
        if (token === null || token.value !== value) {
            return false
        }
        this.next()
        return true
    }

    next(consume = true): Token {
        const token = this.nextToken(consume)
        if (token === null) {
            syntaxError("Expected more tokens", this.prevToken.end)
        }
        this.prevToken = token
        return token
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
                syntaxError(`Unsupported token: ${token.type}`, token.start)
        }
    }
}

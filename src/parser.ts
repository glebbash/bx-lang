import { Expr, Token } from "./lexer"
import { Expression } from "./syntax/expression"
import { PostfixParser } from "./syntax/postfix-op"
import { PrefixParser } from "./syntax/prefix-op"
import { stream } from "./utils/stream"
import { syntaxError } from "./utils/syntax-error"

type TokenStream = (consume?: boolean) => Token | null

const START_TOKEN: Token = <any>{
    end: [1, 1],
}

type TokenCondition = {
    type?: Token["type"]
    value?: string
    complexType?: string
}

export class Parser {
    private prevToken = START_TOKEN

    constructor(
        public prefix: Map<string, PrefixParser>,
        public postfix: Map<string, PostfixParser>,
        public nextToken: TokenStream = null as any,
    ) {}

    subParser(expr: Expr): Parser {
        return new Parser(this.prefix, this.postfix, stream(expr))
    }

    parseAll(exprs: Expr[]): Expression[] {
        return exprs.map((expr) => {
            this.nextToken = stream(expr)
            return this.parseToEnd()
        })
    }

    parse(precedence = 0): Expression {
        const token = this.next()
        let expr = this.getPrefixParser(token)(this, token)

        while (precedence < this.tokenPrecedence()) {
            const token = this.next()
            expr = this.getPostfixParser(token)(this, token, expr)
        }

        return expr
    }

    parseToEnd(precedence = 0): Expression {
        const expr = this.parse(precedence)
        this.checkTrailing()
        return expr
    }

    checkTrailing() {
        const next = this.nextToken(false)
        if (next !== null) {
            this.unexpectedToken(next)
        }
    }

    tokenPrecedence(): number {
        const token = this.nextToken(false)
        if (token == null) return 0

        const parser = this.getPostfixParser(token, false)
        if (parser === undefined) return 0

        if (typeof parser.precedence === "function") {
            return parser.precedence(this)
        }

        return parser.precedence
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

    expect<T extends TokenCondition>(cond: T): Token {
        if (!this.nextIs(cond)) {
            this.unexpectedToken(this.nextToken(false))
        }
        return this.next() as any
    }

    nextIs(cond: TokenCondition): boolean {
        const token = this.nextToken(false)
        if (token === null) {
            return false
        }
        if (cond.type !== undefined) {
            return token.type === cond.type
        } else if (cond.value !== undefined) {
            return token.value === cond.value
        } else {
            return this.getTokenType(token) === cond.complexType!
        }
    }

    next(consume = true): Token {
        const token = this.nextToken(consume)
        if (token === null) {
            this.unexpectedToken(token)
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
                this.unexpectedToken(token)
        }
    }

    unexpectedToken(token: Token | null): never {
        return token === null
            ? syntaxError("Unexpected end of expression", this.prevToken.end)
            : syntaxError(
                  `Unexpected token: '${this.getTokenType(token)}'`,
                  token.start,
              )
    }
}

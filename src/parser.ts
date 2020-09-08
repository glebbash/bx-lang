import { Tokens, Token } from "./lexer"
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

export type PrefixParser<E, T extends E = E> = (
    parser: Parser<E>,
    token: Token,
) => T

export interface PostfixParser<E, T extends E = E> {
    precedence: number | ((parser: Parser<E>) => number)

    (parser: Parser<E>, token: Token, expr: E): T
}

export function postfixParser<E, T extends E>(
    precedence: PostfixParser<E>["precedence"],
    fun: (parser: Parser<E>, token: Token, expr: E) => T,
): PostfixParser<E, T> {
    ;(fun as any).precedence = precedence
    return fun as any
}

export class Parser<E> {
    private prevToken = START_TOKEN

    constructor(
        public prefix: Map<string, PrefixParser<E>>,
        public postfix: Map<string, PostfixParser<E>>,
        public nextToken: TokenStream = null as any,
    ) {}

    subParser(expr: Tokens): Parser<E> {
        return new Parser(this.prefix, this.postfix, stream(expr))
    }

    parseAll(exprs: Tokens[]): E[] {
        return exprs.map((expr) => {
            this.nextToken = stream(expr)
            return this.parseToEnd()
        })
    }

    parse(precedence = 0): E {
        const token = this.next()
        let expr = this.getPrefixParser(token)(this, token)

        while (precedence < this.tokenPrecedence()) {
            const token = this.next()
            expr = this.getPostfixParser(token)(this, token, expr)
        }

        return expr
    }

    parseToEnd(precedence = 0): E {
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

    getPrefixParser(token: Token): PrefixParser<E>
    getPrefixParser(token: Token, strict: false): PrefixParser<E> | undefined
    getPrefixParser(token: Token, strict = true): PrefixParser<E> | undefined {
        const parser = this.prefix.get(this.getTokenType(token))
        if (parser === undefined && strict) {
            syntaxError("Invalid prefix operator: " + token.value, token.start)
        }
        return parser
    }

    getPostfixParser(token: Token): PostfixParser<E>
    getPostfixParser(token: Token, strict: false): PostfixParser<E> | undefined
    getPostfixParser(token: Token, strict = true): PostfixParser<E> | undefined {
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

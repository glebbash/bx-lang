import { syntaxError } from "./utils/syntax-error"

const EOF = null
type EOF = typeof EOF

export type Expr = Token[]

// prettier-ignore
export type TokenType = 
    | "string"
    | "number"
    | "identifier"
    | "operator"
    | "block_paren"
    | "block_brace"
    | "block_bracket"
    | "block_indent"
    | "comment"

export type Token = {
    type: TokenType
    start: [line: number, col: number]
    end: [line: number, col: number]
    value: string | Expr[]
}

export type LexerConfig = {
    singleLineCommentStart: string | null
    multiLineCommentStart: string | null
    multiLineCommentEnd: string | null
    whitespaceRegex: RegExp
    numberStartRegex: RegExp
    numberRegex: RegExp
    identifierStartRegex: RegExp
    identifierRegex: RegExp
    operatorRegex: RegExp
    bracketed: Record<string, [end: string, type: TokenType]>
    captureComments: boolean
}

const DEFAULT_CONFIG: LexerConfig = {
    singleLineCommentStart: ";",
    multiLineCommentStart: null,
    multiLineCommentEnd: null,
    whitespaceRegex: /[ \n\t\v\r\f]/,
    numberStartRegex: /\d/,
    numberRegex: /\d/,
    identifierStartRegex: /[a-zA-Z_]/,
    identifierRegex: /[a-zA-Z_0-9]/,
    operatorRegex: /[^ \n\t\v\r\f_a-zA-Z0-9\{\}\[\]\(\)'"]/,
    bracketed: Object.freeze({
        "{": ["}", "block_brace"],
        "[": ["]", "block_bracket"],
        "(": [")", "block_paren"],
    }),
    captureComments: false,
}

export class Lexer {
    private config: LexerConfig
    private source = ""
    private prevRow = 1
    private prevCol = 0
    private row = 1
    private col = 0
    private offset = -1
    private char: string | EOF = EOF

    constructor(config?: Partial<LexerConfig>) {
        this.config = Object.assign({}, DEFAULT_CONFIG, config ?? {})
    }

    tokenize(source: string): Expr[] {
        this.source = source

        this.prevRow = 1
        this.prevCol = 0
        this.row = 1
        this.col = 0
        this.offset = -1
        this.char = EOF

        this.next() // read first

        const exprs: Expr[] = []
        while (true) {
            const comments: Token[] = []
            this.skipWhiteSpace(comments)
            if (comments.length > 0) exprs.push(comments)

            if (this.char === EOF) break

            exprs.push(this.exprIndented(this.row, this.col, EOF))
        }
        return exprs
    }

    private exprIndented(
        row: number,
        col: number,
        end: Lexer["char"],
    ): Token[] {
        const expr: Token[] = []
        while (true) {
            this.skipWhiteSpace(expr)

            if (this.char === end) break

            if (this.row === row) {
                expr.push(this.atom() ?? this.panicUnexpected())
            } else if (this.col > col) {
                const last = expr[expr.length - 1]
                if (last.type === "block_indent") {
                    ;(last.value as Expr[]).push(
                        this.exprIndented(this.row, this.col, end),
                    )
                    continue
                }
                if (last.end[0] === this.row) {
                    expr.push(this.atom() ?? this.panicUnexpected())
                    continue
                }
                expr.push(
                    this.token("block_indent", () => [
                        this.exprIndented(this.row, this.col, end),
                    ]),
                )
            } else {
                break
            }
        }
        return expr
    }

    private atom(): Token {
        if (
            EOF === this.char ||
            ")" === this.char ||
            "]" === this.char ||
            "}" === this.char
        ) {
            this.panicUnexpected()
        }
        if ('"' === this.char || "'" === this.char) {
            return this.token("string", () => this.string())
        }
        const bracketInfo = this.config.bracketed[this.char]
        if (bracketInfo !== undefined) {
            return this.exprBracketed(bracketInfo)
        }
        if (this.config.numberStartRegex.test(this.char)) {
            return this.token("number", () =>
                this.sequence(this.config.numberRegex),
            )
        }
        if (this.config.identifierStartRegex.test(this.char)) {
            return this.token("identifier", () =>
                this.sequence(this.config.identifierRegex),
            )
        }
        return this.token("operator", () =>
            this.sequence(this.config.operatorRegex),
        )
    }

    private exprBracketed([
        end,
        type,
    ]: LexerConfig["bracketed"][string]): Token {
        return this.token(type, () => {
            const exprs: Expr[] = []
            this.next() // skip opening bracket
            while (true) {
                const comments: Token[] = []
                this.skipWhiteSpace(comments)
                if (comments.length > 0) exprs.push(comments)

                exprs.push(this.exprIndented(this.row, this.col, end))

                if (this.char === end) break
            }
            this.next() // skip ending bracket
            return exprs
        })
    }

    private sequence(regex: RegExp): string {
        let buff = this.char!
        while (true) {
            this.next()
            if (this.char !== null && regex.test(this.char)) {
                buff += this.char
            } else {
                break
            }
        }
        return buff
    }

    private string(): string {
        const ending = this.char!
        let buff = ending
        while (true) {
            this.nextExceptEof()
            if (this.char === "\\") {
                this.nextExceptEof()
                // @ts-ignore
                if (this.char === "\n") {
                    syntaxError("String not closed", this.pos())
                } else {
                    buff += this.escapeChar(this.char)
                    continue
                }
            } else if (this.char === "\n") {
                syntaxError("String not closed", this.pos())
            } else if (this.char === ending) {
                this.next()
                buff += ending
                return buff
            }
            buff += this.char
        }
    }

    private token(
        type: TokenType,
        f: () => Token["value"],
        realStart?: Token["start"],
    ): Token {
        const start: Token["start"] = realStart ?? [this.row, this.col]
        return {
            type,
            value: f(),
            start,
            end: [this.prevRow, this.prevCol],
        }
    }

    private skipWhiteSpace(comments: Token[]) {
        while (true) {
            const start: Token["start"] = [this.row, this.col]
            if (
                this.config.singleLineCommentStart !== null &&
                this.skipSequence(this.config.singleLineCommentStart)
            ) {
                if (this.config.captureComments) {
                    comments.push(
                        this.token(
                            "comment",
                            () => this.sequence(/[^\n]/),
                            start,
                        ),
                    )
                } else {
                    this.sequence(/[^\n]/)
                }
            }
            if (
                this.config.multiLineCommentStart !== null &&
                this.skipSequence(this.config.multiLineCommentStart)
            ) {
                if (this.config.captureComments) {
                    comments.push(
                        this.token(
                            "comment",
                            () => this.skipMultiLineComment(),
                            start,
                        ),
                    )
                } else {
                    this.skipMultiLineComment()
                }
            }
            if (this.char === EOF || !this.isWhiteSpace(this.char)) {
                break
            }
            this.next()
        }
    }

    private skipSequence(string: string): boolean {
        if (string.length === 1) {
            if (this.char === string) {
                this.next()
                return true
            }
        } else if (this.offset + string.length < this.source.length) {
            const next = this.source.substr(this.offset, string.length)
            if (next === string) {
                for (let i = 0; i < string.length; i++) {
                    this.next()
                }
                return true
            }
        }
        return false
    }

    private skipMultiLineComment(): string {
        let buff = ""
        while (true) {
            if (this.skipSequence(this.config.multiLineCommentEnd!)) {
                break
            }
            buff += this.char
            this.next()

            if (this.char === EOF) this.panicUnexpected()
        }
        return buff
    }

    private isWhiteSpace(char: string): boolean {
        return this.config.whitespaceRegex.test(char)
    }

    private next(): string | EOF {
        if (this.offset === this.source.length - 1) {
            this.prevRow = this.row
            this.prevCol = this.col
            this.char = EOF
            return this.char
        }
        this.offset++
        this.char = this.source.charAt(this.offset)
        this.prevRow = this.row
        this.prevCol = this.col
        if (this.char == "\n") {
            this.row++
            this.col = 0
        } else {
            this.col++
        }
        return this.char
    }

    private nextExceptEof(): string {
        return this.next() ?? this.panicUnexpected()
    }

    private panicUnexpected(): never {
        return syntaxError(
            this.char === EOF
                ? "Unexpected EOF"
                : `Unexpected char '${this.char}'`,
            this.pos(),
        )
    }

    private escapeChar(char: string): string {
        switch (char) {
            case '"':
            case "'":
                return char
            case "n":
                return "\n"
            case "t":
                return "\t"
            case "v":
                return "\v"
            default:
                syntaxError("Invalid escape sequence", this.pos())
        }
    }

    private pos(): [row: number, col: number] {
        return [this.row, this.col]
    }
}

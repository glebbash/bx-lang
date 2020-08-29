import { Engine } from "./engine/engine"
import { binaryOpParser } from "./syntax/binary-op"
import { CONST_PARSER } from "./syntax/const"
import { IDENT_PARSER } from "./syntax/ident"
import { PANIC_PARSER } from "./syntax/panic"
import { PostfixParser } from "./syntax/postfix-op"
import { PrefixParser } from "./syntax/prefix-op"
import { unaryOpParser } from "./syntax/unary-op"
import { Parser } from "./parser"
import { Tokenizer } from "./tokenizer"
import { PAREN_PARSER } from "./syntax/paren"
import { LET_PARSER } from "./syntax/let"

export class Blocks {
    private tokenizer = new Tokenizer()
    private parser = parser()
    public engine = new Engine()

    eval(source: string): any {
        const tokens = this.tokenizer.tokenize(source)
        const exprs = this.parser.parseAll(tokens)
        return exprs.map((expr) => expr.eval(this)).slice(-1)[0]
    }

    prettyPrint(source: string): string {
        const tokens = this.tokenizer.tokenize(source)
        const exprs = this.parser.parseAll(tokens)
        return exprs.map((expr) => expr.print()).join("\n")
    }
}

function parser(): Parser {
    const prefix = new Map<string, PrefixParser>()
        .set("<IDENT>", IDENT_PARSER)
        .set("<NUMBER>", CONST_PARSER)
        .set("<STRING>", CONST_PARSER)
        .set("<BLOCK_PAREN>", PAREN_PARSER)
        .set("<BLOCK_BRACE>", PANIC_PARSER)
        .set("<BLOCK_INDENT>", PANIC_PARSER)
        .set("<BLOCK_BRACKET>", PANIC_PARSER)
        .set(
            "-",
            unaryOpParser((a) => -a),
        )
        .set(
            "+",
            unaryOpParser((a) => +a),
        )
        .set(
            "!",
            unaryOpParser((a) => !a),
        )
        .set("let", LET_PARSER)
    const postfix = new Map<string, PostfixParser>()
        .set(
            "+",
            binaryOpParser(1, (a, b) => a + b),
        )
        .set(
            "-",
            binaryOpParser(1, (a, b) => a - b),
        )
        .set(
            "*",
            binaryOpParser(2, (a, b) => a * b),
        )
        .set(
            "/",
            binaryOpParser(2, (a, b) => a / b),
        )
        .set(
            "^",
            binaryOpParser(3, (a, b) => a ** b),
        )
    return new Parser(prefix, postfix)
}

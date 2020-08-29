import { Parser } from "./parser"
import { ASSIGN_PARSER } from "./syntax/assign"
import { binaryOpParser } from "./syntax/binary-op"
import { BLOCK_PARSER } from "./syntax/block"
import { CONST_PARSER } from "./syntax/const"
import { doAndAssign } from "./syntax/do-and-assign"
import { FOR_PARSER } from "./syntax/for"
import { IDENT_PARSER } from "./syntax/ident"
import { IF_PARSER } from "./syntax/if"
import { LET_PARSER } from "./syntax/let"
import { PANIC_PARSER } from "./syntax/panic"
import { PAREN_PARSER } from "./syntax/paren"
import { PostfixParser } from "./syntax/postfix-op"
import { PrefixParser } from "./syntax/prefix-op"
import { PRINT_PARSER } from "./syntax/print"
import { unaryOpParser } from "./syntax/unary-op"
import { WHILE_PARSER } from "./syntax/while"
import { BinaryFun } from "./utils/binary-fun"
import { panic } from "./utils/panic"

const ADD: BinaryFun = (a, b) => a + b
const SUB: BinaryFun = (a, b) => a - b
const MUL: BinaryFun = (a, b) => a * b
const DIV: BinaryFun = (a, b) => a / b
const MOD: BinaryFun = (a, b) => a % b
const POW: BinaryFun = (a, b) => a ** b

export class BlocksParser extends Parser {
    constructor() {
        super(
            new Map<string, PrefixParser>()
                .set("<IDENT>", IDENT_PARSER)
                .set("<NUMBER>", CONST_PARSER)
                .set("<STRING>", CONST_PARSER)
                .set("<BLOCK_PAREN>", PAREN_PARSER)
                .set("<BLOCK_BRACE>", BLOCK_PARSER)
                .set("<BLOCK_INDENT>", BLOCK_PARSER)
                .set("<BLOCK_BRACKET>", PANIC_PARSER),
            new Map<string, PostfixParser>(),
        )
        this.binaryOp("+", 1, ADD)
        this.binaryOp("-", 1, SUB)
        this.binaryOp("*", 2, MUL)
        this.binaryOp("/", 2, DIV)
        this.binaryOp("%", 2, MOD)
        this.binaryOp("^", 3, POW)
        this.binaryOp("==", 0.9, (a, b) => a === b)
        this.binaryOp("!=", 0.9, (a, b) => a !== b)
        this.binaryOp(">", 0.9, (a, b) => a > b)
        this.binaryOp(">=", 0.9, (a, b) => a >= b)
        this.binaryOp("<", 0.9, (a, b) => a < b)
        this.binaryOp("<=", 0.9, (a, b) => a <= b)
        this.binaryOp("..", 0.9, (a, b) => rangeIterable(a, b))
        this.postfix.set("=", ASSIGN_PARSER)
        this.postfix.set("+=", doAndAssign(0.8, ADD))
        this.postfix.set("-=", doAndAssign(0.8, SUB))
        this.postfix.set("*=", doAndAssign(0.8, MUL))
        this.postfix.set("/=", doAndAssign(0.8, DIV))
        this.postfix.set("%=", doAndAssign(0.8, MOD))
        this.postfix.set("^=", doAndAssign(0.8, POW))

        this.unaryOp("-", (a) => -a)
        this.unaryOp("+", (a) => +a)
        this.unaryOp("!", (a) => !a)

        this.macro("print", PRINT_PARSER)
        this.macro("let", LET_PARSER)
        this.macro("if", IF_PARSER)
        this.macro("while", WHILE_PARSER)
        this.macro("for", FOR_PARSER)
    }

    binaryOp(value: string, precedence: number, fun: BinaryFun) {
        if (this.postfix.has(value)) {
            panic(`Cannot redefine binary op '${value}'`)
        }
        this.postfix.set(value, binaryOpParser(precedence, fun))
    }

    unaryOp(value: string, fun: (x: any) => any) {
        if (this.prefix.has(value)) {
            panic(`Cannot redefine unary op '${value}'`)
        }
        this.prefix.set(value, unaryOpParser(fun))
    }

    macro(value: string, parser: PrefixParser) {
        if (this.prefix.has(value)) {
            panic(`Cannot redefine macro '${value}'`)
        }
        this.prefix.set(value, parser)
    }
}

function* rangeIterable(start: number, stop: number) {
    for (let i = start; i <= stop; i++) {
        yield i
    }
}

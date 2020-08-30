import { Parser } from "./parser"
import { assignParser } from "./syntax/assign"
import { binaryOpParser } from "./syntax/binary-op"
import { BLOCK_PARSER } from "./syntax/block"
import { callParser } from "./syntax/call"
import { CONST_PARSER } from "./syntax/const"
import { doAndAssign } from "./syntax/do-and-assign"
import { FOR_PARSER } from "./syntax/for"
import { FUN_PARSER } from "./syntax/fun"
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
import { precedence } from "./utils/relative-prec"

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
        const prec = precedence()

        this.binaryOp(prec("+").moreThan("MIN"), ADD)
        this.binaryOp(prec("-").sameAs("+"), SUB)
        this.binaryOp(prec("*").moreThan("+"), MUL)
        this.binaryOp(prec("/").sameAs("*"), DIV)
        this.binaryOp(prec("%").sameAs("*"), MOD)
        this.binaryOp(prec("^").moreThan("*"), POW)
        this.binaryOp(prec("==").lessThan("+"), (a, b) => a === b)
        this.binaryOp(prec("!=").sameAs("=="), (a, b) => a !== b)
        this.binaryOp(prec(">").sameAs("=="), (a, b) => a > b)
        this.binaryOp(prec(">=").sameAs("=="), (a, b) => a >= b)
        this.binaryOp(prec("<").sameAs("=="), (a, b) => a < b)
        this.binaryOp(prec("<=").sameAs("=="), (a, b) => a <= b)
        this.binaryOp(prec("..").lessThan("+"), (a, b) => rangeIterable(a, b))

        this.postfix.set(
            "<BLOCK_PAREN>",
            callParser(prec("<CALL>").moreThan("^")[1]),
        )

        this.postfix.set("=", assignParser(prec("=").lessThan("+")[1]))
        this.doAndAssign(prec("+=").sameAs("="), ADD)
        this.doAndAssign(prec("-=").sameAs("="), SUB)
        this.doAndAssign(prec("*=").sameAs("="), MUL)
        this.doAndAssign(prec("/=").sameAs("="), DIV)
        this.doAndAssign(prec("%=").sameAs("="), MOD)
        this.doAndAssign(prec("^=").sameAs("="), POW)

        this.unaryOp("-", (a) => -a)
        this.unaryOp("+", (a) => +a)
        this.unaryOp("!", (a) => !a)

        this.macro("print", PRINT_PARSER)
        this.macro("let", LET_PARSER)
        this.macro("if", IF_PARSER)
        this.macro("while", WHILE_PARSER)
        this.macro("for", FOR_PARSER)
        this.macro("fun", FUN_PARSER)
    }

    doAndAssign([name, precedence]: [string, number], fun: BinaryFun) {
        if (this.postfix.has(name)) {
            panic(`Cannot redefine binary op '${name}'`)
        }
        this.postfix.set(name, doAndAssign(precedence, fun))
    }

    binaryOp([name, precedence]: [string, number], fun: BinaryFun) {
        if (this.postfix.has(name)) {
            panic(`Cannot redefine binary op '${name}'`)
        }
        this.postfix.set(name, binaryOpParser(precedence, fun))
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

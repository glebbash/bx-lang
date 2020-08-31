import { BValue } from "./engine/engine"
import { BNumber, bool, BRange } from "./engine/prelude"
import { Parser } from "./parser"
import { assign } from "./syntax/assign"
import { binaryOp } from "./syntax/binary-op"
import { BLOCK } from "./syntax/block"
import { call } from "./syntax/call"
import { define } from "./syntax/define"
import { doAndAssign } from "./syntax/do-and-assign"
import { FOR } from "./syntax/for"
import { FUN } from "./syntax/fun"
import { IDENT } from "./syntax/ident"
import { IF } from "./syntax/if"
import { LITERAL } from "./syntax/literal"
import { PAREN } from "./syntax/paren"
import { PostfixParser } from "./syntax/postfix-op"
import { PrefixParser } from "./syntax/prefix-op"
import { PRINT } from "./syntax/print"
import { RETURN } from "./syntax/return"
import { TODO } from "./syntax/todo"
import { unaryOp } from "./syntax/unary-op"
import { WHILE } from "./syntax/while"
import { BinaryFun } from "./utils/binary-fun"
import { panic } from "./utils/panic"
import { precedence } from "./utils/relative-prec"

function num(val: BValue): number {
    return val.as(BNumber).data
}

const ADD: BinaryFun = (a, b) => new BNumber(num(a) + num(b))
const SUB: BinaryFun = (a, b) => new BNumber(num(a) - num(b))
const MUL: BinaryFun = (a, b) => new BNumber(num(a) * num(b))
const DIV: BinaryFun = (a, b) => new BNumber(num(a) / num(b))
const MOD: BinaryFun = (a, b) => new BNumber(num(a) % num(b))
const POW: BinaryFun = (a, b) => new BNumber(num(a) ** num(b))

export class BlocksParser extends Parser {
    constructor() {
        super(
            new Map<string, PrefixParser>()
                .set("<IDENT>", IDENT)
                .set("<NUMBER>", LITERAL)
                .set("<STRING>", LITERAL)
                .set("<BLOCK_PAREN>", PAREN)
                .set("<BLOCK_BRACE>", BLOCK)
                .set("<BLOCK_INDENT>", BLOCK)
                .set("<BLOCK_BRACKET>", TODO),
            new Map<string, PostfixParser>(),
        )
        const prec = precedence()

        this.binaryOp(prec("+").moreThan("MIN"), ADD)
        this.binaryOp(prec("-").sameAs("+"), SUB)
        this.binaryOp(prec("*").moreThan("+"), MUL)
        this.binaryOp(prec("/").sameAs("*"), DIV)
        this.binaryOp(prec("%").sameAs("*"), MOD)
        this.binaryOp(prec("^").moreThan("*"), POW, true)
        this.binaryOp(prec("==").lessThan("+"), (a, b) => bool(a.equals(b)))
        this.binaryOp(prec("!=").sameAs("=="), (a, b) => bool(!a.equals(b)))
        this.binaryOp(prec(">").sameAs("=="), (a, b) => bool(num(a) > num(b)))
        this.binaryOp(prec(">=").sameAs("=="), (a, b) => bool(num(a) >= num(b)))
        this.binaryOp(prec("<").sameAs("=="), (a, b) => bool(num(a) < num(b)))
        this.binaryOp(prec("<=").sameAs("=="), (a, b) => bool(num(a) <= num(b)))
        this.binaryOp(
            prec("..").lessThan("+"),
            (a, b) => new BRange(num(a), num(b)),
        )

        this.postfix.set("<BLOCK_PAREN>", call(prec("<CALL>").moreThan("^")[1]))

        this.postfix.set("=", assign(prec("=").lessThan("+")[1]))
        this.doAndAssign(prec("+=").sameAs("="), ADD)
        this.doAndAssign(prec("-=").sameAs("="), SUB)
        this.doAndAssign(prec("*=").sameAs("="), MUL)
        this.doAndAssign(prec("/=").sameAs("="), DIV)
        this.doAndAssign(prec("%=").sameAs("="), MOD)
        this.doAndAssign(prec("^=").sameAs("="), POW)

        this.unaryOp("-", (a) => -a)
        this.unaryOp("+", (a) => +a)
        this.unaryOp("!", (a) => !a)

        this.macro("print", PRINT)
        this.macro("let", define(false))
        this.macro("const", define(true))
        this.macro("if", IF)
        this.macro("while", WHILE)
        this.macro("for", FOR)
        this.macro("return", RETURN)
        this.macro("fun", FUN)
    }

    doAndAssign([name, precedence]: [string, number], fun: BinaryFun) {
        if (this.postfix.has(name)) {
            panic(`Cannot redefine binary op '${name}'`)
        }
        this.postfix.set(name, doAndAssign(precedence, fun))
    }

    binaryOp([name, precedence]: [string, number], fun: BinaryFun, rightAssoc = false) {
        if (this.postfix.has(name)) {
            panic(`Cannot redefine binary op '${name}'`)
        }
        this.postfix.set(name, binaryOp(precedence, fun, rightAssoc))
    }

    unaryOp(value: string, fun: (x: any) => any) {
        if (this.prefix.has(value)) {
            panic(`Cannot redefine unary op '${value}'`)
        }
        this.prefix.set(value, unaryOp(fun))
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

import { Action, Atom, Expression } from "./core"
import { BValue } from "./engine/engine"
import {
    BArray,
    BBoolean,
    BNumber,
    BObject,
    bool,
    BRange,
    BString,
    FALSE,
    TRUE
} from "./engine/prelude"
import { Parser } from "./parser"
import { ARRAY } from "./syntax/array"
import { assign } from "./syntax/assign"
import { ASYNC } from "./syntax/async"
import { AWAIT } from "./syntax/await"
import { binaryOp } from "./syntax/binary-op"
import { BREAK } from "./syntax/break"
import { call } from "./syntax/call"
import { CONTINUE } from "./syntax/continue"
import { define } from "./syntax/define"
import { doAndAssign } from "./syntax/do-and-assign"
import { dot } from "./syntax/dot"
import { doubleSemi } from "./syntax/double-semi"
import { element } from "./syntax/element"
import { EXPORT } from "./syntax/export"
import { FOR } from "./syntax/for"
import { FUN } from "./syntax/fun"
import { GEN } from "./syntax/gen"
import { IDENT } from "./syntax/ident"
import { IF } from "./syntax/if"
import { IMPORT } from "./syntax/import"
import { INDENT } from "./syntax/indent"
import { is } from "./syntax/is"
import { literal, LITERAL } from "./syntax/literal"
import { OBJECT } from "./syntax/object"
import { PAREN } from "./syntax/paren"
import { RETURN } from "./syntax/return"
import { unaryOp } from "./syntax/unary-op"
import { WHILE } from "./syntax/while"
import { YIELD } from "./syntax/yield"
import { BinaryFun } from "./utils/binary-fun"
import { format, formatN } from "./utils/format"
import { panic } from "./utils/panic"
import { precedence } from "./utils/relative-prec"

function num(val: BValue): number {
    return val.as(BNumber).data
}

const ADD: BinaryFun = (a, b) => {
    if (a.is(BString)) {
        return new BString(a.data + b.toString())
    }
    return new BNumber(num(a) + num(b))
}
const SUB: BinaryFun = (a, b) => new BNumber(num(a) - num(b))
const MUL: BinaryFun = (a, b) => {
    if (a.is(BString)) {
        return new BString(a.data.repeat(b.as(BNumber).data))
    }
    return new BNumber(num(a) * num(b))
}
const DIV: BinaryFun = (a, b) => new BNumber(num(a) / num(b))
const MOD: BinaryFun = (a, b) => {
    if (a.is(BString)) {
        const template = a.data
        if (b.is(BObject)) {
            return new BString(formatN(template, b.data))
        } else {
            return new BString(format(template, ...b.as(BArray).data))
        }
    }
    return new BNumber(num(a) % num(b))
}
const POW: BinaryFun = (a, b) => new BNumber(num(a) ** num(b))

export class BlocksParser extends Parser<Expression> {
    constructor() {
        super(
            new Map<string, Atom<Expression>>()
                .set("<IDENT>", IDENT)
                .set("<NUMBER>", LITERAL)
                .set("<STRING>", LITERAL)
                .set("<BLOCK_PAREN>", PAREN)
                .set("<BLOCK_BRACKET>", ARRAY)
                .set("<BLOCK_BRACE>", OBJECT),
            new Map<string, Action<Expression>>(),
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
        this.binaryOp(prec("and").lessThan("=="), (a, b) =>
            bool(a.as(BBoolean).data && b.as(BBoolean).data),
        )
        this.binaryOp(prec("or").sameAs("and"), (a, b) =>
            bool(a.as(BBoolean).data && b.as(BBoolean).data),
        )

        ////

        this.postfix.set("<BLOCK_PAREN>", call(prec("<CALL>").moreThan("^")[1]))
        this.postfix.set(
            "<BLOCK_BRACKET>",
            element(prec("<ELEM>").sameAs("<CALL>")[1]),
        )
        this.postfix.set("<BLOCK_INDENT>", INDENT)

        this.postfix.set("is", is(prec("is").sameAs("+")[1]))

        this.postfix.set(".", dot(prec(".").moreThan("^")[1]))
        this.postfix.set("::", doubleSemi(prec("::").sameAs(".")[1]))

        this.postfix.set("=", assign(prec("=").lessThan("+")[1]))
        this.doAndAssign(prec("+=").sameAs("="), ADD)
        this.doAndAssign(prec("-=").sameAs("="), SUB)
        this.doAndAssign(prec("*=").sameAs("="), MUL)
        this.doAndAssign(prec("/=").sameAs("="), DIV)
        this.doAndAssign(prec("%=").sameAs("="), MOD)
        this.doAndAssign(prec("^=").sameAs("="), POW)

        ////

        this.unaryOp("-", (a) => new BNumber(-num(a)))
        this.unaryOp("+", (a) => a)
        this.unaryOp("!", (a) => bool(a !== TRUE))

        ////

        this.macro("true", literal(TRUE))
        this.macro("false", literal(FALSE))

        this.macro("let", define(false))
        this.macro("const", define(true))

        this.macro("if", IF)

        this.macro("while", WHILE)
        this.macro("for", FOR)
        this.macro("break", BREAK)
        this.macro("continue", CONTINUE)

        this.macro("fun", FUN)
        this.macro("return", RETURN)

        this.macro("gen", GEN)
        this.macro("yield", YIELD)

        this.macro("async", ASYNC)
        this.macro("await", AWAIT)

        this.macro("export", EXPORT)
        this.macro("import", IMPORT)
    }

    doAndAssign([name, precedence]: [string, number], fun: BinaryFun) {
        if (this.postfix.has(name)) {
            panic(`Cannot redefine binary op '${name}'`)
        }
        this.postfix.set(name, doAndAssign(precedence, fun))
    }

    binaryOp(
        [name, precedence]: [string, number],
        fun: BinaryFun,
        rightAssoc = false,
    ) {
        if (this.postfix.has(name)) {
            panic(`Cannot redefine binary op '${name}'`)
        }
        this.postfix.set(name, binaryOp(precedence, fun, rightAssoc))
    }

    unaryOp(value: string, fun: (x: BValue) => BValue) {
        if (this.prefix.has(value)) {
            panic(`Cannot redefine unary op '${value}'`)
        }
        this.prefix.set(value, unaryOp(fun))
    }

    macro(value: string, parser: Atom<Expression>) {
        if (this.prefix.has(value)) {
            panic(`Cannot redefine macro '${value}'`)
        }
        this.prefix.set(value, parser)
    }
}

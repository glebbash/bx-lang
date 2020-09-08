import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BBreak, BContinue, BReturn, VOID } from "../engine/prelude"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { Callback, Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export function blockOrExpr(parser: Parser): Expression {
    return isBlock(parser.next(false)) ? expectBlock(parser) : parser.parse()
}
export function isBlock(token: Token): boolean {
    return token.type === "block_brace" || token.type === "block_indent"
}

export function expectBlock(parser: Parser): BlockExpr {
    const token = parser.next()

    return isBlock(token) ? BLOCK(parser, token) : parser.unexpectedToken(token)
}

export const BLOCK: PrefixParser<BlockExpr> = (
    parser: Parser,
    token: Token,
) => {
    const exprs = token.value as Expr[]
    return new BlockExpr(
        exprs.map((expr) => parser.subParser(expr).parseToEnd()),
    )
}

export function seq(
    ctx: Context,
    arr: Expression[],
    cycle: (value: BValue, err: Error | undefined, next: () => void) => void,
    ret: (full: boolean) => any,
) {
    let i = 0
    const next = () => {
        if (i >= arr.length) {
            return ret(true)
        }
        arr[i].eval(ctx, (val, err) => {
            i++
            cycle(val, err, next)
        })
    }
    next()
}

export class BlockExpr implements Expression {
    constructor(private body: Expression[]) {}

    eval(ctx: Context, cb: Callback) {
        let res: BValue = VOID
        seq(
            ctx,
            this.body,
            (val, err, next) => {
                if (err) return cb(VOID, err)
                res = val
                if (res.is(BReturn) || res.is(BBreak) || res.is(BContinue)) {
                    return cb(res)
                }
                next()
            },
            () => cb(res),
        )
    }

    toString(symbol = "", indent = ""): string {
        const bodyIndent = this.body.length > 1 ? indent + symbol : ""
        return `${indent}{\n${this.body
            .map((it) => it.toString(symbol, bodyIndent))
            .join("\n")}\n${indent}}`
    }
}

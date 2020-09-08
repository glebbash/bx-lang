import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BNumber, BString } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Callback, Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const literal = (value: BValue): PrefixParser<ConstExpr> => () =>
    new ConstExpr(value)

export const LITERAL: PrefixParser<ConstExpr> = (
    _parser: Parser,
    token: Token,
) =>
    new ConstExpr(
        token.type === "string"
            ? new BString(token.value.slice(1, -1) as string)
            : new BNumber(Number(token.value)),
    )

export class ConstExpr implements Expression {
    constructor(private value: BValue) {}

    eval(_ctx: Context, cb: Callback) {
        cb(this.value)
    }

    toString(): string {
        return this.value.toString()
    }
}

import { BValue } from "../engine/engine"
import { BNumber, BString } from "../engine/prelude"
import { Token } from "../lexer"
import { Atom, Expression, ExprParser } from "./core"

export const literal = (value: BValue): Atom<ConstExpr> => () =>
    new ConstExpr(value)

export const LITERAL: Atom<ConstExpr> = (_parser: ExprParser, token: Token) =>
    new ConstExpr(
        token.type === "string"
            ? new BString(token.value.slice(1, -1) as string)
            : new BNumber(Number(token.value)),
    )

export class ConstExpr implements Expression {
    constructor(private value: BValue) {}

    eval() {
        return this.value
    }

    toString(): string {
        return this.value.toString()
    }
}

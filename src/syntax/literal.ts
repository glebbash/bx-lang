import { BValue } from "../engine/engine"
import { BNumber, BString } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

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

    eval() {
        return this.value
    }

    toString(): string {
        return this.value.toString()
    }
}

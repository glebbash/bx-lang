import { Parser } from "../parser"
import { Token } from "../lexer"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const CONST_PARSER: PrefixParser<ConstExpr> = (
    _parser: Parser,
    token: Token,
) =>
    new ConstExpr(
        token.type === "string"
            ? token.value.slice(1, -1)
            : Number(token.value),
    )

export class ConstExpr implements Expression {
    constructor(private value: any) {}

    eval() {
        return this.value
    }

    print(): string {
        return "" + this.value
    }
}

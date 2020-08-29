import { Blocks } from "../core"
import { Parser } from "../parser"
import { Token } from "../tokenizer"
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

    eval(_core: Blocks) {
        return this.value
    }

    print(): string {
        return "" + this.value
    }
}

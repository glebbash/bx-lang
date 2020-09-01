import { Context } from "../context"
import { BValue } from "../engine/engine"
import { BArray } from "../engine/prelude"
import { Expr, Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
import { PrefixParser } from "./prefix-op"

export const ARRAY: PrefixParser<ArrayExpr> = (
    parser: Parser,
    token: Token,
) => {
    const exprs = token.value as Expr[]
    const items: Expression[] = []
    for (const expr of exprs) {
        const subParser = parser.subParser(expr)
        while (subParser.nextToken(false) !== null) {
            items.push(subParser.parse())
            if (subParser.nextToken(false) !== null) {
                subParser.expect({ value: "," })
            }
        }
    }
    return new ArrayExpr(items)
}

export class ArrayExpr implements Expression {
    constructor(public items: Expression[]) {}

    eval(ctx: Context): BValue {
        return new BArray(this.items.map((item) => item.eval(ctx)))
    }

    toString(symbol = "", indent = ""): string {
        return (
            indent +
            "[" +
            this.items.map((it) => it.toString(symbol)).join(", ") +
            "]"
        )
    }
}

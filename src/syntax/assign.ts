import { Context } from "../context"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { AssignableExpr } from "./assignable"
import { Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const assign = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, token: Token, assignable: Expression) => {
            if (!(assignable instanceof AssignableExpr)) {
                parser.unexpectedToken(token)
            }
            // right associative
            return new AssignExpr(assignable, parser.parse(precedence - 1))
        },
    )

export class AssignExpr implements Expression {
    constructor(
        private assignable: AssignableExpr,
        private value: Expression,
    ) {}

    eval(ctx: Context) {
        const value = this.value.eval(ctx)
        this.assignable.assign(ctx, value)
        return value
    }

    toString(symbol = "", indent = ""): string {
        return `${indent}${this.assignable} = ${this.value.toString(
            symbol,
            indent,
        )}`
    }
}

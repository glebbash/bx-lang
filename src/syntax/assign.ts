import { Context } from "../context"
import { VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { AssignableExpr } from "./assignable"
import { Callback, Expression } from "./expression"
import { postfixParser } from "./postfix-op"

export const assign = (precedence: number) =>
    postfixParser(precedence, (parser: Parser, token, assignable) => {
        if (!(assignable instanceof AssignableExpr) || !assignable.isValid()) {
            parser.unexpectedToken(token)
        }
        // right associative
        return new AssignExpr(assignable, parser.parse(precedence - 1))
    })

export class AssignExpr implements Expression {
    constructor(public assignable: AssignableExpr, public value: Expression) {}

    eval(ctx: Context, cb: Callback) {
        this.value.eval(ctx, (value, err) => {
            if (err) return cb(VOID, err)
            this.assignable.assign(ctx, value, (err) => {
                if (err) return cb(VOID, err)
                cb(value)
            })
        })
    }

    toString(symbol = "", indent = ""): string {
        return `${indent}${this.assignable} = ${this.value.toString(
            symbol,
            indent,
        )}`
    }
}

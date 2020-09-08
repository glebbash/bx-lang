import { Context } from "../context"
import { bool, VOID } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Callback, Expression } from "./expression"
import { expectIdent } from "./ident"
import { postfixParser } from "./postfix-op"

export const is = (precedence: number) =>
    postfixParser(
        precedence,
        (parser: Parser, _token: Token, val: Expression) => {
            const type = expectIdent(parser, true).name
            return new IsExpr(val, type)
        },
    )

export class IsExpr implements Expression {
    constructor(private val: Expression, private type: string) {}

    eval(ctx: Context, cb: Callback) {
        this.val.eval(ctx, (val, err) => {
            if (err) return cb(VOID, err)
            cb(bool(val.type === this.type))
        })
    }

    toString(symbol = "", indent = ""): string {
        return `${this.val.toString(symbol, indent)} is ${this.type}`
    }
}

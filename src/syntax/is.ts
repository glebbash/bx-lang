import { Context } from "../context"
import { bool } from "../engine/prelude"
import { Token } from "../lexer"
import { Parser } from "../parser"
import { Expression } from "./expression"
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

    eval(ctx: Context) {
        return bool(this.val.eval(ctx).type === this.type)
    }

    toString(symbol = "", indent = ""): string {
        return `${this.val.toString(symbol, indent)} is ${this.type}`
    }
}

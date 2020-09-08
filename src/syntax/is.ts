import { action, Context, Expression } from "../core"
import { bool } from "../engine/prelude"
import { Token } from "../lexer"
import { expectIdent } from "./ident"

export const is = (precedence: number) =>
    action(precedence, (parser, _token: Token, val: Expression) => {
        const type = expectIdent(parser, true).name
        return new IsExpr(val, type)
    })

export class IsExpr implements Expression {
    constructor(private val: Expression, private type: string) {}

    eval(ctx: Context) {
        return bool(this.val.eval(ctx).type === this.type)
    }

    toString(symbol = "", indent = ""): string {
        return `${this.val.toString(symbol, indent)} is ${this.type}`
    }
}

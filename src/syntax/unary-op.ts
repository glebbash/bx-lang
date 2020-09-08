import { Context } from "../context"
import { BValue } from "../engine/engine"
import { Token } from "../lexer"
import { Atom, Expression, ExprParser } from "./core"

export const unaryOp = (fun: (x: BValue) => BValue): Atom<UnaryOpExpr> => (
    parser: ExprParser,
    token: Token,
) => {
    const expr = parser.parse()
    return new UnaryOpExpr(token.value as string, expr, fun)
}

export class UnaryOpExpr implements Expression {
    constructor(
        private operator: string,
        private expr: Expression,
        private fun: (x: BValue) => BValue,
    ) {}

    eval(ctx: Context) {
        return this.fun(this.expr.eval(ctx))
    }

    toString(symbol = "", indent = ""): string {
        return this.operator + this.expr.toString(symbol, indent)
    }
}

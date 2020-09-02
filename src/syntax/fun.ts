import { Context, subContext } from "../context"
import { BValue } from "../engine/engine"
import { BFunction, BReturn, VOID } from "../engine/prelude"
import { Parser } from "../parser"
import { syntaxError } from "../utils/syntax-error"
import { ARRAY } from "./array"
import { blockOrExpr } from "./block"
import { Expression } from "./expression"
import { IDENT, IdentExpr } from "./ident"
import { PrefixParser } from "./prefix-op"

export const FUN: PrefixParser<FunExpr> = (parser: Parser) => {
    const name = parser.nextIs({ complexType: "<IDENT>" })
        ? IDENT(parser, parser.next()).name
        : null

    const paramsToken = parser.expect({ type: "block_paren" })
    const paramsExpr = ARRAY(parser, paramsToken)
    const params = paramsExpr.items.map((paramExpr) => {
        if (paramExpr instanceof IdentExpr) {
            return paramExpr.name
        }
        syntaxError("Invalid function params", paramsToken.start)
    })

    const body = blockOrExpr(parser)

    return new FunExpr(name, params, body)
}

export class FunExpr implements Expression {
    constructor(
        public name: string | null,
        private params: string[],
        private body: Expression,
    ) {}

    eval(ctx: Context) {
        const fun = new BFunction((...args: BValue[]) => {
            const funCtx = subContext(ctx)
            for (let i = 0; i < this.params.length; i++) {
                if (i < args.length) {
                    funCtx.scope.define(this.params[i], args[i])
                }
            }
            const res = this.body.eval(funCtx)
            return res.is(BReturn) ? res.data : res
        })

        if (this.name === null) {
            return fun
        }
        ctx.scope.define(this.name, fun)
        return VOID
    }

    toString(symbol = "", indent = ""): string {
        return `fun${this.name ? " " + this.name : ""}(${this.params.join(
            ", ",
        )}) ${this.body.toString(symbol, indent)}`
    }
}
